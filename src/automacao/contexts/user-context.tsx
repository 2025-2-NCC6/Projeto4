"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Usuario {
  id: number
  nome: string
  email: string
  curso?: string
  periodo?: string
  tipo_usuario: "aluno" | "professor" | "funcionario"
  rfid_codigo?: string
}

interface UserContextType {
  usuario: Usuario | null
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    // Simular usuário logado (remover em produção)
    const mockUser: Usuario = {
      id: 1,
      nome: "João Silva",
      email: "joao.silva@fecap.br",
      curso: "Análise e Desenvolvimento de Sistemas",
      periodo: "5º Semestre",
      tipo_usuario: "aluno",
      rfid_codigo: "1234567890"
    }
    setUsuario(mockUser)
  }, [])

  const login = async (email: string, senha: string): Promise<boolean> => {
    // Implementar autenticação real posteriormente
    return true
  }

  const logout = () => {
    setUsuario(null)
  }

  return (
    <UserContext.Provider value={{
      usuario,
      login,
      logout,
      isAuthenticated: !!usuario
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

