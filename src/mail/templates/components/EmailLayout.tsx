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

export const footerText = {
  fontSize: '12px',
  color: '#8898aa',
  textAlign: 'center' as const,
};

export const heading = {
  fontSize: '24px',
  fontWeight: '600',
  marginBottom: '12px',
};

export const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: '14px',
};

export const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
};

export const signoff = {
  fontSize: '14px',
  marginTop: '24px',
};
