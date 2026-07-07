import { model, Schema } from 'mongoose';
import { AlbumCover, AlbumCoverDocument } from './album-covers.interface';
const albumCoverSchema = new Schema<AlbumCoverDocument>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);
export const AlbumCoverModel = model<AlbumCoverDocument>('AlbumCover', albumCoverSchema);