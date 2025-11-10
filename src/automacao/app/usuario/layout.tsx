import { UserProvider } from "@/contexts/user-context"
import UserLayout from "@/components/layout/user-layout"
import { Toaster } from "@/components/ui/toaster"

export default function UsuarioRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <UserLayout>{children}</UserLayout>
      <Toaster />
    </UserProvider>
  )
}

