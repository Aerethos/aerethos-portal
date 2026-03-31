import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AerEthos — Student Portal',
  description: 'Submit your yearbook content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
