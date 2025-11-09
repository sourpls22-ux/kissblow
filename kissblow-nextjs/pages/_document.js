import { Html, Head, Main, NextScript } from 'next/document'

export default function Document({ lang = 'en' }) {
  return (
    <Html lang={lang}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

Document.getInitialProps = async (ctx) => {
  // Определяем язык из URL пути
  const path = ctx.asPath || ctx.pathname || ''
  const lang = path.startsWith('/ru') || path === '/ru' ? 'ru' : 'en'
  
  const initialProps = await ctx.defaultGetInitialProps(ctx)
  
  return {
    ...initialProps,
    lang
  }
}

