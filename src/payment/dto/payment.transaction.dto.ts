import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator"
import { PaymentStatus } from "../schemas/payment.schema"

export class PaymentTransactionDto {
    @IsNumber()
    @IsNotEmpty()
    amount : number

    @IsString()
    @IsEnum(PaymentStatus)
    status : PaymentStatus
}