// src/shop/dto/create-item.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  unique?: boolean;

  @IsOptional()
  @IsString()
  category?: string;
}
