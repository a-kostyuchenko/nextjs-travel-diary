import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Navbar from '@/app/components/Navbar';
import SessionProvider from '@/app/components/SessionProvider';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Дневник путешествий',
  description: 'Планируйте, записывайте и делитесь своими путешествиями',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <SessionProvider session={session}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="bg-white shadow-inner py-6 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <p className="text-gray-700 text-sm">
                      &copy; 2023 Дневник путешествий. Все права защищены.
                    </p>
                  </div>
                  <div className="flex space-x-6">
                    <a href="#" className="text-gray-500 hover:text-gray-900">
                      О проекте
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900">
                      Правила
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900">
                      Контакты
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
