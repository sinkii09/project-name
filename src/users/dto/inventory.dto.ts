import { IsString, IsNumber, IsDate } from 'class-validator';

export class InventoryItemDto {
//   @IsString()
//   itemId: string;

  itemDetails: any;

  @IsNumber()
  quantity: number;

  @IsDate()
  purchaseDate: Date;

  
}

export class UserInventoryDto {
  inventory: InventoryItemDto[];
}
