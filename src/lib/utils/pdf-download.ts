import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function collectFontFaceCss(): string {
	const rules: string[] = [];
	for (const sheet of document.styleSheets) {
		try {
			for (const rule of sheet.cssRules) {
				if (rule instanceof CSSFontFaceRule) {
					rules.push(rule.cssText);
				}
			}
		} catch {
			// cross-origin stylesheet
		}
	}
	return rules.join('\n');
}

function prepareCloneForCapture(doc: Document, clone: HTMLElement): void {
	const fontStyle = doc.createElement('style');
	fontStyle.setAttribute('data-pdf-fonts', '');
	fontStyle.textContent = collectFontFaceCss();
	doc.head.appendChild(fontStyle);

	const layoutStyle = doc.createElement('style');
	layoutStyle.setAttribute('data-pdf-layout', '');
	// Tailwind preflight 除去後もプレビューと同じ寸法で描画する
	layoutStyle.textContent = `
		*, *::before, *::after { box-sizing: border-box; }
		img { display: inline-block; }
	`;
	doc.head.appendChild(layoutStyle);

	doc.documentElement.classList.remove('dark');
	doc.body.style.cssText = 'margin:0;padding:0;background:#ffffff;';

	doc.querySelectorAll('style:not([data-pdf-fonts]):not([data-pdf-layout]), link[rel="stylesheet"]').forEach(
		(node) => {
			node.remove();
		}
	);

	clone.querySelectorAll('img').forEach((img) => {
		img.style.display = 'inline-block';
	});

	const wrapper = doc.createElement('div');
	wrapper.style.cssText =
		'position:absolute;left:0;top:0;margin:0;padding:0;background:#ffffff;';
	doc.body.innerHTML = '';
	doc.body.appendChild(wrapper);
	wrapper.appendChild(clone);
}

function readCaptureSize(element: HTMLElement): { width: number; height: number } {
	const width = Number(element.dataset.pdfWidth) || element.offsetWidth;
	const height = Number(element.dataset.pdfHeight) || element.offsetHeight;
	return { width, height };
}

/** プレビュー枠と同じ範囲だけキャプチャする（画面表示は min-height のまま） */
function applyCaptureViewport(element: HTMLElement, width: number, height: number): () => void {
	const prev = {
		width: element.style.width,
		height: element.style.height,
		minHeight: element.style.minHeight,
		maxHeight: element.style.maxHeight,
		overflow: element.style.overflow
	};
	element.style.width = `${width}px`;
	element.style.height = `${height}px`;
	element.style.minHeight = `${height}px`;
	element.style.maxHeight = `${height}px`;
	element.style.overflow = 'hidden';
	return () => {
		element.style.width = prev.width;
		element.style.height = prev.height;
		element.style.minHeight = prev.minHeight;
		element.style.maxHeight = prev.maxHeight;
		element.style.overflow = prev.overflow;
	};
}

/**
 * scale(transform) や overflow:hidden の親の外へ一時移動してキャプチャする。
 */
function mountOffscreenForCapture(element: HTMLElement): () => void {
	const parent = element.parentElement;
	if (!parent) {
		throw new Error('PDF生成対象の親要素が見つかりません');
	}

	const host = document.createElement('div');
	host.setAttribute('aria-hidden', 'true');
	host.style.cssText = 'position:fixed;left:-10000px;top:0;overflow:visible;z-index:-1;';

	const nextSibling = element.nextSibling;
	host.appendChild(element);
	document.body.appendChild(host);

	return () => {
		if (nextSibling) {
			parent.insertBefore(element, nextSibling);
		} else {
			parent.appendChild(element);
		}
		host.remove();
	};
}

async function waitForCaptureAssets(element: HTMLElement): Promise<void> {
	const images = Array.from(element.querySelectorAll('img'));
	await Promise.all([
		document.fonts.ready,
		...images.map(
			(img) =>
				new Promise<void>((resolve) => {
					if (img.complete) {
						resolve();
						return;
					}
					img.addEventListener('load', () => resolve(), { once: true });
					img.addEventListener('error', () => resolve(), { once: true });
				})
		)
	]);
}

async function captureElement(element: HTMLElement) {
	await waitForCaptureAssets(element);

	const { width, height } = readCaptureSize(element);
	const restoreMount = mountOffscreenForCapture(element);
	const restoreViewport =
		element.dataset.pdfWidth && element.dataset.pdfHeight
			? applyCaptureViewport(element, width, height)
			: () => {};

	try {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		await waitForCaptureAssets(element);

		return await html2canvas(element, {
			scale: 2,
			useCORS: true,
			backgroundColor: '#ffffff',
			logging: false,
			scrollX: 0,
			scrollY: 0,
			windowWidth: width,
			windowHeight: height,
			onclone: (doc, clone) => {
				prepareCloneForCapture(doc, clone);
			}
		});
	} finally {
		restoreViewport();
		restoreMount();
	}
}

/** プレビューと同じ A4 比率で全面に配置（右余白を作らない） */
function addCanvasToA4Page(pdf: jsPDF, canvas: HTMLCanvasElement): void {
	const pageWidth = pdf.internal.pageSize.getWidth();
	const pageHeight = pdf.internal.pageSize.getHeight();

	pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);
}

async function buildPdfFromElements(elements: HTMLElement[]): Promise<jsPDF> {
	if (elements.length === 0) {
		throw new Error('PDF生成対象の要素がありません');
	}

	const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

	for (let i = 0; i < elements.length; i++) {
		const canvas = await captureElement(elements[i]);
		if (i > 0) pdf.addPage();
		addCanvasToA4Page(pdf, canvas);
	}

	return pdf;
}

export async function generatePdfBlob(element: HTMLElement): Promise<Blob> {
	const pdf = await buildPdfFromElements([element]);
	return pdf.output('blob');
}

/** メール添付用（Resend 等の API 向け） */
export async function generatePdfBase64(element: HTMLElement): Promise<string> {
	const pdf = await buildPdfFromElements([element]);
	const dataUri = pdf.output('datauristring');
	const commaIndex = dataUri.indexOf(',');
	return commaIndex >= 0 ? dataUri.slice(commaIndex + 1) : dataUri;
}

export async function downloadElementsPdf(
	elements: HTMLElement[],
	filename: string
): Promise<void> {
	const pdf = await buildPdfFromElements(elements);
	pdf.save(filename);
}

export async function downloadPdf(element: HTMLElement, filename: string): Promise<void> {
	await downloadElementsPdf([element], filename);
}
