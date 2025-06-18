import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import { ApolloProviderWrapper } from "@/contexts/apollo-provider";
import { Toaster } from "@/components/ui/toaster";
import { GlobalNotificationListener } from "@/components/global-notification-listener";
import { NotificationInitializer } from "@/components/notification-initializer";
import { AudioPreloader } from "@/components/audio-preloader";

export const metadata: Metadata = {
  title: "LAMG-Messages",
  description: "Application de messagerie LAMG créée avec Next.js",
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
            <AudioPreloader />
            <NotificationInitializer />
            <GlobalNotificationListener />
            {children}
            <Toaster />
          </AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
