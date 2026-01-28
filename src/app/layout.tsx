import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { PortfolioProvider } from '@/contexts/PortfolioContext'; // Import PortfolioProvider

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Crypto Swing Analyzer',
  description: 'Realtime H4 & D1 Market Data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} bg-dark-background text-text-primary`}>
        <PortfolioProvider> {/* Wrap children with PortfolioProvider */}
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}

