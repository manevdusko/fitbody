import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get favicon path for WordPress deployment
  const getFaviconPath = (path: string) => {
    // In production (WordPress), use theme path
    if (process.env.NODE_ENV === 'production') {
      return `https://fitbody.mk/wp-content/themes/fitbody-ecommerce${path}`;
    }
    // In development, use root path
    return path;
  };

  return (
    <Html lang="mk">
      <Head>
        <link rel="icon" href={getFaviconPath("/favicon.svg")} type="image/svg+xml" />
        <link rel="icon" href={getFaviconPath("/favicon.ico")} />
        <link rel="apple-touch-icon" href={getFaviconPath("/apple-touch-icon.png")} />
        <meta name="theme-color" content="#f97316" />
        <meta name="description" content="FitBody.mk - Вашиот партнер за фитнес и здравје" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}