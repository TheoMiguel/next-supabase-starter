import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BaseEmailProps {
  preview: string;
  heading: string;
  body: string;
}

export function BaseEmail({ preview, heading, body }: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
            <Heading style={{ fontSize: "24px", marginBottom: "16px" }}>{heading}</Heading>
            <Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#374151" }}>{body}</Text>
            <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} />
            <Text style={{ fontSize: "12px", color: "#9ca3af" }}>
              Este es un email automático, no respondas a este mensaje.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
