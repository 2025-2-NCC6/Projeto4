import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

// Inicializa MQTT no servidor
if (typeof window === "undefined") {
  import("@/lib/mqtt/mqtt-init").then((module) => {
    module.initializeMQTT()
  })
}

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: 'EnerSave',
  description: 'EnerSave - Sistema Inteligente de Gestão de Energia',
  generator: 'EnerSave',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br" className={poppins.variable}>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
