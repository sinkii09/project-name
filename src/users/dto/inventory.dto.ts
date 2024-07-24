import { IsString, IsNumber, IsDate, IsBoolean } from 'class-validator';

export class InventoryItemDto {
//   @IsString()
//   itemId: string;

  itemDetails: any;
    @IsBoolean()
    equipped: boolean;
  @IsNumber()
  quantity: number;

  @IsDate()
  purchaseDate: Date;

  
}

export class UserInventoryDto {
  inventory: InventoryItemDto[];
}
