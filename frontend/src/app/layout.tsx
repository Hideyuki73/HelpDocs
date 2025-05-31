import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import MainLayout from './components/layout/MainLayot'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HelpDocs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Provider>
          <MainLayout>{children}</MainLayout>
        </Provider>
      </body>
    </html>
  )
}
