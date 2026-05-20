'use client';

import { useTranslations } from 'next-intl';

export function DemoBanner() {
  // process.env.NEXT_PUBLIC_DEMO_MODE is a Next.js build-time inlined constant —
  // the condition is constant within any given build, so the hook below is
  // always-called or never-called, satisfying the Rules of Hooks.
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== '1') {
    return null;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations('DemoBanner');

  return (
    <div
      role="status"
      className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100 text-sm py-2 px-4 text-center border-b border-yellow-300 dark:border-yellow-800"
    >
      {t('notice')}
      {' '}
      {t('credentials')}{' '}
      <code className="font-mono">admin@example.com / admin123</code>
      {' '}{t('or')}{' '}
      <code className="font-mono">manager@example.com / manager123</code>
    </div>
  );
}
