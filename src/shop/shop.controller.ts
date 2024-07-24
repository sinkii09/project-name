import { BadRequestException, Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { Item, ItemDocument } from 'src/item/item.schema';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateItemDto } from './dto/create-item.dto';
import { Shop } from './shop.schema';
import { CreateShopDto } from './dto/shop.dto';

@UseGuards(JwtAuthGuard)
@Controller('shop')
export class ShopController {
    constructor(private readonly shopService: ShopService) {}
    mainShopId = "66a1140c120a9a4a262ea541";
    @Post()
    async createShop(@Body() createShopDto: CreateShopDto): Promise<Shop> {
      return this.shopService.createShop(createShopDto);
    }
  @Post(':itemId/purchase')
  async purchaseItem(@Request() req,@Param('itemId') itemId: string): Promise<any> {
    try {
        return await this.shopService.purchaseItem(this.mainShopId,req.user._id, itemId);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
  }

  @Post('item')
  async createItem(@Body() createItemDto: CreateItemDto) {
    try {
      return await this.shopService.createItem(createItemDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  @Post(':itemId/item')
  async addItemToShop(@Param('itemId') itemId: string): Promise<Shop> {
    return this.shopService.addItemToShop(this.mainShopId, itemId);
  }
  @Get('items')
  async getShopItems(): Promise<Item[]> {
    return this.shopService.getShopItems(this.mainShopId);
  }
}
