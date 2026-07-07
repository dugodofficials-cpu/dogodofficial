import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@backend/exceptions/HttpException';
import { PaymentService } from '../payments.service';
import OrderService from '@backend/orders/orders.service';
import { OrderStatus } from '@backend/orders/orders.interface';
import { PaymentStatus, PaymentChannel, PaymentProvider, PaymentDetails, PaystackWebhookData } from '@backend/payments/payments.interface';
import { PaymentModel, PaymentTransactionModel } from '@backend/payments/payments.model';
import CartService from '@backend/cart/cart.service';
import { CartStatus } from '@backend/cart/cart.interface';
import { logger } from '@backend/utils/logger';
import UsersService from '@backend/users/users.service';
import { User } from '@backend/users/users.interface';
export class PaystackWebhookHandler {
  private readonly webhookSecret: string;
  private readonly paymentService: PaymentService;
  private readonly orderService: OrderService;
  private readonly cartService: CartService;
  private readonly userService: UsersService;
  constructor() {
    this.webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.webhookSecret) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is required');
    }
    this.paymentService = new PaymentService();
    this.orderService = new OrderService();
    this.cartService = new CartService();
    this.userService = new UsersService();
  }
  private verifySignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }
  public async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-paystack-signature'];
      if (!signature) {
        throw new HttpException(400, 'Missing Paystack signature');
      }
      const payload = JSON.stringify(req.body);
      if (!this.verifySignature(payload, signature as string)) {
        throw new HttpException(401, 'Invalid signature');
      }
      const event = req.body;
      logger.info(`Processing Paystack webhook event: ${event.event}`, {
        event: event.event,
        reference: event.data.reference,
      });
      switch (event.event) {
        case 'charge.success':
          await this.handleSuccessfulCharge(event.data);
          break;
        case 'transfer.success':
          break;
        case 'transfer.failed':
          break;
        default:
          logger.info(`Unhandled Paystack webhook event: ${event.event}`);
      }
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
  public async handleSupportedMovement(data: PaystackWebhookData): Promise<void> {
    try {
      const transaction = await PaymentTransactionModel.findOneAndUpdate(
        { reference: data.reference },
        {
          provider: PaymentProvider.PAYSTACK,
          reference: data.reference,
          amount: {
            value: data.amount / 100,
            currency: data.currency,
          },
          customer: {
            email: data.customer.email,
            firstName: data.customer.first_name,
            lastName: data.customer.last_name,
            metadata: data.customer.metadata,
          },
          metadata: {
            orderId: 'supported_movement',
            ...data.metadata,
          },
          status: PaymentStatus.COMPLETED,
          paymentMethod: {
            type: data.channel.toLowerCase() as PaymentChannel,
          },
          providerFee: data.fees / 100,
          settlementAmount: (data.amount - data.fees) / 100,
          gatewayResponse: data.gateway_response,
          ipAddress: data.ip_address,
          currency: data.currency,
          channel: data.channel.toLowerCase() as PaymentChannel,
          paidAt: new Date(data.paid_at),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
      return;
    } catch (error) {
      logger.error('Error handling supported movement', {
        error,
        reference: data.reference,
      });
      return;
    }
  }
  private async handleSuccessfulCharge(data: PaystackWebhookData): Promise<void> {
    try {
      logger.info(`Handling successful charge: ${JSON.stringify(data)}`);
      const orderId = data.metadata?.custom_fields.find(field => field.variable_name === 'order_id')?.value;
      const supportMovement = data.metadata?.custom_fields.find(field => field.variable_name === 'support_type')?.value
      if (supportMovement) {
        await this.handleSupportedMovement(data);
        return;
      }
      if (!orderId) {
        logger.warn('No order ID found in payment metadata');
        return;
      }
      const order = await this.orderService.findOrderById(orderId);
      if (!order) {
        throw new HttpException(404, `Order ${orderId} not found`);
      }

      const paidAmount = data.amount / 100;
      const expectedAmount = Number(order.total);
      const amountMatches = Number.isFinite(expectedAmount) && Math.abs(paidAmount - expectedAmount) < 0.01;

      const expectedCurrency = 'NGN';
      const currencyMatches = typeof data.currency === 'string' && expectedCurrency.toUpperCase() === data.currency.toUpperCase();
      if (!amountMatches || !currencyMatches) {
        logger.error('Paystack webhook amount/currency mismatch - refusing to confirm order', {
          orderId,
          reference: data.reference,
          paidAmount,
          expectedAmount,
          paidCurrency: data.currency,
          expectedCurrency,
        });
        return;
      }
      const transaction = await PaymentTransactionModel.findOneAndUpdate(
        { reference: data.reference },
        {
          provider: PaymentProvider.PAYSTACK,
          reference: data.reference,
          amount: {
            value: data.amount / 100,
            currency: data.currency,
          },
          customer: {
            email: data.customer.email,
            firstName: data.customer.first_name,
            lastName: data.customer.last_name,
            metadata: data.customer.metadata,
          },
          metadata: {
            orderId,
            ...data.metadata,
          },
          status: PaymentStatus.COMPLETED,
          paymentMethod: {
            type: data.channel.toLowerCase() as PaymentChannel,
          },
          providerFee: data.fees / 100,
          settlementAmount: (data.amount - data.fees) / 100,
          gatewayResponse: data.gateway_response,
          ipAddress: data.ip_address,
          currency: data.currency,
          channel: data.channel.toLowerCase() as PaymentChannel,
          paidAt: new Date(data.paid_at),
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
      const paymentDetails: PaymentDetails = {
        method: {
          type: data.channel.toLowerCase() as PaymentChannel,
        },
        provider: PaymentProvider.PAYSTACK,
        transactionId: data.id?.toString(),
      };
      if (data.authorization) {
        paymentDetails.cardLast4 = data.authorization.last4;
        paymentDetails.cardBrand = data.authorization.brand;
        paymentDetails.cardExpiryMonth = data.authorization.exp_month;
        paymentDetails.cardExpiryYear = data.authorization.exp_year;
        paymentDetails.bankName = data.authorization.bank;
      }
      const payment = await PaymentModel.findOneAndUpdate(
        { 'metadata.reference': data.reference },
        {
          order: orderId,
          user: order.user,
          amount: data.amount / 100,
          currency: data.currency,
          status: PaymentStatus.COMPLETED,
          paymentDetails,
          metadata: {
            reference: data.reference,
            gatewayResponse: data.gateway_response,
            ipAddress: data.ip_address,
            ...data.metadata,
          },
          processedAt: new Date(data.paid_at),
          completedAt: new Date(),
          notes: `Payment completed via Paystack. Reference: ${data.reference}`,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
      const user = await this.userService.findUserById(order.user._id.toString());
      if (!user) {
        throw new HttpException(404, `User ${order.user._id.toString()} not found`);
      }
      await this.orderService.updateOrderStatus(orderId, {
        status: OrderStatus.CONFIRMED,
        paymentStatus: PaymentStatus.COMPLETED,
        notes: `Payment confirmed. Reference: ${data.reference}`,
      }, user);
      const userActiveCart = await this.cartService.findUserActiveCart(order.user._id.toString());
      if (userActiveCart) {
        await this.cartService.updateCart(userActiveCart._id.toString(), {
          status: CartStatus.CONVERTED_TO_ORDER,
          notes: `Cart converted to order ${order.orderNumber}. Payment reference: ${data.reference}`,
        });
      }
      logger.info('Successfully processed payment and updated order', {
        reference: data.reference,
        orderId,
        paymentId: payment._id,
        transactionId: transaction._id,
        cartId: userActiveCart?._id,
      });
    } catch (error) {
      logger.error('Error processing successful charge webhook', {
        error,
        reference: data.reference,
      });
      throw error;
    }
  }
}
export const paystackWebhookHandler = new PaystackWebhookHandler();