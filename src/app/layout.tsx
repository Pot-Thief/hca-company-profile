import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// One variable family carries both display and body. Loaded without a weight
// list so the whole 100-900 range comes through, plus the width axis, which is
// what separates the display setting from the body setting. Two settings of one
// family read as a designed system; two families read as a curated magazine.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
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
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
