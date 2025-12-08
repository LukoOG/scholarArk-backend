import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../../config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleClientService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService<Config, true>) {
    this.client = new OAuth2Client(
      this.configService.get('google_client_id', { infer: true }),
    );
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.configService.get('google_client_id', { infer: true }),
    });
    return ticket.getPayload();
  }
}
