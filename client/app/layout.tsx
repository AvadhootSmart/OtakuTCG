import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Rock_Salt } from "next/font/google";
import "./globals.css";

const rockSalt = Rock_Salt({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rock-salt",
});

export const metadata: Metadata = {
  title: "OtakuTCG - Anime Trading Card Game",
  description: "Anime Trading Card Game",
};

import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rockSalt.variable} antialiased`}>
        <main>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Navbar /> */}
            {children}
          </ThemeProvider>
          <Toaster richColors />
        </main>
      </body>
    </html>
  );
}
