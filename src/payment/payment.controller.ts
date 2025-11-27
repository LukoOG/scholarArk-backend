import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Identifier, PaymentService } from './payment.service';
import { PaymentTransactionDto } from './dto/payment.transaction.dto';
import { UserGuard, UserPopulatedRequest } from 'src/user/user.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }


  @Post()
  @UseGuards(UserGuard)
  async initializeTransaction(
    @Req() req: UserPopulatedRequest,
    @Body() dto: PaymentTransactionDto
  ) {
    return await this.paymentService.initializeTransaction(req.user.id, dto)
  }

  @Get()
  @UseGuards(UserGuard)
  async getTransactions(
    @Req() req: UserPopulatedRequest,
  ) {
    return await this.paymentService.getTransactions(req.user.id)
  }

  @Get(":id")
  @UseGuards(UserGuard)
  async getTransaction(
    @Req() req: UserPopulatedRequest,
    @Param("id") id: Identifier
  ) {
    return await this.paymentService.getTransaction(req.user.id, id)
  }

  @Get(":id/update")
  @UseGuards(UserGuard)
  async updateTransaction(
    @Req() req: UserPopulatedRequest,
    @Param("id") id: Identifier,
    @Body() dto: PaymentTransactionDto
  ) {
    return await this.paymentService.updateTransaction(req.user.id, id, dto)
  }
}
