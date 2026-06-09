import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const html2canvasOptions = {
  scale: 2,
  useCORS: true,
  backgroundColor: '#ffffff',
  logging: false,
  onclone: (doc: Document, clone: HTMLElement) => {
    doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => node.remove());
    const wrapper = doc.createElement('div');
    wrapper.style.cssText =
      'position:fixed;left:0;top:0;background:#ffffff;color:#1a1a2e;font-family:"Noto Sans JP",sans-serif;';
    doc.body.innerHTML = '';
    doc.body.appendChild(wrapper);
    wrapper.appendChild(clone);
  }
} as const;

async function captureElement(element: HTMLElement) {
  return html2canvas(element, html2canvasOptions);
}

export async function downloadElementsPdf(
  elements: HTMLElement[],
  filename: string
): Promise<void> {
  if (elements.length === 0) return;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  for (let i = 0; i < elements.length; i++) {
    const canvas = await captureElement(elements[i]);
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, imgHeight);
  }

  pdf.save(filename);
}

export async function downloadPdf(element: HTMLElement, filename: string): Promise<void> {
  await downloadElementsPdf([element], filename);
}