// The page shell. The whole example is one page (app/page.jsx), so there is no
// navigation to set up here.
import localFont from 'next/font/local';
import '@twinkleplop/theme-github/light';
import './globals.css';

const roobert = localFont({
  src: [
    { path: '../public/fonts/roobert/Roobert-Regular.woff2', weight: '400' },
    { path: '../public/fonts/roobert/Roobert-Medium.woff2', weight: '500' },
    { path: '../public/fonts/roobert/Roobert-SemiBold.woff2', weight: '600' }
  ],
  variable: '--font-roobert',
  display: 'swap',
  preload: false
});

export const metadata = {
  title: 'MindCloud MCP',
  description: 'Minimal AI agent that calls MindCloud MCP for one end user at a time.',
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }]
  }
};

export default function RootLayout({ children }) {
  return (
    // Browser extensions can add attributes to this element before hydration.
    <html lang="en" className={roobert.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
