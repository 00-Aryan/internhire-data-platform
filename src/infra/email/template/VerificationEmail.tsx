import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  name: string;
  confirmLink: string;
}

export default function VerificationEmail({
  name,
  confirmLink,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for InternHire</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerText}>InternHire</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h2}>Welcome, {name}!</Heading>
            <Text style={text}>
              Thanks for signing up for InternHire. We're excited to have you on
              board! To get started, please verify your email address by clicking
              the button below.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={confirmLink}>
                Verify Email Address
              </Button>
            </Section>
            <Text style={text}>
              If the button above doesn't work, copy and paste the following link
              into your browser:
            </Text>
            <Link href={confirmLink} style={link}>
              {confirmLink}
            </Link>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} InternHire. All rights reserved.
            </Text>
            <Text style={footerText}>
              If you didn't sign up for InternHire, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f7",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#2563eb",
  padding: "24px",
  textAlign: "center" as const,
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

const headerText = {
  color: "#ffffff",
  margin: "0",
  fontSize: "24px",
  fontWeight: "bold",
};

const content = {
  padding: "32px 24px",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const footer = {
  backgroundColor: "#f9fafb",
  padding: "24px",
  textAlign: "center" as const,
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "4px 0",
};