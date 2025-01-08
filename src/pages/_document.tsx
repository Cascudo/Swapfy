import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#103145" />

          <meta
            name="description"
            content="SWAPFY Terminal: Best Pools, Fast Swaps, Low Fees. Powered by Jupiter Terminal."
          />

          <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
          <link rel="apple-touch-icon" href="/apple-icon-57x57.png" />
          
          {/* Optimized font loading */}
          <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
            crossOrigin="anonymous"
          />
        </Head>
        {/* Default to dark mode */}
        <body className="text-black dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;