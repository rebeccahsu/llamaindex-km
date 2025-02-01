import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import "./globals.css";
import "./markdown.css";
import mongoDBConnect from "@/lib/mongodb";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KM POC",
  description: "",
};

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await mongoDBConnect()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}
