import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/shared/query-provider";
import AuthBootstrapProvider from "@/components/shared/auth-bootstrap-provider";

export const metadata: Metadata = {
  title: "GoHRIS | Modern Human Resource Information System",
  description: "Simplify your HR operations with GoHRIS. The all-in-one platform for payroll, attendance, and employee management.",
};

const sans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Outfit({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased overflow-x-hidden`}>
        <QueryProvider>
          <AuthBootstrapProvider>{children}</AuthBootstrapProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
