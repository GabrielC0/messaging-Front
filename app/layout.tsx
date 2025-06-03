import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import { ApolloProviderWrapper } from "@/contexts/apollo-provider";
import { BackendStatusAlert } from "@/components/backend-status-alert";
import { BackendMonitor } from "@/components/backend-monitor";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "WhatsApp Clone",
  description: "Un clone de WhatsApp créé avec Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ApolloProviderWrapper>
          <AuthProvider>
            <BackendMonitor />
            {children}
            <BackendStatusAlert />
            <Toaster />
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
