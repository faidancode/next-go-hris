import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/shared/query-provider";
import AuthBootstrapProvider from "@/components/shared/auth-bootstrap-provider";

export const metadata: Metadata = {
  title: "Admin GoHRIS",
  description: "Admin GoHRIS",
};

const sans = Plus_Jakarta_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={sans.className}>
        <QueryProvider>
          <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
