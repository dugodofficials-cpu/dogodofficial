"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const countrySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        minlength: 2,
        maxlength: 3,
    },
    phoneCode: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
    },
    region: {
        type: [String],
        required: true,
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
const countryModel = (0, mongoose_1.model)('Country', countrySchema);
exports.default = countryModel;
//# sourceMappingURL=countries.model.js.map