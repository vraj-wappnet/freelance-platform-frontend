// import './globals.css';
// import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
// import { ThemeProvider } from '@/components/ui/theme-provider';
// import { store } from '@/lib/store';
// import { Provider } from 'react-redux';


// const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: 'ConnectLance - Freelance Work Platform',
//   description: 'The premier platform for freelancers and clients to collaborate securely with our multi-stage contract system.',
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={inter.className}>
//                 <Provider store={store}>
//         <ThemeProvider
//           attribute="class"
//           defaultTheme="system"
//           enableSystem
//           disableTransitionOnChange
//         >
//           {children}
//         </ThemeProvider>
//         </Provider>
//       </body>
//     </html>
//   );
// }


import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientProvider from './ClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ConnectLance - Freelance Work Platform',
  description: 'The premier platform for freelancers and clients to collaborate securely with our multi-stage contract system.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}