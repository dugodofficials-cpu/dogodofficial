import { HttpException } from '@exceptions/HttpException';
import { AlbumCover, AlbumCoverDocument } from './album-covers.interface';
import { AlbumCoverModel } from './album-covers.model';
import { CreateAlbumCoverDto, UpdateAlbumCoverDto } from './album-covers.dto';
import { isEmpty } from '@utils/util';
import s3PublicService from '@/utils/s3Public';
class AlbumCoverService {
  public albumCover = AlbumCoverModel;
  public async findAllAlbumCovers(): Promise<AlbumCover[]> {
    return this.albumCover.find();
  }
  public async findAlbumCoverById(albumCoverId: string): Promise<AlbumCover> {
    if (isEmpty(albumCoverId)) throw new HttpException(400, 'Album cover ID is required');
    const findAlbumCover: AlbumCover = await this.albumCover.findById(albumCoverId);
    if (!findAlbumCover) throw new HttpException(404, 'Album cover not found');
    return findAlbumCover;
  }
  public async createAlbumCover(albumCoverData: CreateAlbumCoverDto): Promise<AlbumCover> {
    return this.albumCover.create(albumCoverData);
  }
  public async updateAlbumCover(albumCoverId: string, albumCoverData: UpdateAlbumCoverDto): Promise<AlbumCover> {
    if (isEmpty(albumCoverData)) throw new HttpException(400, 'Album cover data is required');
    const updateAlbumCoverById: AlbumCover = await this.albumCover.findByIdAndUpdate(albumCoverId, albumCoverData, { new: true });
    if (!updateAlbumCoverById) throw new HttpException(404, 'Album cover not found');
    return updateAlbumCoverById;
  }
  public async deleteAlbumCover(albumCoverId: string): Promise<AlbumCover> {
    const deleteAlbumCoverById: AlbumCover = await this.albumCover.findByIdAndDelete(albumCoverId);
    if (!deleteAlbumCoverById) throw new HttpException(404, 'Album cover not found');
    const imageUrl = deleteAlbumCoverById.imageUrl;
    const bucketUrl = `https://${process.env.AWS_S3_PUBLIC_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
    const key = imageUrl.replace(bucketUrl, '');
    try {
      if (key && key !== imageUrl) {
        await s3PublicService.deleteFile(key);
      }
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
    }
    return deleteAlbumCoverById;
  }
}
export default AlbumCoverService;