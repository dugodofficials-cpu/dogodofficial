"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    picture: {
        type: String,
        required: false,
    },
    isEmailVerified: {
        type: Boolean,
        required: false,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        required: false,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        required: false,
        select: false,
    },
    passwordResetToken: {
        type: String,
        required: false,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        required: false,
        select: false,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        required: false,
        default: 'active',
    },
    role: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Role',
        required: false,
    },
    address: {
        street: {
            type: String,
            required: false,
        },
        city: {
            type: String,
            required: false,
        },
        state: {
            type: String,
            required: false,
        },
        postalCode: {
            type: String,
            required: false,
        },
        country: {
            type: String,
            required: false,
        },
    },
    countryId: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.virtual('totalOrdersCount', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user',
    count: true,
});
userSchema.virtual('userRoles', {
    ref: 'UserRole',
    localField: '_id',
    foreignField: 'userId',
    populate: {
        path: 'roleId',
        model: 'Role'
    }
});
const userModel = (0, mongoose_1.model)('User', userSchema);
exports.default = userModel;
//# sourceMappingURL=users.model.js.map