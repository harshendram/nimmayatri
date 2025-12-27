import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { LiveAssistantProvider } from "@/context/LiveAssistantContext";
import FloatingLiveAssistant from "@/components/FloatingLiveAssistant";

export const metadata: Metadata = {
  title: "Nimma Yatri | Bengaluru Auto Survival Tool",
  description: "Your AI-powered wingman for negotiating with Bengaluru auto drivers. Fair fares, local slang, and street-smart tips.",
  keywords: ["Bengaluru", "auto rickshaw", "fare calculator", "Kannada", "negotiation", "auto fare"],
  authors: [{ name: "Nimma Yatri" }],
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛺</text></svg>", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Nimma Yatri | Bengaluru Auto Survival Tool",
    description: "Never get scammed by auto drivers again. AI-powered fare calculator and negotiation assistant.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFD700",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛺</text></svg>" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <LiveAssistantProvider>
            {children}
            <FloatingLiveAssistant />
          </LiveAssistantProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
