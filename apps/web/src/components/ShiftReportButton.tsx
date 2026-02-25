import { useState, type RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type ShiftReportButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  lineId: string;
  shiftDate: string;
  shiftName: string;
};

export function ShiftReportButton({
  targetRef,
  lineId,
  shiftDate,
  shiftName,
}: ShiftReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!targetRef.current) {
      return;
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#f4f5f7',
        scale: 2,
      });

      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = pageWidth - 20;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      pdf.setFontSize(12);
      pdf.text(`Shift Summary Report • ${lineId} • ${shiftName}`, 10, 10);
      pdf.addImage(image, 'PNG', 10, 16, imageWidth, Math.min(imageHeight, pageHeight - 22));
      pdf.save(
        `shift-report-${lineId}-${shiftDate}-${shiftName.replace(' ', '-').toLowerCase()}.pdf`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button className="button" type="button" onClick={handleExport} disabled={isExporting}>
      {isExporting ? 'Generating PDF...' : 'Download Shift PDF'}
    </button>
  );
}
