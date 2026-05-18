import { NextResponse } from 'next/server';
import { emailService } from '@/lib/backend/services/emailService';

export async function GET() {
  try {
    const isConnected = await emailService.testConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Email service is configured correctly',
        config: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || '587',
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.AUTHORITY_EMAIL || 'test@example.com',
        },
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Email service connection failed',
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test email service',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
