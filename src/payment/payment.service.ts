import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Model, ObjectId, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { PaymentTransactionDto } from './dto/payment.transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Payment,
  PaymentCurrency,
  PaymentDocument,
  PaymentStatus,
  RefundStatus,
} from './schemas/payment.schema';
import { PaystackService } from './paystack/paystack.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { CoursesService } from 'src/courses/services/courses.service';

export type Identifier = string | Types.ObjectId | ObjectId;

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectModel(Payment.name) public paymentModel: Model<PaymentDocument>,
    private readonly paystackService: PaystackService,
    private readonly enrollmentService: EnrollmentService,
    private readonly courseService: CoursesService,
  ) {}

  async initializeCoursePayment(
    userId: Identifier,
    email: string,
    dto: PaymentTransactionDto,
  ) {
    const reference = `SK_${Date.now()}_${userId}`;

    const { courseId, currency } = dto;

    //fetch amount from course
    const amount = await this.courseService.getCoursePrice(courseId, currency);

    await this.paymentModel.create({
      user: userId,
      course: courseId,
      amount,
      currency: currency,
      reference,
      status: PaymentStatus.INITIALIZED,
    });

    return this.paystackService.initializeTransaction({
      email,
      amount: amount * 100, //convert to minor units for paystack
      reference,
      metadata: { userId, courseId },
    });
  }

  async handleSuccessfulPayment(reference: string, payload: any) {
    const payment = await this.paymentModel.findOne({ reference }).exec();

    if (!payment || payment.status === PaymentStatus.SUCCESS) return;

    const verification =
      await this.paystackService.verifyTransaction(reference);

    if (verification.status) {
      payment.status = PaymentStatus.SUCCESS;
      payment.providerPayload = payload;
      await payment.save();

      await this.enrollmentService.enroll(payment.user, payment.course);
    }

    throw new BadRequestException('Transaction failed');
  }

  async requestRefund(
    userId: Identifier,
    transactionReference: string,
    reason: string,
  ) {
    const payment = await this.paymentModel.findOne({
      reference: transactionReference,
      user: userId,
    });

    if (!payment) throw new NotFoundException('Transaction not found');

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Cannot refund an incomplete transaction');
    }

    if (payment.refundStatus !== 'none') {
      throw new BadRequestException('Refund already initiated or processed');
    }
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

    // 1. Check 7-day window
    const now = new Date();
    const paymentDate = new Date((payment as any).createdAt); // createdAt is reliable as it's set on creation
    const diffDays = Math.ceil(
      (now.getTime() - paymentDate.getTime()) / (1000 * 3600 * 24),
    );

    if (diffDays > 7) {
      throw new BadRequestException('Refund period (7 days) has expired');
    }

    // 2. Mark as processing
    payment.refundStatus = RefundStatus.PENDING; // Changed to PENDING for admin review
    payment.refundReason = reason;
    payment.refundRequestedAt = now;
    await payment.save();

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
  }

  async rejectRefund(paymentId: Identifier) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.refundStatus !== RefundStatus.PENDING) {
      throw new BadRequestException('Refund is not pending');
    }

    payment.refundStatus = RefundStatus.REJECTED;
    await payment.save();

    return { message: 'Refund rejected', data: payment };
  }

  async getRefunds(status?: RefundStatus) {
    const filter = status
      ? { refundStatus: status }
      : { refundStatus: { $ne: RefundStatus.NONE } };

    return this.paymentModel
      .find(filter)
      .populate('user', 'first_name last_name email')
      .populate('course', 'title price')
      .sort({ refundRequestedAt: -1 })
      .exec();
  }

  async getAllPayments() {
    return this.paymentModel
      .find()
      .populate('user', 'first_name last_name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })
      .exec();
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
