"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const orders_interface_1 = require("../../modules/orders/orders.interface");
const orders_model_1 = tslib_1.__importDefault(require("../../modules/orders/orders.model"));
const products_interface_1 = require("../../modules/products/products.interface");
const products_model_1 = tslib_1.__importDefault(require("../../modules/products/products.model"));
const HttpException_1 = require("../../exceptions/HttpException");
const util_1 = require("../../utils/util");
const cart_service_1 = tslib_1.__importDefault(require("../cart/cart.service"));
const coupons_service_1 = tslib_1.__importDefault(require("../coupons/coupons.service"));
const order_email_service_1 = tslib_1.__importDefault(require("./order-email.service"));
const shipping_service_1 = tslib_1.__importDefault(require("../shipping/shipping.service"));
class OrderService {
    constructor() {
        this.orders = orders_model_1.default;
        this.products = products_model_1.default;
        this.cartService = new cart_service_1.default();
        this.shippingService = new shipping_service_1.default();
        this.couponService = new coupons_service_1.default();
        this.orderEmailService = new order_email_service_1.default();
    }
    async findAllOrders(query = {}) {
        const { page = 1, limit = 10, search, status, userId, startDate, endDate, minTotal, maxTotal, sortBy = 'orderedAt', sortOrder = 'desc', } = query;
        const filter = {};
        if (status) {
            if (status === orders_interface_1.OrderStatus.DELETED) {
                filter.status = orders_interface_1.OrderStatus.DELETED;
            }
            else {
                filter.status = status;
            }
        }
        else {
            filter.status = { $ne: orders_interface_1.OrderStatus.DELETED };
        }
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingDetails.address': { $regex: search, $options: 'i' } },
                { 'shippingDetails.city': { $regex: search, $options: 'i' } },
                { 'shippingDetails.country': { $regex: search, $options: 'i' } },
            ];
        }
        if (userId)
            filter.user = userId;
        if (startDate || endDate) {
            filter.orderedAt = {};
            if (startDate)
                filter.orderedAt.$gte = startDate;
            if (endDate)
                filter.orderedAt.$lte = endDate;
        }
        if (minTotal !== undefined || maxTotal !== undefined) {
            filter.total = {};
            if (minTotal !== undefined)
                filter.total.$gte = minTotal;
            if (maxTotal !== undefined)
                filter.total.$lte = maxTotal;
        }
        const sort = {
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
    async findOrderById(orderId, includeDeleted = false) {
        if ((0, util_1.isEmpty)(orderId))
            throw new HttpException_1.HttpException(400, 'OrderId is empty');
        const filter = { _id: orderId };
        if (!includeDeleted) {
            filter.status = { $ne: orders_interface_1.OrderStatus.DELETED };
        }
        const findOrder = await this.orders.findOne(filter).populate('user').populate('items.product');
        if (!findOrder)
            throw new HttpException_1.HttpException(409, "Order doesn't exist");
        return findOrder;
    }
    async findOrderByNumber(orderNumber, includeDeleted = false) {
        if ((0, util_1.isEmpty)(orderNumber))
            throw new HttpException_1.HttpException(400, 'Order number is empty');
        const filter = { orderNumber };
        if (!includeDeleted) {
            filter.status = { $ne: orders_interface_1.OrderStatus.DELETED };
        }
        const findOrder = await this.orders.findOne(filter).populate('user').populate('items.product');
        if (!findOrder)
            throw new HttpException_1.HttpException(409, "Order doesn't exist");
        return findOrder;
    }
    async resendOrderConfirmation(orderId) {
        const order = await this.orders.findById(orderId).populate('user').populate('items.product');
        if (!order)
            throw new HttpException_1.HttpException(409, "Order doesn't exist");
        await this.orderEmailService.sendOrderConfirmation(order, order.user);
    }
    async orderStatistics() {
        const totalOrders = await this.orders.countDocuments();
        const totalRevenue = await this.orders.aggregate([
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalProductsSold = await this.orders.aggregate([
            { $unwind: '$items' },
            { $group: { _id: null, total: { $sum: '$items.quantity' } } }
        ]);
        const totalCustomers = await this.orders.distinct('user');
        const totalRefunds = await this.orders.countDocuments({ status: orders_interface_1.OrderStatus.REFUNDED });
        const totalPendingOrders = await this.orders.countDocuments({ status: orders_interface_1.OrderStatus.PENDING });
        return {
            totalOrders,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            totalProductsSold: totalProductsSold.length > 0 ? totalProductsSold[0].total : 0,
            totalCustomers: totalCustomers.length,
            totalRefunds,
            totalPendingOrders
        };
    }
    async createOrder(orderData) {
        var _a;
        if ((0, util_1.isEmpty)(orderData))
            throw new HttpException_1.HttpException(400, 'orderData is empty');
        let cartDiscount = 0;
        let couponCode = null;
        const cart = await this.cartService.findCartByUserId(orderData.user);
        if (!cart) {
            throw new HttpException_1.HttpException(404, 'Cart not found');
        }
        couponCode = (_a = cart.discounts[0]) === null || _a === void 0 ? void 0 : _a.code;
        cartDiscount = cart.discounts.reduce((sum, discount) => {
            if (discount.type === 'PERCENTAGE') {
                const discountAmount = cart.subtotal * (discount.value / 100);
                return sum + (discount.maximumDiscount ? Math.min(discountAmount, discount.maximumDiscount) : discountAmount);
            }
            else {
                return sum + discount.value;
            }
        }, 0);
        const processedItems = await Promise.all(orderData.items.map(async (item) => {
            const product = await this.products.findById(item.product);
            if (!product)
                throw new HttpException_1.HttpException(404, `Product ${item.product} not found`);
            return Object.assign(Object.assign({}, item), { product: product._id, productType: product.type });
        }));
        const orderItems = processedItems.map((_a) => {
            var { productType } = _a, item = tslib_1.__rest(_a, ["productType"]);
            return item;
        });
        const hasPhysicalItems = processedItems.some(item => item.productType === products_interface_1.ProductType.PHYSICAL);
        const hasDigitalItems = processedItems.some(item => item.productType === products_interface_1.ProductType.DIGITAL);
        if (hasPhysicalItems && !orderData.shippingDetails) {
            throw new HttpException_1.HttpException(400, 'Shipping details required for physical items');
        }
        orderData.shippingCost = hasPhysicalItems
            ? await this.shippingService.calculateShippingRate(orderData.shippingDetails)
            : 0;
        const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal + orderData.tax + orderData.shippingCost - (cartDiscount || orderData.discount || 0);
        const order = new this.orders(Object.assign(Object.assign({ cartId: cart._id }, orderData), { items: orderItems, subtotal,
            total, discount: cartDiscount, status: orders_interface_1.OrderStatus.PENDING }));
        const createOrderData = await order.save();
        if (hasPhysicalItems) {
            await Promise.all(processedItems
                .filter(item => item.productType === products_interface_1.ProductType.PHYSICAL)
                .map(async (item) => {
                const product = await this.products.findById(item.product);
                if (product) {
                    product.stockQuantity -= item.quantity;
                    await product.save();
                }
            }));
        }
        const populatedOrder = await this.orders.findById(createOrderData._id).populate('user').populate('items.product');
        if (!populatedOrder) {
            throw new HttpException_1.HttpException(500, 'Failed to populate created order');
        }
        return populatedOrder;
    }
    async updateOrder(orderId, orderData) {
        if ((0, util_1.isEmpty)(orderData))
            throw new HttpException_1.HttpException(400, 'orderData is empty');
        const order = await this.findOrderById(orderId);
        if (!order)
            throw new HttpException_1.HttpException(409, "Order doesn't exist");
        if ([orders_interface_1.OrderStatus.DELIVERED, orders_interface_1.OrderStatus.CANCELLED].includes(order.status)) {
            throw new HttpException_1.HttpException(400, `Cannot update ${order.status} order`);
        }
        const updateOrderById = await this.orders.findByIdAndUpdate(orderId, orderData, { new: true }).populate('user').populate('items.product');
        return updateOrderById;
    }
    async updateOrderStatus(orderId, statusData, user) {
        const order = await this.findOrderById(orderId);
        this.validateStatusTransition(order.status, statusData.status);
        if (order.discount > 0) {
            const cart = await this.cartService.findCartById(order.cartId.toString());
            if (cart) {
                await this.couponService.incrementUsageCount(cart.discounts[0].code);
            }
        }
        const updateData = {
            status: statusData.status,
            notes: statusData.notes,
            paymentStatus: statusData.paymentStatus,
        };
        switch (statusData.status) {
            case orders_interface_1.OrderStatus.CONFIRMED:
                try {
                    const populatedOrder = await this.orders.findById(order._id).populate('user').populate('items.product');
                    await this.orderEmailService.sendOrderConfirmation(populatedOrder, populatedOrder.user);
                }
                catch (error) {
                    console.error('Failed to send order confirmation email:', error);
                }
                await this.convertBundlesToProducts(orderId);
                break;
            case orders_interface_1.OrderStatus.PROCESSING:
                updateData.processedAt = new Date();
                break;
            case orders_interface_1.OrderStatus.SHIPPED:
                updateData.shippedAt = new Date();
                break;
            case orders_interface_1.OrderStatus.DELIVERED:
                updateData.deliveredAt = new Date();
                break;
            case orders_interface_1.OrderStatus.DELETED:
            case orders_interface_1.OrderStatus.CANCELLED:
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
    async updateDeliveryStatus(orderId, deliveryData) {
        const order = await this.findOrderById(orderId);
        if (!order.shippingDetails) {
            throw new HttpException_1.HttpException(400, 'Order has no shipping details');
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
        if (deliveryData.deliveryStatus === orders_interface_1.DeliveryStatus.DELIVERED) {
            updateData['status'] = orders_interface_1.OrderStatus.DELIVERED;
            updateData['deliveredAt'] = new Date();
            updateData['shippingDetails.actualDeliveryDate'] = new Date();
        }
        const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
        try {
            await this.orderEmailService.sendDeliveryUpdate(updatedOrder, updatedOrder.user, deliveryData.deliveryStatus);
        }
        catch (error) {
            console.error('Failed to send delivery update email:', error);
        }
        return updatedOrder;
    }
    async deleteOrder(orderId) {
        const order = await this.findOrderById(orderId);
        if (order.status !== orders_interface_1.OrderStatus.CANCELLED) {
            throw new HttpException_1.HttpException(400, 'Only cancelled orders can be deleted');
        }
        const deleteOrderById = await this.orders.findByIdAndDelete(orderId);
        return deleteOrderById;
    }
    async convertBundlesToProducts(orderId) {
        const order = await this.findOrderById(orderId);
        const items = order.items;
        for (const item of items) {
            const bundle = await this.products.findById(item.product);
            if (bundle && bundle.type === products_interface_1.ProductType.BUNDLE) {
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
    async processRefund(orderId, refundAmount, reason) {
        const order = await this.findOrderById(orderId);
        if (order.status !== orders_interface_1.OrderStatus.CANCELLED && order.status !== orders_interface_1.OrderStatus.DELIVERED) {
            throw new HttpException_1.HttpException(400, 'Only cancelled or delivered orders can be refunded');
        }
        const updateData = {
            status: orders_interface_1.OrderStatus.REFUNDED,
            notes: reason || 'Refund processed',
            refundedAt: new Date(),
        };
        const updatedOrder = await this.orders.findByIdAndUpdate(orderId, { $set: updateData }, { new: true }).populate('user').populate('items.product');
        try {
            await this.orderEmailService.sendOrderRefunded(updatedOrder, updatedOrder.user, refundAmount);
        }
        catch (error) {
            console.error('Failed to send refund notification email:', error);
        }
        return updatedOrder;
    }
    async restoreStock(order) {
        await Promise.all(order.items.map(async (item) => {
            const product = await this.products.findById(item.product);
            if (product && product.type === products_interface_1.ProductType.PHYSICAL) {
                product.stockQuantity += item.quantity;
                await product.save();
            }
        }));
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [orders_interface_1.OrderStatus.PENDING]: [orders_interface_1.OrderStatus.CONFIRMED, orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.REFUNDED, orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.CONFIRMED]: [orders_interface_1.OrderStatus.PROCESSING, orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.CONFIRMED, orders_interface_1.OrderStatus.REFUNDED, orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.PROCESSING]: [orders_interface_1.OrderStatus.SHIPPED, orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.REFUNDED, orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.SHIPPED]: [orders_interface_1.OrderStatus.DELIVERED, orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.REFUNDED, orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.DELIVERED]: [],
            [orders_interface_1.OrderStatus.CANCELLED]: [orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.REFUNDED]: [orders_interface_1.OrderStatus.DELETED],
            [orders_interface_1.OrderStatus.DELETED]: [],
        };
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new HttpException_1.HttpException(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
    async sendOrderStatusEmails(order, updatedOrder, previousStatus, newStatus, notes) {
        try {
            switch (newStatus) {
                case orders_interface_1.OrderStatus.PROCESSING:
                    await this.orderEmailService.sendOrderProcessing(updatedOrder, updatedOrder.user);
                    break;
                case orders_interface_1.OrderStatus.SHIPPED:
                    await this.orderEmailService.sendOrderShipped(updatedOrder, updatedOrder.user);
                    break;
                case orders_interface_1.OrderStatus.DELIVERED:
                    await this.orderEmailService.sendOrderDelivered(updatedOrder, updatedOrder.user);
                    break;
                case orders_interface_1.OrderStatus.CANCELLED:
                    await this.orderEmailService.sendOrderCancelled(updatedOrder, updatedOrder.user, notes);
                    break;
                default:
                    if (previousStatus !== newStatus) {
                        await this.orderEmailService.sendOrderStatusUpdate(updatedOrder, updatedOrder.user, previousStatus, newStatus);
                    }
            }
        }
        catch (error) {
            console.error('Failed to send order status email:', error);
        }
    }
    async checkStockAndNotify(order, user) {
        try {
            for (const item of order.items) {
                const product = typeof item.product === 'string' ?
                    await this.products.findById(item.product) :
                    item.product;
                if (product && product.type === products_interface_1.ProductType.PHYSICAL) {
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
        }
        catch (error) {
            console.error('Failed to check stock and send notifications:', error);
        }
    }
    async getUserOrders(userId, page = 1, limit = null, productType, includeBundleItems = false) {
        let skip = 0;
        if (limit === null) {
            skip = 0;
        }
        else {
            skip = (page - 1) * limit;
        }
        let query = { user: userId, status: { $nin: [orders_interface_1.OrderStatus.CANCELLED, orders_interface_1.OrderStatus.PENDING, orders_interface_1.OrderStatus.DELETED] } };
        if (productType) {
            query = Object.assign(Object.assign({}, query), { 'items.product': {
                    $exists: true
                } });
        }
        const [orders, total] = await Promise.all([
            this.orders
                .find(query)
                .populate({
                path: 'items.product',
                match: productType === products_interface_1.ProductType.DIGITAL ? { type: { $in: [products_interface_1.ProductType.EBOOK, productType] } } : includeBundleItems ? { type: { $in: [productType, products_interface_1.ProductType.BUNDLE] } } : { type: productType }
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
            const bundleIds = new Set();
            for (const order of filteredOrders) {
                for (const item of order.items) {
                    if (item.product && typeof item.product === 'object' && item.product.type === products_interface_1.ProductType.BUNDLE) {
                        bundleIds.add(item.product._id.toString());
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
                        if (item.product && typeof item.product === 'object' && item.product.type === products_interface_1.ProductType.BUNDLE) {
                            const bundleId = item.product._id.toString();
                            const populatedBundle = bundleMap.get(bundleId);
                            if (populatedBundle) {
                                item.product = Object.assign(Object.assign({}, populatedBundle), { isBundle: true });
                            }
                        }
                    }
                }
            }
        };
        await populateBundleItemsProducts();
        const flattenBundleItems = () => {
            for (const order of filteredOrders) {
                const flattenedItems = [];
                for (const item of order.items) {
                    if (item.product && typeof item.product === 'object' && item.product.type === products_interface_1.ProductType.BUNDLE) {
                        const bundle = item.product;
                        const bundleQuantity = item.quantity;
                        flattenedItems.push(Object.assign(Object.assign({}, item), { isBundle: true }));
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
                                }
                                else if (bundleItem.title) {
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
                    }
                    else {
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
    async getOrdersByStatus(status) {
        const filter = { status };
        if (status !== orders_interface_1.OrderStatus.DELETED) {
            filter.status = { $eq: status, $ne: orders_interface_1.OrderStatus.DELETED };
        }
        return this.orders.find(filter).populate('user').populate('items.product').sort({ orderedAt: -1 });
    }
    async getOrdersByDateRange(startDate, endDate) {
        return this.orders
            .find({
            orderedAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: { $ne: orders_interface_1.OrderStatus.DELETED },
        })
            .populate('user')
            .populate('items.product')
            .sort({ orderedAt: -1 });
    }
}
exports.default = OrderService;
//# sourceMappingURL=orders.service.js.map