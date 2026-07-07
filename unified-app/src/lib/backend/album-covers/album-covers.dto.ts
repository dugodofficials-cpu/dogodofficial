import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateAlbumCoverDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  public title: string;
  @IsNotEmpty()
  public image: Express.Multer.File;
}
export class UpdateAlbumCoverDto extends CreateAlbumCoverDto {
  @IsOptional()
  public title: string;
  @IsOptional()
  public description: string;
  @IsOptional()
  public image: Express.Multer.File;
}