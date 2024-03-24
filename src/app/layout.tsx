import "./globals.css";
import localFont from 'next/font/local';

const monoSans = localFont({src: '../../public/fonts/MonaSansCondensed-Bold.woff2'});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kr">
      <body className={monoSans.className}>{children}</body>
    </html>
  );
}
