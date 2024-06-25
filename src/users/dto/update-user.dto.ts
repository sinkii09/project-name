import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto
{
    @IsOptional()
    @IsString()
    readonly name?: string;
  
    @IsOptional()
    @IsString()
    @MinLength(6)
    readonly oldpassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    readonly newpassword?: string;
}