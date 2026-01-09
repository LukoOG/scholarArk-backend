import { IsEnum, IsNotEmpty, IsNumber, IsString, IsMongoId, IsEmail } from "class-validator"
import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose"
import { PaymentCurrency } from "../schemas/payment.schema";

export class PaymentTransactionDto {
  @ApiProperty({
    description: 'Course ID the user wants to pay for',
    example: '695bbc7f050dceb9e3202e22',
  })
  @IsMongoId()
  courseId: Types.ObjectId;

  @ApiProperty({
    description: 'Currency to pay with',
    enum: PaymentCurrency,
    example: PaymentCurrency.NAIRA,
  })
  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency;
}


export class PaymentInitializationResponseDto {
  @ApiProperty({
    example: 'https://checkout.paystack.com/aly8g7j4cjngc72',
    description: 'Paystack authorization URL',
  })
  authorizationUrl: string;

  @ApiProperty({
    example: 'SK_1767796665370_695b897dcc20e8a0c87c70ed',
    description: 'Unique payment reference',
  })
  reference: string;

  @ApiProperty({
    example: 'aly8g7j4cjngc72',
    description: 'Access code to proceed payment',
  })
  access_code: string;
}

