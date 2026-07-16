"use client";

import { useCallback, useState } from "react";

export async function downloadMonthlyReportPdf(container: HTMLElement, title: string) {
  // html2canvas-pro supports oklab/oklch (Tailwind v4); stock html2canvas does not.
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * contentWidth) / canvas.width;

  let offsetY = margin;
  let heightLeft = imageHeight;

  pdf.setFontSize(14);
  pdf.text(title, margin, 24);

  pdf.addImage(imageData, "PNG", margin, offsetY, contentWidth, imageHeight);
  heightLeft -= pageHeight - offsetY;

  while (heightLeft > 0) {
    pdf.addPage();
    const position = margin - (imageHeight - heightLeft);
    pdf.addImage(imageData, "PNG", margin, position, contentWidth, imageHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}-report.pdf`;
  pdf.save(fileName);
}

export function useMonthlyReportPdf(title: string) {
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = useCallback(
    async (container: HTMLElement | null) => {
      if (!container || downloading) {
        return;
      }

      setDownloading(true);
      try {
        await downloadMonthlyReportPdf(container, title);
      } finally {
        setDownloading(false);
      }
    },
    [downloading, title],
  );

  return { downloadPdf, downloading };
}
