import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY || "dummy-key");

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@falachefe.com";
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (result.error) {
        console.error("Erro ao enviar email:", result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async sendMagicLinkEmail(
    email: string,
    magicLink: string,
    userName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = "🔗 Seu link mágico para o FalaChefe";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Mágico - FalaChefe</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .magic-link {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .magic-link:hover {
              transform: translateY(-2px);
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 12px;
              margin: 20px 0;
              font-size: 14px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 FalaChefe</div>
              <h1 class="title">Seu link mágico chegou!</h1>
            </div>
            
            <div class="content">
              <p>Olá${userName ? ` ${userName}` : ""}!</p>
              
              <p>Você solicitou acesso ao FalaChefe. Clique no botão abaixo para fazer login de forma segura:</p>
              
              <div style="text-align: center;">
                <a href="${magicLink}" class="magic-link">
                  🔗 Fazer Login
                </a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este link expira em 10 minutos e só pode ser usado uma vez. 
                Se você não solicitou este acesso, ignore este email.
              </div>
              
              <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                ${magicLink}
              </p>
            </div>
            
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo FalaChefe.</p>
              <p>Se você não solicitou este acesso, pode ignorar este email com segurança.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(
    email: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const subject = "🎉 Bem-vindo ao FalaChefe!";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo - FalaChefe</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 FalaChefe</div>
              <h1 class="title">Bem-vindo, ${userName}!</h1>
            </div>
            
            <div class="content">
              <p>Parabéns! Sua conta foi criada com sucesso no FalaChefe.</p>
              
              <p>Agora você pode:</p>
              <ul>
                <li>🤖 Conversar com nossos agentes especializados</li>
                <li>💰 Gerenciar seu fluxo de caixa</li>
                <li>📊 Acompanhar suas finanças</li>
                <li>💬 Integrar com WhatsApp</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" class="cta-button">
                  🚀 Começar a usar
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>Obrigado por escolher o FalaChefe!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

export const emailService = EmailService.getInstance();
