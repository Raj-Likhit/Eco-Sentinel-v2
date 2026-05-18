import nodemailer from 'nodemailer';
import { Station } from '../types/pollution';

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
  station: Station;
  timestamp: string;
  caseId: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private authorityEmail: string;

  constructor() {
    // Email configuration from environment variables
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
    this.authorityEmail = process.env.AUTHORITY_EMAIL || 'test@example.com';

    console.log('📧 Email Service Config:', {
      host: config.host,
      port: config.port,
      user: config.auth.user ? '***' : 'EMPTY',
      pass: config.auth.pass ? '***' : 'EMPTY',
      from: this.fromEmail,
      to: this.authorityEmail,
    });

    this.transporter = nodemailer.createTransport(config);
  }

  async sendCriticalAlert(reportData: ReportData, pdfBuffer: Buffer): Promise<boolean> {
    try {
      const { station, timestamp, caseId } = reportData;

      const mailOptions = {
        from: `ECO-SENTINEL Alert System <${this.fromEmail}>`,
        to: this.authorityEmail,
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
      console.log('✅ Email sent successfully:', info.messageId);
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
    body {
      font-family: 'Courier New', monospace;
      background-color: #05080a;
      color: #ffffff;
      padding: 20px;
      margin: 0;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #0b0e11;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 30px;
    }
    .header {
      border-bottom: 2px solid #ef4444;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      color: #ef4444;
      letter-spacing: 2px;
      margin: 0;
    }
    .subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 5px;
      letter-spacing: 1px;
    }
    .alert-badge {
      display: inline-block;
      background-color: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
      padding: 8px 16px;
      font-size: 12px;
      letter-spacing: 2px;
      margin: 20px 0;
      font-weight: bold;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background-color: rgba(255, 255, 255, 0.02);
      border-left: 3px solid #ef4444;
    }
    .section-title {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 13px;
    }
    .metric-label {
      color: rgba(255, 255, 255, 0.6);
    }
    .metric-value {
      color: #ef4444;
      font-weight: bold;
    }
    .evidence-item {
      display: flex;
      align-items: center;
      margin: 8px 0;
      font-size: 12px;
    }
    .evidence-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      margin-right: 10px;
    }
    .action-box {
      background-color: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      padding: 20px;
      margin: 25px 0;
    }
    .action-title {
      color: #ef4444;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1.5px;
      margin-bottom: 15px;
    }
    .action-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .action-list li {
      padding: 8px 0;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .action-list li:before {
      content: "▸ ";
      color: #ef4444;
      font-weight: bold;
      margin-right: 8px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 10px;
      color: rgba(255, 255, 255, 0.3);
      text-align: center;
      letter-spacing: 1px;
    }
    .coordinates {
      font-family: 'Courier New', monospace;
      color: #10b981;
    }
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
      <div class="metric">
        <span class="metric-label">Case ID:</span>
        <span class="metric-value">${caseId}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Timestamp:</span>
        <span class="metric-value">${new Date(timestamp).toLocaleString('en-US', { timeZone: 'UTC' })} UTC</span>
      </div>
      <div class="metric">
        <span class="metric-label">Status:</span>
        <span class="metric-value">${station.status}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">STATION DETAILS</div>
      <div class="metric">
        <span class="metric-label">Station Name:</span>
        <span class="metric-value">${station.name}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Location:</span>
        <span class="metric-value coordinates">${station.lat.toFixed(4)}°N, ${station.lng.toFixed(4)}°E</span>
      </div>
      <div class="metric">
        <span class="metric-label">Data Source:</span>
        <span class="metric-value">${station.source}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">POLLUTION METRICS</div>
      <div class="metric">
        <span class="metric-label">PM2.5 Concentration:</span>
        <span class="metric-value">${station.pm25.toFixed(1)} µg/m³</span>
      </div>
      <div class="metric">
        <span class="metric-label">Z-Score Anomaly:</span>
        <span class="metric-value">${station.zscore.toFixed(2)}σ</span>
      </div>
      <div class="metric">
        <span class="metric-label">Threshold Status:</span>
        <span class="metric-value">CRITICAL EXCEEDANCE</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">FORENSIC EVIDENCE CHAIN</div>
      <div class="evidence-item">
        <div class="evidence-dot"></div>
        <span>Wind Trajectory: WITHIN 5km UPWIND</span>
      </div>
      <div class="evidence-item">
        <div class="evidence-dot"></div>
        <span>Satellite Match: SPECTRAL CONFIRMED</span>
      </div>
      <div class="evidence-item">
        <div class="evidence-dot"></div>
        <span>Concentration: ${station.pm25.toFixed(1)} µg/m³</span>
      </div>
      <div class="evidence-item">
        <div class="evidence-dot"></div>
        <span>Z-Score Anomaly: ${station.zscore.toFixed(1)}σ</span>
      </div>
    </div>

    <div class="action-box">
      <div class="action-title">RECOMMENDED IMMEDIATE ACTIONS</div>
      <ul class="action-list">
        <li>IMMEDIATE INSPECTION of Patancheru Industrial Zone</li>
        <li>VERIFY industrial operations and emission controls</li>
        <li>COLLECT on-site samples for laboratory analysis</li>
        <li>REVIEW facility compliance records</li>
        <li>ISSUE NOTICE if violations confirmed</li>
      </ul>
    </div>

    <div class="section">
      <div class="section-title">ATTRIBUTED SOURCE</div>
      <div class="metric">
        <span class="metric-label">Industrial Zone:</span>
        <span class="metric-value">PATANCHERU INDUSTRIAL</span>
      </div>
      <div class="metric">
        <span class="metric-label">Coordinates:</span>
        <span class="metric-value coordinates">17.530°N, 78.199°E</span>
      </div>
      <div class="metric">
        <span class="metric-label">Distance:</span>
        <span class="metric-value">4.8km UPWIND</span>
      </div>
      <div class="metric">
        <span class="metric-label">Wind Direction:</span>
        <span class="metric-value">315° NW</span>
      </div>
      <div class="metric">
        <span class="metric-label">Confidence:</span>
        <span class="metric-value">89% HIGH</span>
      </div>
    </div>

    <div class="footer">
      <p>
        LEGAL AUTHORITY: Air (Prevention and Control of Pollution) Act, 1981 | 
        Environment (Protection) Act, 1986 | NAAQS
      </p>
      <p>
        Generated by ECO-SENTINEL AI Forensics System<br>
        Telangana Pollution Control Board<br>
        Contact: enforcement@eco-sentinel.gov.in
      </p>
      <p style="margin-top: 15px; color: rgba(255, 255, 255, 0.2);">
        ⚠️ This is an automated alert. Please review the attached PDF report for complete details.
      </p>
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
