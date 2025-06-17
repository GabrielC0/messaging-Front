import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import { ApolloProviderWrapper } from "@/contexts/apollo-provider";
import { BackendStatusAlert } from "@/components/backend-status-alert";
import { BackendMonitor } from "@/components/backend-monitor";
import { CloudStatusMonitor } from "@/components/cloud-status-monitor";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "WhatsApp Clone",
  description: "Un clone de WhatsApp créé avec Next.js - Maintenant avec infrastructure cloud !",
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
            {/* Nouveau composant pour surveiller la connectivité cloud */}
            <CloudStatusMonitor />
            {/* Composant legacy pour la compatibilité */}
            <BackendStatusAlert />
            <Toaster />
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
