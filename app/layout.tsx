import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-provider";
import { ApolloProviderWrapper } from "@/contexts/apollo-provider";

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
          <AuthProvider>{children}</AuthProvider>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}
