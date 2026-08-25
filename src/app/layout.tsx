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
    "A live diagnosis of the physical slots that throttle Britain: state hardware, planning, grid connections, firm power, and hospital beds. Not a hotel map. Not a manifesto tick-list.",
  openGraph: {
    title: "The Operating Picture",
    description:
      "Britain's binding constraints. Watch the slot that is at 100%, not the queue it produces.",
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
