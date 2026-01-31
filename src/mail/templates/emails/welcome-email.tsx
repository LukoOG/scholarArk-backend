import {
  Section,
  Text,
  Heading,
  Button,
  Img
} from '@react-email/components';
import * as React from 'react';
import { button, heading, paragraph, signoff } from '../components/EmailLayout';
import { EmailLayout } from '../components/EmailLayout';

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => {
  return (
    <EmailLayout>
      {/* Hero Image */}
      <Section style={{ paddingBottom: '24px' }}>
        <Img
          src="https://drive.google.com/uc?export=view&id=1mMfhtXLIboM5xwjaNrTGMgfWgsnL8z81
"
          alt="Welcome to ScholarArk"
          width="100%"
          style={{
            borderRadius: '8px',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        />
      </Section>

      {/* Main Content */}
      <Section>
        <Heading as="h2" style={heading}>
          Welcome{name ? `, ${name}` : ''} 👋
        </Heading>

        <Text style={paragraph}>
          We’re excited to have you join <strong>ScholarArk</strong> — your
          learning companion for structured courses, smart assessments, and
          timely reminders.
        </Text>

        <Text style={paragraph}>
          Whether you’re here to learn something new, stay consistent with your
          studies, or track your progress, ScholarArk is built to support you
          every step of the way.
        </Text>

        <Text style={paragraph}>
          You can now explore available courses, take assessments, and set up
          reminders to keep you on track.
        </Text>

        {/* CTA */}
        <Section style={{ textAlign: 'center', padding: '24px 0' }}>
          <Button
            href="https://scholarark.com/dashboard"
            style={button}
          >
            Get Started
          </Button>
        </Section>

        <Text style={signoff}>
          🚀<br />
          The ScholarArk Team
        </Text>
      </Section>
    </EmailLayout>
  );
};
