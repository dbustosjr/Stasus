import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { SkipLink } from "@/components/skip-link";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Stasus",
    template: "%s · Stasus",
  },
  description:
    "A calm wellness space to track vestibular symptoms, practice rehab exercises, and reclaim steadier days.",
  applicationName: "Stasus",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Stasus",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#001219",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} dark h-full`}
    >
      <body className="min-h-full bg-[var(--stasus-bg)] font-sans text-[var(--stasus-ink)] antialiased">
        <SkipLink />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
