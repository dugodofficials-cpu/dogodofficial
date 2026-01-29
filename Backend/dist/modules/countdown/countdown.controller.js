"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const countdown_service_1 = tslib_1.__importDefault(require("../../modules/countdown/countdown.service"));
class CountdownController {
    constructor() {
        this.countdownService = new countdown_service_1.default();
        this.getCountdownStatistics = async (req, res, next) => {
            try {
                const statistics = await this.countdownService.countdownStatistics();
                res.status(200).json({ data: statistics, message: 'countdownStatistics' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCountdowns = async (req, res, next) => {
            try {
                const query = {
                    pagination: {
                        page: req.query.page ? parseInt(req.query.page) : 1,
                        limit: req.query.limit ? parseInt(req.query.limit) : 10,
                    },
                    sort: {
                        field: req.query.sortBy || 'createdAt',
                        order: req.query.sortOrder || 'desc',
                    },
                    filters: Object.assign(Object.assign(Object.assign({}, (req.query.status && { status: req.query.status })), (req.query.isActive !== undefined && {
                        isActive: req.query.isActive === 'true'
                    })), (req.query.search && { search: req.query.search })),
                };
                const result = await this.countdownService.findCountdownsWithFilters(query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllCountdowns = async (req, res, next) => {
            try {
                const countdowns = await this.countdownService.findAllCountdowns();
                res.status(200).json({ data: countdowns, message: 'findAll' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getCountdownById = async (req, res, next) => {
            try {
                const countdownId = req.params.id;
                const findOneCountdownData = await this.countdownService.findCountdownById(countdownId);
                res.status(200).json({ data: findOneCountdownData, message: 'findOne' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActiveCountdown = async (req, res, next) => {
            try {
                const activeCountdown = await this.countdownService.findActiveCountdown();
                if (!activeCountdown) {
                    return res.status(200).json({
                        data: null,
                        message: 'No active countdown found'
                    });
                }
                res.status(200).json({ data: activeCountdown, message: 'activeCountdown' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActiveCountdownWithTimeRemaining = async (req, res, next) => {
            try {
                const result = await this.countdownService.getActiveCountdownWithTimeRemaining();
                if (!result) {
                    return res.status(404).json({
                        data: null,
                        message: 'No active countdown found'
                    });
                }
                res.status(200).json({ data: result, message: 'activeCountdownWithTimeRemaining' });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTimeRemaining = async (req, res, next) => {
            try {
                const countdownId = req.params.id;
                const timeRemaining = await this.countdownService.getTimeRemaining(countdownId);
                res.status(200).json({ data: timeRemaining, message: 'timeRemaining' });
            }
            catch (error) {
                next(error);
            }
        };
        this.createCountdown = async (req, res, next) => {
            try {
                const countdownData = req.body;
                const createCountdownData = await this.countdownService.createCountdown(countdownData);
                res.status(201).json({ data: createCountdownData, message: 'created' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCountdown = async (req, res, next) => {
            try {
                const countdownId = req.params.id;
                const countdownData = req.body;
                const updateCountdownData = await this.countdownService.updateCountdown(countdownId, countdownData);
                res.status(200).json({ data: updateCountdownData, message: 'updated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteCountdown = async (req, res, next) => {
            try {
                const countdownId = req.params.id;
                const deleteCountdownData = await this.countdownService.deleteCountdown(countdownId);
                res.status(200).json({ data: deleteCountdownData, message: 'deleted' });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateExpiredCountdowns = async (req, res, next) => {
            try {
                await this.countdownService.updateExpiredCountdowns();
                res.status(200).json({ data: null, message: 'expiredCountdownsUpdated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.activateCountdown = async (req, res, next) => {
            try {
                const countdownId = req.params.id;
                const activateCountdownData = await this.countdownService.activateCountdown(countdownId);
                res.status(200).json({ data: activateCountdownData, message: 'activated' });
            }
            catch (error) {
                next(error);
            }
        };
        this.deactivateAllCountdowns = async (req, res, next) => {
            try {
                await this.countdownService.deactivateAllCountdowns();
                res.status(200).json({ data: null, message: 'allCountdownsDeactivated' });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = CountdownController;
//# sourceMappingURL=countdown.controller.js.map