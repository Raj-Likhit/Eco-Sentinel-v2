import { NextResponse } from 'next/server';
import { emailService } from '@/lib/backend/services/emailService';
import { AlertRequest } from '@/lib/backend/types/pollution';
import { generatePDFBuffer } from '@/lib/backend/utils/pdfGenerator';

export async function POST(request: Request) {
  try {
    const { station, timestamp }: AlertRequest = await request.json();

    if (!station || !timestamp) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: station and timestamp',
      }, { status: 400 });
    }

    // Validate critical status
    if (station.status !== 'CRITICAL') {
      return NextResponse.json({
        success: false,
        error: 'Alert can only be sent for CRITICAL status stations',
      }, { status: 400 });
    }

    // Generate case ID
    const caseId = `ECO-${Date.now()}`;

    // Generate PDF report
    const pdfBuffer = await generatePDFBuffer({
      station,
      timestamp,
      caseId,
    });

    // Send email with PDF attachment
    const emailSent = await emailService.sendCriticalAlert(
      { station, timestamp, caseId },
      pdfBuffer
    );

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Critical alert sent successfully',
        caseId,
        recipient: process.env.AUTHORITY_EMAIL || 'test@example.com',
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send email',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending critical alert:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
