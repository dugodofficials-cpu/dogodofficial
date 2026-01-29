"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlbumCoverModel = void 0;
const mongoose_1 = require("mongoose");
const albumCoverSchema = new mongoose_1.Schema({
    title: {
        type: String,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_, ret) {
            delete ret._id;
            return ret;
        },
    },
});
exports.AlbumCoverModel = (0, mongoose_1.model)('AlbumCover', albumCoverSchema);
//# sourceMappingURL=album-covers.model.js.map