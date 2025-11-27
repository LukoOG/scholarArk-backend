import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Model, ObjectId, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { PaymentTransactionDto } from './dto/payment.transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';

export type Identifier = string | Types.ObjectId | ObjectId


@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly userService: UserService
    constructor(
        @InjectModel(Payment.name) public paymentModel: Model<PaymentDocument>
    ) {
    }

    async initializeTransaction(
        userId: Identifier,
        dto: PaymentTransactionDto,
    ) {

        const user = await this.userService.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException("User not found")
        }

        try {
            const response = await this.paymentModel.create({
                user,
                ...dto
            })
            return {
                message: "Payment transaction saved successfully",
                data: response
            }
        } catch (err) {
            this.logger.error(err.response.data.message);
            throw new BadRequestException({
                message: 'Error saving payment transaction.', err
            });
        }
    }

    async getTransactions(userId: Identifier) {
        const user = await this.userService.userModel.findById(userId).exec()

        if (!user) {
            throw new NotFoundException("User not found")
        }

        const transactions = await this.paymentModel.find({
            user
        })

        return {
            message: "Transactions gotten successfully",
            data: transactions
        }
    }

    async getTransaction(userId: Identifier, transactionId: Identifier) {
        const user = await this.userService.userModel.findById(userId).exec()

        if (!user) {
            throw new NotFoundException("User not found")
        }

        const transaction = await this.paymentModel.find({
            user,
            id: transactionId
        })

        if (!transaction) throw new NotFoundException("Transaction not found")

        return { message: "Transaction gotten", data: transaction }
    }

    async updateTransaction(userId: Identifier, transactionId: Identifier, dto: PaymentTransactionDto) {
        const user = await this.userService.userModel.findById(userId).exec()

        if (!user) {
            throw new NotFoundException("User not found")
        }

        const transaction = await this.paymentModel.find({
            user,
            id: transactionId
        })

        if (!transaction) throw new NotFoundException("Transaction not found")

        const update = await this.paymentModel.updateOne({ id: transactionId }, { $set: dto })

        return { message: "Transaction Updated successfully", data : update }

    }
}
