import { Provider } from '@/components/ui/provider'
import MainLayout from './components/layout/MainLayout'

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
