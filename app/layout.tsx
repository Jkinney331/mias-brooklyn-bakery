import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AppProvider } from '@/components/providers/app-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "Mia's Brooklyn Bakery - Management System",
  description: 'Multi-location bakery management system for ordering, delivery tracking, and operations',
  keywords: ['bakery', 'management', 'orders', 'delivery', 'brooklyn'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}