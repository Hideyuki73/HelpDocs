import { Provider } from '@/components/ui/provider'
import { Inter } from 'next/font/google'
import MainLayout from './components/layout/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'HelpDocs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <MainLayout>{children}</MainLayout>
    </Provider>
  )
}
