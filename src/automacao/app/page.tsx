"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/totem/welcome-screen"
import { RegistrationForm } from "@/components/totem/registration-form"
import { CardTapAnimation } from "@/components/totem/card-tap-animation"
import { ConfirmationScreen } from "@/components/totem/confirmation-screen"
import { RoomAccessScreen } from "@/components/totem/room-access-screen"
import { createRegistration } from "@/lib/api/registration-client"
import { useToast } from "@/hooks/use-toast"

export default function TotemPage() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "registration" | "card-tap" | "confirmation" | "room-access">(
    "welcome",
  )
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    type: "",
    userId: null as number | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleStartRegistration = () => {
    setCurrentScreen("registration")
  }

  const handleRoomAccess = () => {
    setCurrentScreen("room-access")
  }

  const handleRegistrationSubmit = async (data: { name: string; email: string; type: string }) => {
    setIsLoading(true)
    try {
      // Salvar no banco de dados
      const result = await createRegistration({
        name: data.name,
        email: data.email, // Email é obrigatório
        type: data.type as "professor" | "tecnico" | "aluno" | "visitante",
        cardId: null,
      })

      if (!result.success) {
        // Mensagem genérica por segurança (não revela se email existe)
        const errorMessage = result.error || "Não foi possível completar o cadastro."
        
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: errorMessage.includes("email")
            ? "Verifique o email informado e tente novamente."
            : errorMessage,
        })
        setIsLoading(false)
        return
      }

      // Salvar dados incluindo o ID do usuário criado
      setRegistrationData({
        ...data,
        userId: result.data?.id || null,
      })
      setCurrentScreen("card-tap")
    } catch (error) {
      console.error("Erro ao processar registro:", error)
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar seu cadastro. Tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardTapComplete = () => {
    setCurrentScreen("confirmation")
  }

  const handleReset = () => {
    setCurrentScreen("welcome")
    setRegistrationData({ name: "", email: "", type: "", userId: null })
  }

  return (
    <main className="min-h-screen w-full bg-background">
      {currentScreen === "welcome" && (
        <WelcomeScreen onNewRegistration={handleStartRegistration} onAlreadyRegistered={handleRoomAccess} />
      )}
      {currentScreen === "registration" && (
        <RegistrationForm
          onSubmit={handleRegistrationSubmit}
          onBack={() => setCurrentScreen("welcome")}
          isLoading={isLoading}
        />
      )}
      {currentScreen === "card-tap" && (
        <CardTapAnimation
          data={registrationData}
          onComplete={handleCardTapComplete}
          userId={registrationData.userId}
        />
      )}
      {currentScreen === "confirmation" && <ConfirmationScreen email={registrationData.email} onReset={handleReset} />}
      {currentScreen === "room-access" && (
        <RoomAccessScreen onBack={() => setCurrentScreen("welcome")} />
      )}
    </main>
  )
}
