import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import EmotionRegistry from '@/components/admin/EmotionRegistry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dugod Admin',
  description: 'Admin dashboard for Dugod',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <link
        href="https://fonts.cdnfonts.com/css/old-english-five"
        rel="stylesheet"
      />
      <EmotionRegistry>
        <Providers>{children}</Providers>
      </EmotionRegistry>
    </div>
  );
}
