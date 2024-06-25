import { IsNumber, IsString } from "class-validator"

export class UpdateUserRankDto
{
    @IsString()
    _id:string

    @IsNumber()
    rating:number

    @IsNumber()
    rankpoints:number
}