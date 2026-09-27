import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/navigation/site-header";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { getLoggedInUser } from "@/lib/services";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarryShare – Share the Journey. Share the Bag.",
  description:
    "CarryShare helps travelers on the same flight find each other and coordinate sharing extra checked luggage.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const currentUser = await getLoggedInUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader currentUser={currentUser} />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <MobileNav />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
