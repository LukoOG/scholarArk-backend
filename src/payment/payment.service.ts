import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { PaymentTransactionDto } from './dto/payment.transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentCurrency, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { PaystackService } from './paystack/paystack.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { CoursesService } from 'src/courses/services/courses.service';

export type Identifier = string | Types.ObjectId | ObjectId


@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    constructor(
        @InjectModel(Payment.name) public paymentModel: Model<PaymentDocument>,
        private readonly paystackService: PaystackService,
        private readonly enrollmentService: EnrollmentService,
        private readonly courseService: CoursesService,
        private readonly usersService: UserService,
    ) {
    }

    async initializeCoursePayment(userId: Identifier, email: string, dto: PaymentTransactionDto) {
        const reference = `SK_${Date.now()}_${userId}`;

        const { courseId, tutorId, currency } = dto

        //fetch amount from course
        const amount = await this.courseService.getCoursePrice(courseId, currency)

        await this.paymentModel.create({
            user: userId,
            course: courseId,
            amount,
            currency: currency,
            reference,
            status: PaymentStatus.INITIALIZED,
        });

        if (amount === 0) {
            //automatically enroll
            return await this.enrollmentService.enroll(
                userId as Types.ObjectId,
                courseId,
            )
        };

        return this.paystackService.initializeTransaction({
            email,
            amount: amount * 100, //convert to minor units for paystack
            reference,
            metadata: { userId, courseId, tutorId }
        })
    }

    async handleSuccessfulPayment(reference: string, payload: any, tutorId: Types.ObjectId) {
        const payment = await this.paymentModel.findOne({ reference }).exec();

        if (!payment || payment.status === PaymentStatus.SUCCESS) return;

        const verification = await this.paystackService.verifyTransaction(reference);

        if (verification.status) {
            payment.status = PaymentStatus.SUCCESS;
            payment.providerPayload = payload;
            await payment.save();

            await this.enrollmentService.enroll(
                payment.user,
                payment.course
            )
            //update students enrolled
            await this.courseService.incrementEnrolledStudents(payment.course)
            //update student subscribed 
            await this.usersService.updateSubscribedTutors(payment.user, tutorId)
        } else {
            throw new BadRequestException('Transaction failed')
        }

    }

    // async getTransactions(userId: Identifier) {
    //     const user = await this.userService.userModel.findById(userId).exec()

    //     if (!user) {
    //         throw new NotFoundException("User not found")
    //     }

    //     const transactions = await this.paymentModel.find({
    //         user
    //     })

    //     return {
    //         message: "Transactions gotten successfully",
    //         data: transactions
    //     }
    // }

    // async getTransaction(userId: Identifier, transactionId: Identifier) {
    //     const user = await this.userService.userModel.findById(userId).exec()

    //     if (!user) {
    //         throw new NotFoundException("User not found")
    //     }

    //     const transaction = await this.paymentModel.find({
    //         user,
    //         id: transactionId
    //     })

    //     if (!transaction) throw new NotFoundException("Transaction not found")

    //     return { message: "Transaction gotten", data: transaction }
    // }

    // async updateTransaction(userId: Identifier, transactionId: Identifier, dto: PaymentTransactionDto) {
    //     const user = await this.userService.userModel.findById(userId).exec()

    //     if (!user) {
    //         throw new NotFoundException("User not found")
    //     }

    //     const transaction = await this.paymentModel.find({
    //         user,
    //         id: transactionId
    //     })

    //     if (!transaction) throw new NotFoundException("Transaction not found")

    //     const update = await this.paymentModel.updateOne({ id: transactionId }, { $set: dto })

    //     return { message: "Transaction Updated successfully", data : update }

    // }
}
