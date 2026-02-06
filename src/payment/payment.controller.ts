import { Body, Controller, Get, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Identifier, PaymentService } from './payment.service';
import { PaymentTransactionDto, PaymentInitializationResponseDto } from './dto/payment.transaction.dto';
import { AuthGuard, UserPopulatedRequest } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators';
import { ResponseHelper } from 'src/common/helpers/api-response.helper';

@ApiTags("Payment")
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }


  //document behavior when amount = 0
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialize course payment',
    description: `
  Initializes a Paystack payment transaction for a course.

  The backend:
  - Fetches course price securely
  - Creates a payment record
  - Returns a Paystack authorization URL

  The frontend:
  - Redirects the user to the authorizationUrl
  `,
  })
  @ApiBody({ type: PaymentTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully',
    type: PaymentInitializationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid course or currency' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'User already enrolled in course' })
  @UseGuards(AuthGuard)
  async initializeTransaction(
    @Req() req: UserPopulatedRequest,
    @GetUser('email') email: string,
    @Body() dto: PaymentTransactionDto
  ) {
    const response = await this.paymentService.initializeCoursePayment(req.user.id, email, dto)
    return ResponseHelper.success(response, HttpStatus.OK)
  }

  // @Get()
  // @UseGuards(AuthGuard)
  // async getTransactions(
  //   @Req() req: UserPopulatedRequest,
  // ) {
  //   return await this.paymentService.getTransactions(req.user.id)
  // }

  // @Get(":id")
  // @UseGuards(AuthGuard)
  // async getTransaction(
  //   @Req() req: UserPopulatedRequest,
  //   @Param("id") id: Identifier
  // ) {
  //   return await this.paymentService.getTransaction(req.user.id, id)
  // }

  // @Get(":id/update")
  // @UseGuards(AuthGuard)
  // async updateTransaction(
  //   @Req() req: UserPopulatedRequest,
  //   @Param("id") id: Identifier,
  //   @Body() dto: PaymentTransactionDto
  // ) {
  //   return await this.paymentService.updateTransaction(req.user.id, id, dto)
  // }
}
