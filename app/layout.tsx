import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HBOX LeadPulse AI — Client Acquisition & Staff Augmentation Engine',
  description: 'AI-powered client acquisition pipeline for HBOX Digital. Scrape, score, and qualify high-value IT staff augmentation contracts across Upwork, Freelancer, Dice, and LinkedIn.',
};

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

import Providers from '@/components/Providers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || 'user';

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {session ? (
            <div className="flex min-h-screen">
              <Sidebar role={role} />
              <main className="flex-1 ml-60 min-h-screen">
                {children}
              </main>
            </div>
          ) : (
            <main className="min-h-screen flex flex-col">
              {children}
            </main>
          )}
        </Providers>
      </body>
    </html>
  );
}
