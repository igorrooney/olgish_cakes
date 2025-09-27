import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Email Testing Tool | Olgish Cakes Admin",
  description: "Test email templates and preview email content",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TestEmailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
