import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Griha AI — Indian interior design visualizer',
  description: 'Generate AI-powered interior design ideas for your Indian home',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
