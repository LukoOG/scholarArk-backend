export class InitializePaystackDto {
  email: string;
  amount: number; // amount in kobo
  reference: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitializeResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
