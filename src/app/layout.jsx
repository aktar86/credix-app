import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { siteConfig } from "@/lib/siteConfig";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: "CredixApp | Free CGPA Calculator",
    template: "%s | CredixApp",
  },

  description: siteConfig.description,

  applicationName: "CredixApp",

  keywords: [
    "CredixApp",
    "CGPA calculator",
    "GPA calculator",
    "free CGPA calculator",
    "semester GPA calculator",
    "cumulative GPA calculator",
    "CGPA report card",
  ],

  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CredixApp",
    title: "CredixApp | Free CGPA Calculator",
    description: siteConfig.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CredixApp CGPA Calculator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "CredixApp | Free CGPA Calculator",
    description: siteConfig.description,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  category: "education",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-surface print:hidden">
          <Navbar />
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {children}
        </main>

        <footer className="border-t border-border py-6 text-center text-sm text-muted print:hidden">
          ©2026 CredixApp. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
