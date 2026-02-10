import {
  Section,
  Text,
  Heading,
  Button
} from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';

interface VerificationEmailProps {
  token: string;
}

export const VerificationEmail = ({ token }: VerificationEmailProps) => {

  return (
    <EmailLayout>
      <Section>
        <Text>
          Verify your email address
        </Text>

        <Text>
          Please confirm your email address by entering the OTP code below
          This helps us keep your account secure.
        </Text>

        <Section>
          <Text>OTP Code: {token}</Text>
        </Section>

        <Text>
          {/* This link will expire in 24 hours. */}
          This code will expire after 10 minutes
        </Text>

        <Text>
          If you did not create an account, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
};

