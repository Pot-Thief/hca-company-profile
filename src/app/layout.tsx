import type { Metadata } from 'next';
import { Archivo, Bodoni_Moda, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-bodoni',
});

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-archivo',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = { title: 'Company Profile' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
