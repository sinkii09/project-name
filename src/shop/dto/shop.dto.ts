import { IsString, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateShopDto {
  @IsString()
  readonly name: string;

  @IsArray()
  readonly items: Types.ObjectId[];
}
