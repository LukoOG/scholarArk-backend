import { Controller, Post, Req, Headers, ForbiddenException } from "@nestjs/common";
import { PaymentService } from "../payment.service";
import * as crypto from "crypto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Payment")
@Controller('webhooks/paystack')
export class PaystackWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      throw new ForbiddenException('Invalid signature');
    }

    const event = req.body as any;
    //console.log("Webhook handling for", event)

    if(event.event === 'charge.success') {
      await this.paymentService.handleSuccessfulPayment(
        event.data.reference,
        event,
      );
    }

    return { received: true };
  }
}
