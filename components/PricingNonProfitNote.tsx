'use client';

import { useAuthStatus } from '@/lib/useAuthStatus';

export default function PricingNonProfitNote() {
  const { hasClerk } = useAuthStatus();

  if (hasClerk) return null;

  return (
    <div
      className="card muted"
      style={{ borderColor: 'var(--accent)', fontSize: 14, lineHeight: 1.6 }}
    >
      In its early days, 3send is launched as a{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>non-profit, privacy-first</span>{' '}
      application, designed to make secure, decentralized communication accessible to everyone.
      The platform operates entirely without revenue, relying only on{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>R1 burn payments</span> - a symbolic
      and transparent tribute to{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Ratio1</span>, the decentralized
      protocol that powers 3send&apos;s{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>encrypted storage</span>,{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>verifiable state</span>, and{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>trustless delivery</span>. No
      profits are collected; every burn simply reinforces the sustainability of the underlying
      infrastructure. As the ecosystem matures, 3send will introduce optional{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>subscription bundles</span>{' '}
      offering expanded capabilities for teams, enterprises, and power users. We also do not
      exclude the possibility of a{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>dedicated token</span> in the future
      - if and when it serves the community and the protocol responsibly. But for now, 3send
      remains fully non-profit, open, and aligned with the principles of{' '}
      <span style={{ color: 'var(--accent)', fontWeight: 700 }}>decentralization</span>, committed
      to building a universal encrypted communication layer for the internet.
    </div>
  );
}
