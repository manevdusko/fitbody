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
        {/* Single Page Apps for GitHub Pages - Redirect handler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(l) {
                if (l.search[1] === '/' ) {
                  var decoded = l.search.slice(1).split('&').map(function(s) { 
                    return s.replace(/~and~/g, '&')
                  }).join('?');
                  window.history.replaceState(null, null,
                      l.pathname.slice(0, -1) + decoded + l.hash
                  );
                }
              }(window.location))
            `,
          }}
        />
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