import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import { ExtensionErrorSuppressor } from "@/components/ui/ExtensionErrorSuppressor";
import { SITE_URL } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hair Korter — Find Your Professional in London",
    template: "%s",
  },
  description: "Discover talented hair and beauty professionals across London",
  manifest: "/manifest.json",
  applicationName: "Hair Korter",
  openGraph: {
    type: "website",
    siteName: "Hair Korter",
    title: "Hair Korter — Find Your Professional in London",
    description: "Discover talented hair and beauty professionals across London",
    locale: "en_GB",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "Hair Korter — Find Your Professional in London",
    description: "Discover talented hair and beauty professionals across London",
    images: ["/icons/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hair Korter",
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
  viewportFit: "cover",
  themeColor: "#fbf9f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV !== "production" && <ExtensionErrorSuppressor />}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${montserrat.variable} font-sans min-h-dvh`}
      >
        <AuthProvider>
          <ServiceWorkerRegistration />
          <SplashScreen />
          <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:rounded-3xl lg:shadow-2xl lg:ring-1 lg:ring-black/10 overflow-x-hidden">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav />
          </div>
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
