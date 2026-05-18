import { NextResponse } from 'next/server';
import { emailService } from '@/lib/backend/services/emailService';
import { AlertRequest } from '@/lib/backend/types/pollution';
import { generatePDFBuffer } from '@/lib/backend/utils/pdfGenerator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { station, timestamp, recipientEmail }: AlertRequest & { recipientEmail: string } = body;

    if (!station || !timestamp) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: station and timestamp',
      }, { status: 400 });
    }

    if (!recipientEmail) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: recipientEmail',
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

    let emailSent = false;
    let emailError = null;

    try {
      // Generate PDF report
      const pdfBuffer = await generatePDFBuffer({
        station,
        timestamp,
        caseId,
      });

      // Send email with PDF attachment
      emailSent = await emailService.sendCriticalAlert(
        { station, timestamp, caseId },
        pdfBuffer,
        recipientEmail
      );
    } catch (emailErr) {
      emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error';
      console.error('Email sending error:', emailErr);
      // Don't fail the entire request if email fails
      emailSent = false;
    }

    // Return success even if email fails, but include email status
    return NextResponse.json({
      success: true,
      message: 'Alert processed successfully',
      caseId,
      recipient: recipientEmail,
      emailSent: emailSent,
      emailError: emailError,
    }, { status: 200 });
  } catch (error) {
    console.error('Error sending critical alert:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
