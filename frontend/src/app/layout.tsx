import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'AI-Pesa - Intelligent Financial Assistant',
    description: 'Your personal AI-powered financial assistant for M-Pesa transactions',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Toaster />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
} 