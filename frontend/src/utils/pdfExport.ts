import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a PDF report from a DOM element.
 * @param elementId The ID of the HTML element to capture.
 * @param filename The desired filename of the output PDF.
 */
export const exportElementToPDF = async (elementId: string, filename: string = 'Eco-Sentinel-Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
