import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getDirection } from "./lib/i18n/config";
import { getRequestLocale } from "./lib/i18n/request";
import { AudioProvider } from "./lib/audio/AudioProvider";
import StoreHeader from "./components/store/StoreHeader";
import GlobalSearch from "./components/search/GlobalSearch";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YAS",
  description: "YAS Smart Commerce",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const direction = getDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      translate="no"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AudioProvider>
          <StoreHeader locale={locale} />
          <GlobalSearch locale={locale} />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
