'use client';

import { useAuthStatus } from '@/lib/useAuthStatus';

export default function PricingEmailLimitNote() {
  const { authMethod } = useAuthStatus();

  if (authMethod !== 'clerk') return null;

  return (
    <div className="card" style={{ borderColor: 'var(--accent)', fontSize: 14, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Email login limits</div>
      <div className="muted">
        Email logins are currently limited to free micro-sends (≤50 MB). A subscription module
        coming soon will allow more and larger sends.
      </div>
    </div>
  );
}
