import {
  Section,
  Text,
  Heading,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/EmailLayout';

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <EmailLayout>
      <Section>
        <Heading as="h2">
          Welcome{ name ? `, ${name}` : '' }!
        </Heading>

        <Text>
          We’re excited to have you on ScholarArk.
        </Text>

        <Text>
          You can now explore courses, assessments, and reminders.
        </Text>

        <Text>
          🚀 The ScholarArk Team
        </Text>
      </Section>
    </EmailLayout>
  );
};
