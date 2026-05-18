import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface ReportData {
  station: any;
  timestamp: string;
  caseId: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || '';

    console.log('📧 Email Service Config:', {
      host: config.host,
      port: config.port,
      user: config.auth.user ? '***' : 'EMPTY',
      pass: config.auth.pass ? '***' : 'EMPTY',
      from: this.fromEmail,
    });

    this.transporter = nodemailer.createTransport(config);
  }

  async sendCriticalAlert(reportData: ReportData, pdfBuffer: Buffer, recipientEmail: string): Promise<boolean> {
    try {
      const { station, timestamp, caseId } = reportData;

      if (!recipientEmail) {
        console.error('❌ No recipient email provided');
        return false;
      }

      const mailOptions = {
        from: `ECO-SENTINEL Alert System <${this.fromEmail}>`,
        to: recipientEmail,
        subject: `🚨 CRITICAL POLLUTION ALERT - ${station.name} - Case ${caseId}`,
        html: this.generateEmailHTML(reportData),
        attachments: [
          {
            filename: `ECO-SENTINEL-REPORT-${caseId}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', recipientEmail, 'Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  private generateEmailHTML(reportData: ReportData): string {
    const { station, timestamp, caseId } = reportData;

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Courier New', monospace; background-color: #05080a; color: #ffffff; padding: 20px; margin: 0; }
    .container { max-width: 700px; margin: 0 auto; background-color: #0b0e11; border: 1px solid rgba(239, 68, 68, 0.3); padding: 30px; }
    .header { border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 25px; }
    .title { font-size: 20px; font-weight: bold; color: #ef4444; letter-spacing: 2px; margin: 0; }
    .subtitle { font-size: 11px; color: rgba(255, 255, 255, 0.5); margin-top: 5px; letter-spacing: 1px; }
    .alert-badge { display: inline-block; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #ef4444; padding: 8px 16px; font-size: 12px; letter-spacing: 2px; margin: 20px 0; font-weight: bold; }
    .section { margin: 25px 0; padding: 20px; background-color: rgba(255, 255, 255, 0.02); border-left: 3px solid #ef4444; }
    .section-title { font-size: 11px; color: rgba(255, 255, 255, 0.4); letter-spacing: 2px; margin-bottom: 12px; }
    .metric { display: flex; justify-content: space-between; margin: 10px 0; font-size: 13px; }
    .metric-label { color: rgba(255, 255, 255, 0.6); }
    .metric-value { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">🚨 ECO-SENTINEL CRITICAL ALERT</h1>
      <div class="subtitle">AUTOMATED ENVIRONMENTAL ENFORCEMENT SYSTEM</div>
    </div>
    <div class="alert-badge">CRITICAL POLLUTION EVENT DETECTED</div>
    <div class="section">
      <div class="section-title">INCIDENT IDENTIFICATION</div>
      <div class="metric"><span class="metric-label">Case ID:</span><span class="metric-value">${caseId}</span></div>
      <div class="metric"><span class="metric-label">Timestamp:</span><span class="metric-value">${new Date(timestamp).toLocaleString()}</span></div>
    </div>
  </div>
</body>
</html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
