import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackToTopButton from "@/components/layout/BackToTopButton";
import TelegramButton from "@/components/layout/TelegramButton";
import AgeVerificationModal from "@/components/layout/AgeVerificationModal";
import { ThemeProvider } from "./theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KissBlow - Profile Directory",
  description: "Modern profile directory with search and filtering",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen transition-colors`}
        style={{ 
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', 
          fontSize: '14px',
        }}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
                // Add js-loaded class to hide server-rendered content
                document.documentElement.classList.add('js-loaded');
              })();
            `,
          }}
        />
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <TelegramButton />
          <BackToTopButton />
          <AgeVerificationModal />
        </ThemeProvider>
        <script async src="https://atlos.io/packages/app/atlos.js"></script>
      </body>
    </html>
  );
}
