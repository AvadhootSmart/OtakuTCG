import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Barlow_Condensed, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const barlow = Barlow_Condensed({
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "OtakuTCG - Anime Trading Card Game",
  description: "Fan made Anime Trading Card Game",
};

export const viewport: Viewport = {
  themeColor: "#07070b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${barlow.variable} ${geist.variable} antialiased`}>
        <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            className: "!bg-[#0f0f15] !border-white/10 !text-foreground !font-sans !rounded-md",
          }}
        />
      </body>
    </html>
  );
}
