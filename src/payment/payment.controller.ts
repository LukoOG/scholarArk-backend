import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Identifier, PaymentService } from './payment.service';
import {
  PaymentTransactionDto,
  PaymentInitializationResponseDto,
} from './dto/payment.transaction.dto';
import { InitiateRefundDto } from './dto/refund.dto';
import { AuthGuard, UserPopulatedRequest } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/common/decorators';
import { ResponseHelper } from 'src/common/helpers/api-response.helper';
import { AdminGuard, AdminPopulatedRequest } from 'src/admin/admin.guard';
import { Query } from '@nestjs/common';
import { RefundStatus } from './schemas/payment.schema';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
    @Body() dto: PaymentTransactionDto,
  ) {
    const response = await this.paymentService.initializeCoursePayment(
      req.user.id,
      email,
      dto,
    );
    return ResponseHelper.success(response, HttpStatus.OK);
  }

  @Post('refund')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request a refund',
    description: `
    Request a refund for a course within 7 days of purchase.
    - Verified 7-day window.
    - Sets refund status to PENDING.
    - Requires Admin approval.
    `,
  })
  @ApiBody({ type: InitiateRefundDto })
  @ApiResponse({ status: 200, description: 'Refund request submitted' })
  @ApiResponse({ status: 400, description: 'Refund failed or ineligible' })
  @UseGuards(AuthGuard)
  async refundTransaction(
    @Req() req: UserPopulatedRequest,
    @Body() dto: InitiateRefundDto,
  ) {
    const response = await this.paymentService.requestRefund(
      req.user.id,
      dto.transactionReference,
      dto.reason,
    );
    return ResponseHelper.success(response, HttpStatus.OK);
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all orders/payments (Admin Only)' })
  @UseGuards(AdminGuard)
  async getAllPayments() {
    const response = await this.paymentService.getAllPayments();
    return ResponseHelper.success(response, HttpStatus.OK);
  }

  @Get('refunds')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all refunds (Admin Only)' })
  @UseGuards(AdminGuard)
  async getRefunds(@Query('status') status?: RefundStatus) {
    const response = await this.paymentService.getRefunds(status);
    return ResponseHelper.success(response, HttpStatus.OK);
  }

  @Post('refunds/:id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a refund (Admin Only)' })
  @UseGuards(AdminGuard)
  async approveRefund(@Param('id') id: Identifier) {
    const response = await this.paymentService.approveRefund(id);
    return ResponseHelper.success(response, HttpStatus.OK);
  }

  @Post('refunds/:id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a refund (Admin Only)' })
  @UseGuards(AdminGuard)
  async rejectRefund(@Param('id') id: Identifier) {
    const response = await this.paymentService.rejectRefund(id);
    return ResponseHelper.success(response, HttpStatus.OK);
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
