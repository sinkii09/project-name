import { IsString, IsInt, MinLength, IsPositive } from 'class-validator';

export class AddItemDto {
  @IsString()
  @MinLength(1)
  userId: string;

  @IsString()
  @MinLength(1)
  itemId: string;

  @IsInt()
  @IsPositive()
  quantity: number;
}
