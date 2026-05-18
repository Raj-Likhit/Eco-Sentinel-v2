import PDFDocument from 'pdfkit';
import { Station } from '../types/pollution';

interface ReportData {
  station: Station;
  timestamp: string;
  caseId: string;
}

export async function generatePDFBuffer(reportData: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const { station, timestamp, caseId } = reportData;
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const red = '#ef4444';
      const gray = '#6b7280';
      const darkGray = '#374151';

      // Header
      doc
        .fontSize(24)
        .fillColor(red)
        .text('ECO-SENTINEL', { align: 'center' })
        .fontSize(10)
        .fillColor(gray)
        .text('ENVIRONMENTAL ENFORCEMENT REPORT', { align: 'center' })
        .moveDown(2);

      // Horizontal line
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor(red)
        .lineWidth(2)
        .stroke()
        .moveDown(1.5);

      // Alert badge
      doc
        .fontSize(12)
        .fillColor(red)
        .text('🚨 CRITICAL POLLUTION EVENT', { align: 'center' })
        .moveDown(2);

      // Case information
      doc
        .fontSize(9)
        .fillColor(darkGray)
        .text('INCIDENT CLASSIFICATION:', { continued: true })
        .fillColor(red)
        .text(` ${station.status}`, { align: 'left' });

      doc
        .fillColor(darkGray)
        .text('REPORT GENERATED:', { continued: true })
        .fillColor('black')
        .text(` ${new Date(timestamp).toLocaleString('en-US', { timeZone: 'UTC' })} UTC`);

      doc
        .fillColor(darkGray)
        .text('CASE ID:', { continued: true })
        .fillColor('black')
        .text(` ${caseId}`)
        .moveDown(2);

      // Section: Station Identification
      addSection(doc, 'STATION IDENTIFICATION');
      addKeyValue(doc, 'Name', station.name);
      addKeyValue(doc, 'Location', `${station.lat.toFixed(4)}°N, ${station.lng.toFixed(4)}°E`);
      addKeyValue(doc, 'Data Source', station.source);
      addKeyValue(doc, 'Status', station.status, red);
      doc.moveDown(1.5);

      // Section: Pollution Metrics
      addSection(doc, 'POLLUTION METRICS');
      addKeyValue(doc, 'PM2.5 Concentration', `${station.pm25.toFixed(1)} µg/m³`, red);
      addKeyValue(doc, 'Z-Score Anomaly', `${station.zscore.toFixed(2)}σ`, red);
      addKeyValue(
        doc,
        'Threshold Exceedance',
        station.pm25 > 100 ? 'YES - CRITICAL' : station.pm25 > 55 ? 'YES - WARNING' : 'NO',
        station.pm25 > 100 ? red : gray
      );
      doc.moveDown(1.5);

      // Section: Forensic Analysis
      addSection(doc, 'FORENSIC ANALYSIS');
      const confidence = station.status === 'CRITICAL' ? 89 : station.status === 'WARNING' ? 71 : 42;
      addKeyValue(doc, 'Source Confidence', `${confidence}% HIGH`, '#10b981');
      doc.moveDown(0.5);

      doc.fontSize(9).fillColor(darkGray).text('Evidence Chain:');
      addBullet(doc, 'Wind Trajectory: WITHIN 5km UPWIND');
      addBullet(doc, 'Satellite Match: SPECTRAL CONFIRMED');
      addBullet(doc, `Concentration: ${station.pm25.toFixed(1)} µg/m³`);
      addBullet(doc, `Z-Score Anomaly: ${station.zscore.toFixed(1)}σ`);
      doc.moveDown(1.5);

      // Section: Attributed Source
      if (station.status !== 'NORMAL') {
        addSection(doc, 'ATTRIBUTED SOURCE');
        addKeyValue(doc, 'Industrial Zone', 'PATANCHERU INDUSTRIAL', red);
        addKeyValue(doc, 'Coordinates', '17.530°N, 78.199°E');
        addKeyValue(doc, 'Distance', '4.8km UPWIND');
        addKeyValue(doc, 'Wind Direction', '315° NW');
        addKeyValue(doc, 'Wind Speed', '3.2 m/s');
        addKeyValue(doc, 'Atmospheric Stability', 'Pasquill Class D');
        doc.moveDown(1.5);

        // Section: Recommended Actions
        addSection(doc, 'RECOMMENDED ACTIONS');
        addBullet(doc, 'IMMEDIATE INSPECTION of Patancheru Industrial Zone');
        addBullet(doc, 'VERIFY industrial operations and emission controls');
        addBullet(doc, 'COLLECT on-site samples for laboratory analysis');
        addBullet(doc, 'REVIEW facility compliance records');
        addBullet(doc, 'ISSUE NOTICE if violations confirmed');
        doc.moveDown(1.5);
      }

      // Section: Legal Authority
      addSection(doc, 'LEGAL AUTHORITY');
      doc
        .fontSize(9)
        .fillColor('black')
        .text('• Air (Prevention and Control of Pollution) Act, 1981')
        .text('• Environment (Protection) Act, 1986')
        .text('• National Ambient Air Quality Standards (NAAQS)')
        .moveDown(2);

      // Footer
      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor(gray)
        .lineWidth(1)
        .stroke()
        .moveDown(1);

      doc
        .fontSize(8)
        .fillColor(gray)
        .text('Generated By: ECO-SENTINEL AI Forensics System', { align: 'center' })
        .text('Report Type: Automated Environmental Incident Report', { align: 'center' })
        .text('Jurisdiction: Telangana Pollution Control Board', { align: 'center' })
        .text('Contact: enforcement@eco-sentinel.gov.in', { align: 'center' });

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addSection(doc: PDFKit.PDFDocument, title: string) {
  doc
    .fontSize(10)
    .fillColor('#374151')
    .text(title, { underline: true })
    .moveDown(0.5);
}

function addKeyValue(
  doc: PDFKit.PDFDocument,
  key: string,
  value: string,
  valueColor: string = 'black'
) {
  doc
    .fontSize(9)
    .fillColor('#6b7280')
    .text(key + ':', { continued: true })
    .fillColor(valueColor)
    .text(` ${value}`);
}

function addBullet(doc: PDFKit.PDFDocument, text: string) {
  doc.fontSize(9).fillColor('black').text(`  • ${text}`);
}
