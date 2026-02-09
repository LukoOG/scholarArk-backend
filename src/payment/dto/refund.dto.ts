import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class InitiateRefundDto {
  @ApiProperty({
    description: 'The reference of the transaction to refund',
    example: 'SK_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  transactionReference: string;

  @ApiProperty({
    description: 'Reason for the refund request',
    example: 'Course content was not as described',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  reason: string;
}
