"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const countdown_interface_1 = require("../../modules/countdown/countdown.interface");
const countdownSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(countdown_interface_1.CountdownStatus),
        required: true,
        default: countdown_interface_1.CountdownStatus.ACTIVE,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    backgroundImage: {
        type: String,
        required: false,
    },
    backgroundColor: {
        type: String,
        required: false,
        default: '#000000',
    },
    textColor: {
        type: String,
        required: false,
        default: '#ffffff',
    },
    buttonText: {
        type: String,
        required: false,
        default: 'Get Notified',
    },
    buttonColor: {
        type: String,
        required: false,
        default: '#007bff',
    },
    buttonTextColor: {
        type: String,
        required: false,
        default: '#ffffff',
    },
    showDays: {
        type: Boolean,
        required: true,
        default: true,
    },
    showHours: {
        type: Boolean,
        required: true,
        default: true,
    },
    showMinutes: {
        type: Boolean,
        required: true,
        default: true,
    },
    showSeconds: {
        type: Boolean,
        required: true,
        default: true,
    },
    timezone: {
        type: String,
        required: true,
        default: 'UTC',
    },
    customMessage: {
        type: String,
        required: false,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
countdownSchema.index({ launchDate: 1 });
countdownSchema.index({ status: 1 });
countdownSchema.index({ isActive: 1 });
countdownSchema.index({ isActive: 1 }, {
    unique: true,
    partialFilterExpression: { isActive: true }
});
countdownSchema.pre('save', async function (next) {
    if (this.isActive && this.isNew) {
        await countdownModel.updateMany({ _id: { $ne: this._id } }, { isActive: false });
    }
    next();
});
countdownSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], async function (next) {
    const update = this.getUpdate();
    if (update && update.isActive === true) {
        const filter = this.getFilter();
        await countdownModel.updateMany({ _id: { $ne: filter._id } }, { isActive: false });
    }
    next();
});
countdownSchema.virtual('timeRemaining').get(function () {
    const now = new Date();
    const launchDate = new Date(this.launchDate);
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
});
countdownSchema.virtual('isExpired').get(function () {
    const now = new Date();
    const launchDate = new Date(this.launchDate);
    return launchDate.getTime() <= now.getTime();
});
const countdownModel = (0, mongoose_1.model)('Countdown', countdownSchema);
exports.default = countdownModel;
//# sourceMappingURL=countdown.model.js.map