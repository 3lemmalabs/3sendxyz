import type { Metadata } from 'next';
import Image from 'next/image';

const MAC_APP_DOWNLOAD_URL =
  'https://github.com/3lemmalabs/3sendxyz-app/releases/latest/download/3sendxyz-app-mac-universal.dmg';
const WIN_APP_DOWNLOAD_URL =
  'https://github.com/3lemmalabs/3sendxyz-app/releases/latest/download/3sendxyz-app-win-x64.zip';

export const metadata: Metadata = {
  title: 'Download Desktop App - 3send.xyz',
  description: 'Download the 3send.xyz desktop app for macOS and Windows.',
};

type DownloadCardProps = {
  platform: string;
  description: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
};

function DownloadCard({
  platform,
  description,
  href,
  logoSrc,
  logoAlt,
  logoWidth,
  logoHeight,
}: DownloadCardProps) {
  return (
    <article className="card col" style={{ gap: 14 }}>
      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
        <Image src={logoSrc} alt={logoAlt} width={logoWidth} height={logoHeight} />
        <div style={{ fontWeight: 700, fontSize: 18 }}>{platform}</div>
      </div>

      <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
        {description}
      </p>

      <a
        className="button accent"
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ width: 'fit-content' }}
      >
        Download for {platform}
      </a>
    </article>
  );
}

export default function DownloadPage() {
  return (
    <main className="col" style={{ gap: 24 }}>
      <section className="hero">
        <div className="headline">Desktop App Downloads</div>
        <div className="subhead">Install 3send.xyz on macOS or Windows.</div>
      </section>

      <section
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        <DownloadCard
          platform="macOS"
          description="Universal installer for Apple Silicon and Intel Mac."
          href={MAC_APP_DOWNLOAD_URL}
          logoSrc="/apple_logo.svg"
          logoAlt="Apple logo"
          logoWidth={24}
          logoHeight={30}
        />
        <DownloadCard
          platform="Windows"
          description="Windows installer."
          href={WIN_APP_DOWNLOAD_URL}
          logoSrc="/windows_logo.svg"
          logoAlt="Windows logo"
          logoWidth={30}
          logoHeight={30}
        />
      </section>
    </main>
  );
}
