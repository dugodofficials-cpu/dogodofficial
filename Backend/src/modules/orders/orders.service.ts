import { CreateOrderDto, UpdateDeliveryStatusDto, UpdateOrderDto, UpdateOrderStatusDto, GetOrdersQueryDto } from '@/modules/orders/orders.dto';
import { DeliveryStatus, Order, OrderStatus } from '@/modules/orders/orders.interface';
import orderModel from '@/modules/orders/orders.model';
import { ProductType } from '@/modules/products/products.interface';
import productModel from '@/modules/products/products.model';
import { HttpException } from '@exceptions/HttpException';
import { isEmpty } from '@utils/util';
import cartService from '../cart/cart.service';
import couponService from '../coupons/coupons.service';
import OrderEmailService from './order-email.service';
import { User } from '@/modules/users/users.interface';
import ShippingService from '../shipping/shipping.service';
class OrderService {
  public orders = orderModel;
  public products = productModel;
  public cartService = new cartService();
  public shippingService = new ShippingService();
  public couponService = new couponService();
  private orderEmailService = new OrderEmailService();
  public async findAllOrders(query: GetOrdersQueryDto = {}): Promise<{ orders: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      userId,
      startDate,
      endDate,
      minTotal,
      maxTotal,
      sortBy = 'orderedAt',
      sortOrder = 'desc',
    } = query;
    const filter: any = {};
    if (status) {
      if (status === OrderStatus.DELETED) {
        filter.status = OrderStatus.DELETED;
      } else {
        filter.status = status;
      }
    } else {
      filter.status = { $ne: OrderStatus.DELETED };
    }
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingDetails.address': { $regex: search, $options: 'i' } },
        { 'shippingDetails.city': { $regex: search, $options: 'i' } },
        { 'shippingDetails.country': { $regex: search, $options: 'i' } },
      ];
    }
    if (userId) filter.user = userId;
    if (startDate || endDate) {
      filter.orderedAt = {};
      if (startDate) filter.orderedAt.$gte = startDate;
      if (endDate) filter.orderedAt.$lte = endDate;
    }
    if (minTotal !== undefined || maxTotal !== undefined) {
      filter.total = {};
      if (minTotal !== undefined) filter.total.$gte = minTotal;
      if (maxTotal !== undefined) filter.total.$lte = maxTotal;
    }
    const sort: any = {
      [sortBy]: sortOrder === 'desc' ? -1 : 1,
    };
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orders
        .find(filter)
        .populate('user')
        .populate('items.product')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      this.orders.countDocuments(filter),
    ]);
    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  public async findOrderById(orderId: string, includeDeleted: boolean = false): Promise<Order> {
    if (isEmpty(orderId)) throw new HttpException(400, 'OrderId is empty');
    const filter: any = { _id: orderId };
    if (!includeDeleted) {
      filter.status = { $ne: OrderStatus.DELETED };
    }
    const findOrder: Order = await this.orders.findOne(filter).populate('user').populate('items.product');
    if (!findOrder) throw new HttpException(409, "Order doesn't exist");
    return findOrder;
  }
  public async findOrderByNumber(orderNumber: string, includeDeleted: boolean = false): Promise<Order> {
    if (isEmpty(orderNumber)) throw new HttpException(400, 'Order number is empty');
    const filter: any = { orderNumber };
    if (!includeDeleted) {
      filter.status = { $ne: OrderStatus.DELETED };
    }
    const findOrder: Order = await this.orders.findOne(filter).populate('user').populate('items.product');
    if (!findOrder) throw new HttpException(409, "Order doesn't exist");
    return findOrder;
  }
  public async resendOrderConfirmation(orderId: string): Promise<void> {
    const order = await this.orders.findById(orderId).populate('user').populate('items.product');
    if (!order) throw new HttpException(409, "Order doesn't exist");
    await this.orderEmailService.sendOrderConfirmation(order, order.user);
  }
  public async orderStatistics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    totalProductsSold: number;
    totalCustomers: number;
    totalRefunds: number;
    totalPendingOrders: number;
  }> {
    const totalOrders = await this.orders.countDocuments();
    const totalRevenue = await this.orders.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalProductsSold = await this.orders.aggregate([
      { $unwind: '$items' },
      { $group: { _id: null, total: { $sum: '$items.quantity' } } }
    ]);
    const totalCustomers = await this.orders.distinct('user');
    const totalRefunds = await this.orders.countDocuments({ status: OrderStatus.REFUNDED });
    const totalPendingOrders = await this.orders.countDocuments({ status: OrderStatus.PENDING });
    return {
      totalOrders,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      totalProductsSold: totalProductsSold.length > 0 ? totalProductsSold[0].total : 0,
      totalCustomers: totalCustomers.length,
      totalRefunds,
      totalPendingOrders
    };
  }
  public async createOrder(orderData: CreateOrderDto): Promise<Order> {
    if (isEmpty(orderData)) throw new HttpException(400, 'orderData is empty');
    let cartDiscount = 0;
    let couponCode = null;
    const cart = await this.cartService.findCartByUserId(orderData.user);
    if (!cart) {
      throw new HttpException(404, 'Cart not found');
    }
    couponCode = cart.discounts[0]?.code;
    cartDiscount = cart.discounts.reduce((sum, discount) => {
      if (discount.type === 'PERCENTAGE') {
        const discountAmount = cart.subtotal * (discount.value / 100);
        return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
      } else {
        return sum + discount.value;
      }
    }, 0);
    const processedItems = await Promise.all(orderData.items.map(async item => {
      const product = await this.products.findById(item.product);
      if (!product) throw new HttpException(404, `Product ${item.product} not found`);
      return { ...item, product };
    }));
    const hasPhysicalItems = processedItems.some(item => item.product.type === ProductType.PHYSICAL);
    const hasDigitalItems = processedItems.some(item => item.product.type === ProductType.DIGITAL);
    if (hasPhysicalItems && !orderData.shippingDetails) {
      throw new HttpException(400, 'Shipping details required for physical items');
    }
    orderData.shippingCost = hasPhysicalItems
      ? await this.shippingService.calculateShippingRate(orderData.shippingDetails)
      : 0;
    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + orderData.tax + orderData.shippingCost - (cartDiscount || orderData.discount || 0);
    const order = new this.orders({
      cartId: cart._id,
      ...orderData,
      items: processedItems,
      subtotal,
      total,
      discount: cartDiscount,
      status: OrderStatus.PENDING,
    });
    const createOrderData: Order = await order.save();
    if (hasPhysicalItems) {
      await Promise.all(
        processedItems.map(async item => {
          const product = await this.products.findById(item.product);
          if (product && product.type === ProductType.PHYSICAL) {
            product.stockQuantity -= item.quantity;
            await product.save();
          }
        }),
      );
    }
    return createOrderData;
  }
  public async updateOrder(orderId: string, orderData: UpdateOrderDto): Promise<Order> {
    if (isEmpty(orderData)) throw new HttpException(400, 'orderData is empty');
    const order = await this.findOrderById(orderId);
    if (!order) throw new HttpException(409, "Order doesn't exist");
    if ([OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)) {
      throw new HttpException(400, `Cannot update ${order.status} order`);
    }
    const updateOrderById: Order = await this.orders.findByIdAndUpdate(orderId, orderData, { new: true }).populate('user').populate('items.product');
    return updateOrderById;
  }
  public async updateOrderStatus(orderId: string, statusData: UpdateOrderStatusDto, user: User): Promise<Order> {
    const order = await this.findOrderById(orderId);
    this.validateStatusTransition(order.status, statusData.status);
    if (order.discount > 0) {
      const cart = await this.cartService.findCartById(order.cartId.toString());
      if (cart) {
        await this.couponService.incrementUsageCount(cart.discounts[0].code);
      }
    }
    const updateData: any = {
      status: statusData.status,
      notes: statusData.notes,
      paymentStatus: statusData.paymentStatus,
    };
    switch (statusData.status) {
      case OrderStatus.CONFIRMED:
        try {
          const populatedOrder = await this.orders.findById(order._id).populate('user').populate('items.product');
          await this.orderEmailService.sendOrderConfirmation(populatedOrder, populatedOrder.user);
        } catch (error) {
          console.error('Failed to send order confirmation email:', error);
        }
        await this.convertBundlesToProducts(orderId);
        break;
      case OrderStatus.PROCESSING:
        updateData.processedAt = new Date();
        break;
      case OrderStatus.SHIPPED:
        updateData.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        updateData.deliveredAt = new Date();
        break;
      case OrderStatus.DELETED:
      case OrderStatus.CANCELLED:
        updateData.cancelledAt = new Date();
        statusData.notes ? updateData.notes =
          statusData.notes :
          updateData.notes = `Order cancelled by ${user.firstName} ${user.lastName} ${user.email}`;
        await this.restoreStock(order);
        break;
    }
    const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
    await this.sendOrderStatusEmails(order, updatedOrder, order.status, updatedOrder.status, statusData.notes);
    return updatedOrder;
  }
  public async updateDeliveryStatus(orderId: string, deliveryData: UpdateDeliveryStatusDto): Promise<Order> {
    const order = await this.findOrderById(orderId);
    if (!order.shippingDetails) {
      throw new HttpException(400, 'Order has no shipping details');
    }
    const updateData = {
      'shippingDetails.deliveryStatus': deliveryData.deliveryStatus,
      'shippingDetails.deliveryNotes': deliveryData.deliveryNotes,
    };
    if (deliveryData.trackingNumber) {
      updateData['shippingDetails.trackingNumber'] = deliveryData.trackingNumber;
    }
    if (deliveryData.carrier) {
      updateData['shippingDetails.carrier'] = deliveryData.carrier;
    }
    if (deliveryData.estimatedDeliveryDate) {
      updateData['shippingDetails.estimatedDeliveryDate'] = deliveryData.estimatedDeliveryDate;
    }
    if (deliveryData.deliveryStatus === DeliveryStatus.DELIVERED) {
      updateData['status'] = OrderStatus.DELIVERED;
      updateData['deliveredAt'] = new Date();
      updateData['shippingDetails.actualDeliveryDate'] = new Date();
    }
    const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
    try {
      await this.orderEmailService.sendDeliveryUpdate(updatedOrder, updatedOrder.user, deliveryData.deliveryStatus);
    } catch (error) {
      console.error('Failed to send delivery update email:', error);
    }
    return updatedOrder;
  }
  public async deleteOrder(orderId: string): Promise<Order> {
    const order = await this.findOrderById(orderId);
    if (order.status !== OrderStatus.CANCELLED) {
      throw new HttpException(400, 'Only cancelled orders can be deleted');
    }
    const deleteOrderById: Order = await this.orders.findByIdAndDelete(orderId);
    return deleteOrderById;
  }
  public async convertBundlesToProducts(orderId: string): Promise<Order> {
    const order = await this.findOrderById(orderId);
    const items = order.items;
    for (const item of items) {
      const bundle = await this.products.findById(item.product);
      if (bundle && bundle.type === ProductType.BUNDLE) {
        for (const bundleItem of bundle.bundleItems) {
          if (bundleItem.productId) {
            const product = await this.products.findById(bundleItem.productId);
            if (product) {
              item.product = product;
            }
          }
        }
      }
    }
    const updateData = {
      items: items,
      notes: 'Bundles converted to products',
    };
    const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
    return updatedOrder;
  }
  public async processRefund(orderId: string, refundAmount: number, reason?: string): Promise<Order> {
    const order = await this.findOrderById(orderId);
    if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED) {
      throw new HttpException(400, 'Only cancelled or delivered orders can be refunded');
    }
    const updateData = {
      status: OrderStatus.REFUNDED,
      notes: reason || 'Refund processed',
      refundedAt: new Date(),
    };
    const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
    try {
      await this.orderEmailService.sendOrderRefunded(updatedOrder, updatedOrder.user, refundAmount);
    } catch (error) {
      console.error('Failed to send refund notification email:', error);
    }
    return updatedOrder;
  }
  private async restoreStock(order: Order): Promise<void> {
    await Promise.all(
      order.items.map(async item => {
        const product = await this.products.findById(item.product);
        if (product && product.type === ProductType.PHYSICAL) {
          product.stockQuantity += item.quantity;
          await product.save();
        }
      }),
    );
  }
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.DELETED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.CONFIRMED, OrderStatus.REFUNDED, OrderStatus.DELETED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.DELETED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.DELETED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [OrderStatus.DELETED],
      [OrderStatus.REFUNDED]: [OrderStatus.DELETED],
      [OrderStatus.DELETED]: [],
    };
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new HttpException(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
  private async sendOrderStatusEmails(order: Order, updatedOrder: Order, previousStatus: OrderStatus, newStatus: OrderStatus, notes?: string): Promise<void> {
    try {
      switch (newStatus) {
        case OrderStatus.PROCESSING:
          await this.orderEmailService.sendOrderProcessing(updatedOrder, updatedOrder.user);
          break;
        case OrderStatus.SHIPPED:
          await this.orderEmailService.sendOrderShipped(updatedOrder, updatedOrder.user);
          break;
        case OrderStatus.DELIVERED:
          await this.orderEmailService.sendOrderDelivered(updatedOrder, updatedOrder.user);
          break;
        case OrderStatus.CANCELLED:
          await this.orderEmailService.sendOrderCancelled(updatedOrder, updatedOrder.user, notes);
          break;
        default:
          if (previousStatus !== newStatus) {
            await this.orderEmailService.sendOrderStatusUpdate(updatedOrder, updatedOrder.user, previousStatus, newStatus);
          }
      }
    } catch (error) {
      console.error('Failed to send order status email:', error);
    }
  }
  private async checkStockAndNotify(order: Order, user: User): Promise<void> {
    try {
      for (const item of order.items) {
        const product = typeof item.product === 'string' ?
          await this.products.findById(item.product) :
          item.product;
        if (product && product.type === ProductType.PHYSICAL) {
          if (product.stockQuantity <= 5) {
            await this.orderEmailService.sendLowStockAlert(order, user, product.name);
          }
          if (product.stockQuantity === 0) {
            const estimatedRestockDate = new Date();
            estimatedRestockDate.setDate(estimatedRestockDate.getDate() + 14);
            await this.orderEmailService.sendBackorderNotification(order, user, product.name, estimatedRestockDate);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check stock and send notifications:', error);
    }
  }
  public async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = null,
    productType?: 'PHYSICAL' | 'DIGITAL',
    includeBundleItems = false,
  ): Promise<{ orders: Order[]; total: number; totalPages: number }> {
    let skip: number = 0;
    if (limit === null) {
      skip = 0;
    } else {
      skip = (page - 1) * limit;
    }
    let query: any = { user: userId, status: { $nin: [OrderStatus.CANCELLED, OrderStatus.PENDING, OrderStatus.DELETED] } };
    if (productType) {
      query = {
        ...query,
        'items.product': {
          $exists: true
        }
      };
    }
    const [orders, total] = await Promise.all([
      this.orders
        .find(query)
        .populate({
          path: 'items.product',
          match: productType === ProductType.DIGITAL ? { type: { $in: [ProductType.EBOOK, productType] } } : includeBundleItems ? { type: { $in: [productType, ProductType.BUNDLE] } } : { type: productType }
        })
        .populate('user')
        .sort({ orderedAt: -1 })
        .skip(skip)
        .limit(limit === null ? null : limit),
      this.orders.countDocuments(query)
    ]);
    const filteredOrders = productType
      ? orders.filter(order => order.items.some(item => item.product))
      : orders;
    const populateBundleItemsProducts = async () => {
      const bundleIds = new Set<string>();
      for (const order of filteredOrders) {
        for (const item of order.items) {
          if (item.product && typeof item.product === 'object' && (item.product as any).type === ProductType.BUNDLE) {
            bundleIds.add((item.product as any)._id.toString());
          }
        }
      }
      if (bundleIds.size > 0) {
        const bundles = await this.products
          .find({ _id: { $in: Array.from(bundleIds) } })
          .populate({
            path: 'bundleItems.productId',
            populate: {
              path: 'albumId',
            },
          });
        const bundleMap = new Map(bundles.map(b => [b._id.toString(), b]));
        for (const order of filteredOrders) {
          for (const item of order.items) {
            if (item.product && typeof item.product === 'object' && (item.product as any).type === ProductType.BUNDLE) {
              const bundleId = (item.product as any)._id.toString();
              const populatedBundle = bundleMap.get(bundleId);
              if (populatedBundle) {
                item.product = { ...populatedBundle, isBundle: true } as any;
              }
            }
          }
        }
      }
    };
    await populateBundleItemsProducts();
    const flattenBundleItems = () => {
      for (const order of filteredOrders) {
        const flattenedItems: any[] = [];
        for (const item of order.items) {
          if (item.product && typeof item.product === 'object' && (item.product as any).type === ProductType.BUNDLE) {
            const bundle = item.product as any;
            const bundleQuantity = item.quantity;
            flattenedItems.push({
              ...item,
              isBundle: true,
            });
            if (bundle.bundleItems && bundle.bundleItems.length) {
              for (const bundleItem of bundle.bundleItems) {
                const bundleItemQuantity = bundleItem.quantity || 1;
                const totalQuantity = bundleQuantity * bundleItemQuantity;
                if (bundleItem.productId) {
                  const product = bundleItem.productId;
                  const unitPrice = product.price || 0;
                  const itemTotal = unitPrice * totalQuantity;
                  let finalPrice = unitPrice;
                  let finalTotal = itemTotal;
                  if (bundleItem.discountPercentage && bundleItem.discountPercentage > 0) {
                    const discountAmount = (unitPrice * bundleItem.discountPercentage) / 100;
                    finalPrice = unitPrice - discountAmount;
                    finalTotal = finalPrice * totalQuantity;
                  }
                  flattenedItems.push({
                    product: product,
                    quantity: totalQuantity,
                    price: finalPrice,
                    isBundle: true,
                    total: finalTotal,
                    selectedOptions: item.selectedOptions,
                  });
                } else if (bundleItem.title) {
                  flattenedItems.push({
                    product: {
                      _id: null,
                      name: bundleItem.title,
                      title: bundleItem.title,
                      type: 'CUSTOM',
                      price: 0,
                      isCustomBundleItem: true,
                    },
                    quantity: totalQuantity,
                    price: 0,
                    isBundle: true,
                    total: 0,
                    selectedOptions: item.selectedOptions,
                    bundleItemTitle: bundleItem.title,
                  });
                }
              }
            }
          } else {
            flattenedItems.push(item);
          }
        }
        order.items = flattenedItems;
      }
    };
    flattenBundleItems();
    const filteredTotal = productType ? filteredOrders.length : total;
    const totalPages = Math.ceil(filteredTotal / limit);
    return {
      orders: filteredOrders,
      total: filteredTotal,
      totalPages
    };
  }
  public async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    const filter: any = { status };
    if (status !== OrderStatus.DELETED) {
      filter.status = { $eq: status, $ne: OrderStatus.DELETED };
    }
    return this.orders.find(filter).populate('user').populate('items.product').sort({ orderedAt: -1 });
  }
  public async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.orders
      .find({
        orderedAt: {
          $gte: startDate,
          $lte: endDate,
        },
        status: { $ne: OrderStatus.DELETED },
      })
      .populate('user')
      .populate('items.product')
      .sort({ orderedAt: -1 });
  }
}
export default OrderService;