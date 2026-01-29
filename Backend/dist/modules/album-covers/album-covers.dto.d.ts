/// <reference types="multer" />
export declare class CreateAlbumCoverDto {
    title: string;
    image: Express.Multer.File;
}
export declare class UpdateAlbumCoverDto extends CreateAlbumCoverDto {
    title: string;
    description: string;
    image: Express.Multer.File;
}
