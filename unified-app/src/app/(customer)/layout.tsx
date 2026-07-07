import './globals.css';
import { Providers } from './providers';
import { satoshi } from './fonts';
import { META_PIXEL_BASE_CODE, META_PIXEL_ID } from './meta-pixel';
import Script from 'next/script';

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${satoshi.variable} ${satoshi.className}`}>
      <Script id="meta-pixel" strategy="afterInteractive">
        {META_PIXEL_BASE_CODE}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Providers>{children}</Providers>
    </div>
  );
}
