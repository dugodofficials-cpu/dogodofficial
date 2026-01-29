"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const orders_service_1 = tslib_1.__importDefault(require("../../modules/orders/orders.service"));
class OrderController {
    constructor() {
        this.orderService = new orders_service_1.default();
        this.getOrders = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                    search: req.query.search,
                    status: req.query.status,
                    userId: req.query.userId,
                    startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                    endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                    minTotal: req.query.minTotal ? parseFloat(req.query.minTotal) : undefined,
                    maxTotal: req.query.maxTotal ? parseFloat(req.query.maxTotal) : undefined,
                    sortBy: req.query.sortBy,
                    sortOrder: req.query.sortOrder,
                };
                const { orders, total, page, limit, totalPages } = await this.orderService.findAllOrders(query);
                res.status(200).json({
                    data: orders,
                    meta: {
                        total,
                        page,
                        limit,
                        totalPages
                    },
                    message: 'findAll'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrderById = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                const findOneOrderData = await this.orderService.findOrderById(orderId);
                res.status(200).json({ data: findOneOrderData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrderByNumber = async (req, res, next) => {
            try {
                const orderNumber = req.params.orderNumber;
                const findOneOrderData = await this.orderService.findOrderByNumber(orderNumber);
                res.status(200).json({ data: findOneOrderData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrderStatistics = async (req, res, next) => {
            try {
                const orderStatistics = await this.orderService.orderStatistics();
                res.status(200).json({ data: orderStatistics, message: 'orderStatistics' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createOrder = async (req, res, next) => {
            try {
                const orderData = req.body;
                const createOrderData = await this.orderService.createOrder(orderData);
                res.status(201).json({ data: createOrderData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateOrder = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                const orderData = req.body;
                const updateOrderData = await this.orderService.updateOrder(orderId, orderData);
                res.status(200).json({ data: updateOrderData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateOrderStatus = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                const statusData = req.body;
                const updateOrderData = await this.orderService.updateOrderStatus(orderId, statusData, req.user);
                res.status(200).json({ data: updateOrderData, message: 'status updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDeliveryStatus = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                const deliveryData = req.body;
                const updateOrderData = await this.orderService.updateDeliveryStatus(orderId, deliveryData);
                res.status(200).json({ data: updateOrderData, message: 'delivery status updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteOrder = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                const deleteOrderData = await this.orderService.deleteOrder(orderId);
                res.status(200).json({ data: deleteOrderData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserOrders = async (req, res, next) => {
            try {
                const userId = req.params.userId;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || null;
                const productType = req.query.type;
                const includeBundleItems = req.query.includeBundleItems === 'true';
                const { orders, total, totalPages } = await this.orderService.getUserOrders(userId, page, limit, productType, includeBundleItems);
                res.status(200).json({
                    data: orders,
                    meta: {
                        total,
                        totalPages,
                        currentPage: page,
                        limit,
                        productType: productType || 'ALL'
                    },
                    message: 'findUserOrders'
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrdersByStatus = async (req, res, next) => {
            try {
                const status = req.params.status;
                const orders = await this.orderService.getOrdersByStatus(status);
                res.status(200).json({ data: orders, message: 'findOrdersByStatus' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getOrdersByDateRange = async (req, res, next) => {
            try {
                const startDate = new Date(req.query.startDate);
                const endDate = new Date(req.query.endDate);
                const orders = await this.orderService.getOrdersByDateRange(startDate, endDate);
                res.status(200).json({ data: orders, message: 'findOrdersByDateRange' });
            }
            catch (error) {
                next(error);
            }
        };
        this.resendOrderConfirmation = async (req, res, next) => {
            try {
                const orderId = req.params.id;
                await this.orderService.resendOrderConfirmation(orderId);
                res.status(200).json({ message: 'Order confirmation resent' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = OrderController;
//# sourceMappingURL=orders.controller.js.map