import { IsEnum, IsNotEmpty, IsNumber, IsString, IsMongoId, IsEmail } from "class-validator"
import { Types } from "mongoose"


export class PaymentTransactionDto {
    @IsMongoId()
    courseId: Types.ObjectId

    @IsEmail()
    email: string
    
    @IsNumber()
    @IsNotEmpty()
    amount : number
}