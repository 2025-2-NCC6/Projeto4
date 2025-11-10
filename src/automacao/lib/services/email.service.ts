/**
 * Serviço de envio de emails
 * Envia emails de confirmação de cadastro
 */

import nodemailer from "nodemailer"

// Configuração do transporter (use suas credenciais SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export class EmailService {
  /**
   * Envia email de confirmação de cadastro
   */
  static async sendRegistrationConfirmation(
    userEmail: string,
    userName: string,
    userType: string
  ): Promise<{ success: boolean; error?: string }> {
    // Se SMTP não estiver configurado, apenas loga
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️ SMTP não configurado. Email NÃO enviado para:", userEmail)
      console.log(`📧 [SIMULADO] Email de confirmação para ${userName} (${userType})`)
      return { success: true } // Retorna sucesso para não bloquear cadastro
    }

    try {
      const mailOptions = {
        from: `"Sistema Totem FECAP" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: "✅ Cadastro realizado com sucesso - FECAP",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488; }
              .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .info-label { font-weight: bold; color: #6b7280; }
              .info-value { color: #111827; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
              .badge { display: inline-block; padding: 5px 15px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎉 Bem-vindo(a)!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Seu cadastro foi realizado com sucesso</p>
              </div>
              
              <div class="content">
                <h2 style="color: #0d9488; margin-top: 0;">Olá, ${userName}!</h2>
                
                <p>Seu cadastro no sistema de automação do campus FECAP foi realizado com sucesso.</p>
                
                <div class="info-box">
                  <h3 style="margin-top: 0; color: #111827;">📋 Informações do Cadastro</h3>
                  
                  <div class="info-row">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${userName}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${userEmail}</span>
                  </div>
                  
                  <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Tipo:</span>
                    <span class="info-value">
                      <span class="badge">${this.getTypeBadge(userType)}</span>
                    </span>
                  </div>
                </div>
                
                <h3 style="color: #0d9488;">📱 Próximos Passos</h3>
                <ul style="line-height: 2;">
                  <li>Dirija-se a um dos totems do campus</li>
                  <li>Aproxime seu cartão RFID do leitor</li>
                  <li>Seu cartão será vinculado automaticamente ao seu cadastro</li>
                  <li>Após a vinculação, você terá acesso às salas e laboratórios</li>
                </ul>
                
                <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <strong>⚠️ Importante:</strong> Guarde este email para referência futura. Em caso de dúvidas, entre em contato com o suporte técnico.
                </p>
              </div>
              
              <div class="footer">
                <p>Este é um email automático, não responda.</p>
                <p>© ${new Date().getFullYear()} FECAP - Centro Universitário</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Olá, ${userName}!

Seu cadastro no sistema de automação do campus FECAP foi realizado com sucesso.

Informações do Cadastro:
- Nome: ${userName}
- Email: ${userEmail}
- Tipo: ${this.getTypeBadge(userType)}

Próximos Passos:
1. Dirija-se a um dos totems do campus
2. Aproxime seu cartão RFID do leitor
3. Seu cartão será vinculado automaticamente ao seu cadastro
4. Após a vinculação, você terá acesso às salas e laboratórios

Este é um email automático, não responda.
© ${new Date().getFullYear()} FECAP - Centro Universitário
        `,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log("✅ Email enviado:", info.messageId)
      return { success: true }
    } catch (error) {
      console.error("❌ Erro ao enviar email:", error)
      return { success: false, error: "Erro ao enviar email de confirmação" }
    }
  }

  private static getTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      professor: "Professor",
      tecnico: "Técnico/Funcionário",
      aluno: "Aluno",
      visitante: "Visitante",
    }
    return badges[type] || type
  }

  /**
   * Verifica se o serviço de email está configurado
   */
  static isConfigured(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  }
}

