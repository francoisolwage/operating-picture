import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const source = Source_Serif_4({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "The Operating Picture - Britain's binding constraints",
    template: "%s - The Operating Picture",
  },
  description:
    "A mill is waiting on a plug. A nurse is waiting on a bed. Five physical slots throttle Britain: hardware, planning, grid, firm power, and hospital beds.",
  openGraph: {
    title: "The Operating Picture",
    description:
      "A mill is waiting on a plug. A nurse is waiting on a bed. Watch the slot that is at 100%.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={`${source.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
