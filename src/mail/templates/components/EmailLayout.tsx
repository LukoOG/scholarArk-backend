import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
}

export const EmailLayout = ({ children }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {children}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} ScholarArk
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
};

const footer = {
  marginTop: '32px',
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa',
  textAlign: 'center' as const,
};
