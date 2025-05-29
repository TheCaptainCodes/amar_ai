import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amar AI | AI Teaching Platform",
  description: "Real-time AI Teaching Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/logo_icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo_icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo_icons/favicon-16x16.png" />
        <link rel="manifest" href="/logo_icons/site.webmanifest" />
        <link rel="shortcut icon" href="/logo_icons/favicon.ico" />
      </head>
      <body className={`${bricolage.variable} antialiased flex flex-col min-h-screen`}>
        <NextTopLoader showSpinner={false} />
        <ClerkProvider appearance={{ variables: { colorPrimary: '#fe5933' }} }>
          <Navbar />
          <div className="flex flex-grow items-center justify-center w-full">
            {children}
          </div>
        </ClerkProvider>
        {/* Simple footer */}
        <footer className="text-center py-4 text-gray-600 text-sm">
          © {new Date().getFullYear()} Amar AI<br />
          By Students, For Students
        </footer>
      </body>
    </html>
  );
}
