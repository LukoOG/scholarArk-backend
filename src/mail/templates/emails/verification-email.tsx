import {
  Section,
  Text,
  Heading,
} from '@react-email/components';

import { EmailLayout } from '../components/EmailLayout';

interface VerificationEmailProps {
  token: string;
}

export const VerificationEmail = ({ token }: VerificationEmailProps) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return (
    <EmailLayout>
      <Section>
        <Text>
          Verify your email address
        </Text>

        <Text>
          Welcome to <strong>ScholarArk</strong> 🎉
        </Text>

        <Text>
          Please confirm your email address by clicking the button below.
          This helps us keep your account secure.
        </Text>

        <Section>
          <Button href={verifyUrl}>
            Verify Email
          </Button>
        </Section>

        <Text>
          This link will expire in 24 hours.
        </Text>

        <Text>
          If you did not create an account, you can safely ignore this email.
        </Text>
      </Section>
    </EmailLayout>
  );
};

