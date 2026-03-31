'use client';

import { PortalProvider } from '@/lib/portal-context';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      {children}
    </PortalProvider>
  );
}
