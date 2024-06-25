import { IsAlphanumeric, IsArray, IsInt, IsNotEmpty, IsString, MinLength, }  from "class-validator";

export class CreateUserDto{


    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    readonly username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;
    @IsInt()
    readonly rating: number;

    @IsInt()
    readonly rankpoints: string;

    @IsInt()
    readonly gold: number;

    @IsArray()
    readonly friends: string[];
}