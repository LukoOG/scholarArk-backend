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
        
      </Section>
    </EmailLayout>
  );
};
