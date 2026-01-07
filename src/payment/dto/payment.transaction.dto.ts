import { IsEnum, IsNotEmpty, IsNumber, IsString, IsMongoId, IsEmail } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose"
import { PaymentCurrency } from "../schemas/payment.schema";

export class PaymentTransactionDto {
@ApiProperty({
    description: 'Course ID user wants to pay for',
    example: '695bbc7f050dceb9e3202e22',
  })
  @IsMongoId()
  @IsNotEmpty()
  courseId: Types.ObjectId;

  @ApiProperty({
    enum: ['NGN', 'USD'],
    example: 'NGN',
  })
  @IsEnum(PaymentCurrency)
  @IsNotEmpty()
  currency: PaymentCurrency;
}

export class PaymentInitializationResponseDto {
  @ApiProperty({
    example: 'https://checkout.paystack.com/abc123',
  })
  authorizationUrl: string;

  @ApiProperty({
    example: 'psk_695c9b2e...',
  })
  reference: string;

  @ApiProperty({
    enum: ['NGN', 'USD'],
  })
  currency: string;

  @ApiProperty({
    example: 15000,
  })
  amount: number;
}
