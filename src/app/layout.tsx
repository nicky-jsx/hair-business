import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { StylistStoreProvider } from "@/context/StylistStoreProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Strand — Find Your Professional in London",
  description: "Discover talented hair and beauty professionals across London",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Strand",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#c43d30",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-dvh`}
      >
        <StylistStoreProvider>
          <ServiceWorkerRegistration />
          <SplashScreen />
          <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-surface lg:my-4 lg:min-h-[calc(100dvh-2rem)] lg:rounded-3xl lg:shadow-xl lg:ring-1 lg:ring-gray-200">
            <Header />
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
          <InstallPrompt />
        </StylistStoreProvider>
      </body>
    </html>
  );
}
