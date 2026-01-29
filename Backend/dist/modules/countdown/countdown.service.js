"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const HttpException_1 = require("../../exceptions/HttpException");
const countdown_interface_1 = require("../../modules/countdown/countdown.interface");
const countdown_model_1 = tslib_1.__importDefault(require("../../modules/countdown/countdown.model"));
const util_1 = require("../../utils/util");
class CountdownService {
    constructor() {
        this.countdowns = countdown_model_1.default;
    }
    async findAllCountdowns() {
        const countdowns = await this.countdowns.find().sort({ createdAt: -1 });
        return countdowns;
    }
    async findCountdownsWithFilters(queryParams) {
        const { filters = {}, sort = { field: 'createdAt', order: 'desc' }, pagination = { page: 1, limit: 10 } } = queryParams;
        const filterObj = {};
        if (filters.status) {
            filterObj.status = filters.status;
        }
        if (filters.isActive !== undefined) {
            filterObj.isActive = filters.isActive;
        }
        if (filters.search) {
            const searchRegex = { $regex: filters.search, $options: 'i' };
            filterObj.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { customMessage: searchRegex },
            ];
        }
        const sortObj = {};
        sortObj[sort.field] = sort.order === 'asc' ? 1 : -1;
        const skip = (pagination.page - 1) * pagination.limit;
        const total = await this.countdowns.countDocuments(filterObj);
        const countdowns = await this.countdowns
            .find(filterObj)
            .sort(sortObj)
            .skip(skip)
            .limit(pagination.limit);
        const totalPages = Math.ceil(total / pagination.limit);
        return {
            data: countdowns,
            meta: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages,
            },
            message: 'success',
        };
    }
    async findCountdownById(countdownId) {
        if ((0, util_1.isEmpty)(countdownId))
            throw new HttpException_1.HttpException(400, 'CountdownId is empty');
        const findCountdown = await this.countdowns.findById(countdownId);
        if (!findCountdown)
            throw new HttpException_1.HttpException(409, "Countdown doesn't exist");
        return findCountdown;
    }
    async findActiveCountdown() {
        const activeCountdown = await this.countdowns.findOne({
            isActive: true,
            status: countdown_interface_1.CountdownStatus.ACTIVE
        }).sort({ createdAt: -1 });
        return activeCountdown;
    }
    async createCountdown(countdownData) {
        if ((0, util_1.isEmpty)(countdownData))
            throw new HttpException_1.HttpException(400, 'CountdownData is empty');
        const launchDate = new Date(countdownData.launchDate);
        const now = new Date();
        if (launchDate <= now) {
            throw new HttpException_1.HttpException(400, 'Launch date must be in the future');
        }
        if (countdownData.isActive) {
            await this.countdowns.updateMany({}, { isActive: false });
        }
        const createCountdownData = await this.countdowns.create(Object.assign(Object.assign({}, countdownData), { launchDate, status: countdownData.status || countdown_interface_1.CountdownStatus.ACTIVE, isActive: countdownData.isActive !== undefined ? countdownData.isActive : true }));
        return createCountdownData;
    }
    async updateCountdown(countdownId, countdownData) {
        if ((0, util_1.isEmpty)(countdownData))
            throw new HttpException_1.HttpException(400, 'CountdownData is empty');
        if (countdownData.launchDate) {
            const launchDate = new Date(countdownData.launchDate);
            const now = new Date();
            if (launchDate <= now) {
                throw new HttpException_1.HttpException(400, 'Launch date must be in the future');
            }
        }
        if (countdownData.isActive) {
            await this.countdowns.updateMany({ _id: { $ne: countdownId } }, { isActive: false });
        }
        const updateData = Object.assign({}, countdownData);
        if (countdownData.launchDate) {
            updateData.launchDate = new Date(countdownData.launchDate);
        }
        const updateCountdownById = await this.countdowns.findByIdAndUpdate(countdownId, updateData, { new: true });
        if (!updateCountdownById)
            throw new HttpException_1.HttpException(409, "Countdown doesn't exist");
        return updateCountdownById;
    }
    async deleteCountdown(countdownId) {
        const deleteCountdownById = await this.countdowns.findByIdAndDelete(countdownId);
        if (!deleteCountdownById)
            throw new HttpException_1.HttpException(409, "Countdown doesn't exist");
        return deleteCountdownById;
    }
    async getTimeRemaining(countdownId) {
        const countdown = await this.findCountdownById(countdownId);
        const now = new Date();
        const launchDate = new Date(countdown.launchDate);
        const diff = launchDate.getTime() - now.getTime();
        if (diff <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                total: 0,
                isExpired: true,
            };
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return {
            days,
            hours,
            minutes,
            seconds,
            total: diff,
            isExpired: false,
        };
    }
    async getActiveCountdownWithTimeRemaining() {
        const activeCountdown = await this.findActiveCountdown();
        if (!activeCountdown) {
            return null;
        }
        const timeRemaining = await this.getTimeRemaining(activeCountdown._id.toString());
        return {
            countdown: activeCountdown,
            timeRemaining,
        };
    }
    async updateExpiredCountdowns() {
        const now = new Date();
        await this.countdowns.updateMany({
            launchDate: { $lte: now },
            status: countdown_interface_1.CountdownStatus.ACTIVE
        }, {
            status: countdown_interface_1.CountdownStatus.EXPIRED,
            isActive: false
        });
    }
    async countdownStatistics() {
        const totalCountdowns = await this.countdowns.countDocuments();
        const activeCountdowns = await this.countdowns.countDocuments({
            status: countdown_interface_1.CountdownStatus.ACTIVE,
            isActive: true
        });
        const expiredCountdowns = await this.countdowns.countDocuments({
            status: countdown_interface_1.CountdownStatus.EXPIRED
        });
        return {
            totalCountdowns,
            activeCountdowns,
            expiredCountdowns,
        };
    }
    async activateCountdown(countdownId) {
        if ((0, util_1.isEmpty)(countdownId))
            throw new HttpException_1.HttpException(400, 'CountdownId is empty');
        await this.countdowns.updateMany({ _id: { $ne: countdownId } }, { isActive: false });
        const activateCountdownById = await this.countdowns.findByIdAndUpdate(countdownId, { isActive: true, status: countdown_interface_1.CountdownStatus.ACTIVE }, { new: true });
        if (!activateCountdownById)
            throw new HttpException_1.HttpException(409, "Countdown doesn't exist");
        return activateCountdownById;
    }
    async deactivateCountdown(countdownId) {
        if ((0, util_1.isEmpty)(countdownId))
            throw new HttpException_1.HttpException(400, 'CountdownId is empty');
        const deactivateCountdownById = await this.countdowns.findByIdAndUpdate(countdownId, { isActive: false }, { new: true });
        if (!deactivateCountdownById)
            throw new HttpException_1.HttpException(409, "Countdown doesn't exist");
        return deactivateCountdownById;
    }
    async deactivateAllCountdowns() {
        await this.countdowns.updateMany({}, { isActive: false });
    }
}
exports.default = CountdownService;
//# sourceMappingURL=countdown.service.js.map