import { Controller, Post, Body, Get } from '@nestjs/common';
import { ItemService } from './item.service';
import { Item } from './item.schema';
import { SkipAuth } from 'src/auth/auth.decorator';

@SkipAuth()
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  async createItem(
    @Body('name') name: string,
    @Body('description') description: string,
    @Body('icon') icon: string,
    @Body('price') price: number,
    @Body('unique') unique?: boolean,
    @Body('category') category?: string
  ): Promise<Item> {
    return this.itemService.createItem(name, description,icon, price, unique ,category);
  }

  @Get()
  async getItems(): Promise<Item[]> {
    return this.itemService.getItems();
  }
}
