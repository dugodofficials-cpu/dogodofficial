import 'reflect-metadata';
import ProductService from '@/modules/products/products.service';
import orderModel from '@/modules/orders/orders.model';
import { OrderStatus } from '@/modules/orders/orders.interface';
import { PaymentStatus } from '@/modules/payments/payments.interface';

jest.mock('@/modules/orders/orders.model', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

describe('ProductService.verifyUserProductAccess', () => {
  it('allows access when the order has been paid and is not cancelled or deleted', async () => {
    const service = new ProductService();
    (orderModel.findOne as jest.Mock).mockResolvedValue({ _id: 'order-1' });

    const hasAccess = await service.verifyUserProductAccess('user-1', 'product-1');

    expect(hasAccess).toBe(true);
    expect(orderModel.findOne).toHaveBeenCalledWith({
      user: 'user-1',
      'items.product': 'product-1',
      status: { $nin: [OrderStatus.CANCELLED, OrderStatus.DELETED] },
      $or: [
        { status: { $ne: OrderStatus.PENDING } },
        { paymentStatus: PaymentStatus.COMPLETED },
      ],
    });
  });

  it('rejects access when no qualifying order exists', async () => {
    const service = new ProductService();
    (orderModel.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.verifyUserProductAccess('user-1', 'product-1')).resolves.toBe(false);
  });
});
