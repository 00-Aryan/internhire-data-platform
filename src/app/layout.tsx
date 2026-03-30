import type { Metadata, Viewport } from "next";
// 1. Import Google Font for optimized loading & zero layout shift
import localFont from 'next/font/local';




import "./globals.css";
import { Toaster } from "sonner";

import { NotificationProvider } from '@/shared/notifications/NotificationProvider';
import SuccessModal from '@/shared/notifications/SuccessModal';

// 2. Configure the font
const inter = localFont({
  src: '../../public/fonts/inter/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  // This base URL allows us to use relative paths for images below
  metadataBase: new URL("https://internhire.in"),
  title: "InternHire",
  description: "Connect with employers and find the desired internship opportunities to kickstart your career.",
  openGraph: {
    title: "InternHire",
    description: "Connect with employers and find the desired internship opportunities to kickstart your career.",
    url: "https://internhire.in",
    siteName: "InternHire",
    images: [
      {
        url: "/opengraph-image.png", // Must match the file in your public folder
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <NotificationProvider>
          {children}
          <SuccessModal />
          {/* Overlays should live OUTSIDE layout flow */}
          <Toaster position="top-right" richColors />
        </NotificationProvider>
      </body>
    </html>
  );
}
