'use client';

import { usePathname } from 'next/navigation';

export default function TelegramButton() {
  const pathname = usePathname();
  
  // Pages where Telegram button should be shown
  const showOnPages = [
    '/', // Home page
    '/search', // Search page
    '/about',
    '/terms',
    '/privacy',
    '/blog',
    '/faq',
    '/contact',
    '/how-it-works',
  ];

  // Check if current page is a city escorts page (e.g., /new-york/escorts)
  const isCityPage = pathname && /^\/[^/]+\/escorts$/.test(pathname);

  // Check if we should show the button
  const shouldShow = showOnPages.includes(pathname || '') || isCityPage;

  if (!shouldShow) {
    return null;
  }

  const openTelegram = () => {
    window.open('https://t.me/kissblowme', '_blank');
  };

  return (
    <button
      type="button"
      onClick={openTelegram}
      className="fixed bottom-40 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:opacity-90 shadow-lg"
      style={{ backgroundColor: 'var(--primary-blue)' }}
      aria-label="Open Telegram chat"
      title="Chat with us on Telegram"
    >
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        style={{ color: '#ffffff' }}
      >
        <path d="M21.5 2.5L2 12l6.5 3L20.5 5l-9 9 6 6.5 3.5-18z"/>
      </svg>
    </button>
  );
}

