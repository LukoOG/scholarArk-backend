import {
  Section,
  Text,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/EmailLayout';

interface OtpEmailProps {
  token: string
}

export const OTP = ({ token }: OtpEmailProps) => {
  return (
    <EmailLayout>
      <Section>
        <Text>
          OTP to reset password
        </Text>

        <Text>
          Use the code below to reset your password
        </Text>

        <Section>
          <Text>OTP Code: {token}</Text>
        </Section>
      </Section>
    </EmailLayout>
  );
};
