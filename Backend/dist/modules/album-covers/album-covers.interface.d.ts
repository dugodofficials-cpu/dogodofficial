import { Document } from 'mongoose';
export interface AlbumCover {
    title: string;
    imageUrl: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AlbumCoverDocument extends Document, AlbumCover {
}
