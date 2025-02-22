import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { AnchorProvider, Nice1Provider } from '@nice1/react-tools'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { BlogProvider } from './hooks/blog'
import Routes from './routes'
import reportWebVitals from './reportWebVitals'
import * as serviceWorker from './serviceWorker'
import theme from './theme'
import { NftSimpleAssetsProvider } from './hooks/NftSimpleAssets'
import { NftSimpleMarketProvider } from './hooks/NftSimpleMarket'
import { NftAtomicAssetsProvider } from './hooks/NftAtomicAssets'
import { NftAtomicMarketProvider } from './hooks/NftAtomicMarket'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('failed to find root element')
}

const root = createRoot(rootElement)

root.render(
  //  <React.StrictMode>
  //  <ColorModeScript />
    <ChakraProvider theme={theme}>
      <AnchorProvider sessionKey='nice1-l1nk'>
        <Nice1Provider>
          <BlogProvider>
            <NftSimpleAssetsProvider>
              <NftSimpleMarketProvider>
                <NftAtomicAssetsProvider>
                  <NftAtomicMarketProvider>
                    <BrowserRouter basename={process.env.PUBLIC_URL}>
                      <Routes />
                    </BrowserRouter>
                  </NftAtomicMarketProvider>
                </NftAtomicAssetsProvider>
              </NftSimpleMarketProvider>
            </NftSimpleAssetsProvider>
          </BlogProvider>
        </Nice1Provider>
      </AnchorProvider>
    </ChakraProvider>
  //</React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
