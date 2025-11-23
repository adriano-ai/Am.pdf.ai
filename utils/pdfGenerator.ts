import { jsPDF } from "jspdf";

export const generatePDF = (text: string, filename: string = 'documento.pdf') => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxLineWidth = pageWidth - (margin * 2);
  const lineHeight = 7;

  // Split text into lines that fit the page width
  const splitText = doc.splitTextToSize(text, maxLineWidth);

  let cursorY = margin;

  // Header (Optional Branding)
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Gerado por Am.pdf.ai", margin, 10);
  
  // Reset for body
  doc.setFontSize(12);
  doc.setTextColor(0);

  // Loop through lines and add pages if necessary
  splitText.forEach((line: string) => {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
      
      // Header on new pages too
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("Gerado por Am.pdf.ai", margin, 10);
      doc.setFontSize(12);
      doc.setTextColor(0);
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  doc.save(filename);
};