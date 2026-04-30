import '../styles/globals.css'
import { AppStateProvider } from '../hooks/AppStateContext'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }) {
  return (
    <AppStateProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppStateProvider>
  )
}
