import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddStickerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  stickerId!: string;
}
