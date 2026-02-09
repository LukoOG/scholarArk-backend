import { HttpService } from '@nestjs/axios';
import { Injectable, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Config } from 'src/config';
import { InitializePaystackDto } from './paystack.dto';

@Injectable()
export class PaystackService {
  private paystackUrl: string;
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<Config, true>,
  ) {
    this.paystackUrl = this.configService.get('paystack', { infer: true }).url;
  }

  async initializeTransaction(payload: InitializePaystackDto) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.paystackUrl}/transaction/initialize`, payload),
      );

      return res.data.data;
    } catch (error) {
      throw new BadGatewayException(
        error.response?.data?.message || 'Paystack initialization failed',
      );
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.paystackUrl}/transaction/verify/${reference}`),
      );

      return res.data.data;
    } catch (error) {
      throw new BadGatewayException(
        error.response?.data?.message || 'Paystack verification failed',
      );
    }
  }

  async refundTransaction(reference: string, amount: number) {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.paystackUrl}/refund`, {
          transaction: reference,
          amount: amount * 100, // Convert to kobo/cents
        }),
      );
      return res.data.data;
    } catch (error) {
      throw new BadGatewayException(
        error.response?.data?.message || 'Paystack refund failed',
      );
    }
  }
}
