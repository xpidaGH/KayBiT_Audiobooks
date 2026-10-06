/**
 * PDF and Document Text Extraction Service
 * Supports client-side PDF file parsing (with pdfjs-dist and pure binary fallback),
 * plain text file reading, and pasted document parsing into chapters/pages.
 */

export interface ParsedDocument {
  title: string;
  author: string;
  pages: string[];
  totalWords: number;
  estimatedDurationMinutes: number;
}

export class PDFService {
  /**
   * Parse uploaded File (.pdf or .txt)
   */
  public async parseFile(file: File): Promise<ParsedDocument> {
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return this.parsePdfFile(file, fileName);
    } else {
      // Plain text or markdown
      const text = await file.text();
      return this.parseRawText(text, fileName);
    }
  }

  /**
   * Parse PDF using pdfjs-dist with fallback
   */
  private async parsePdfFile(file: File, fallbackTitle: string): Promise<ParsedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamically load pdfjs-dist if available
      const pdfjs = await import('pdfjs-dist');
      
      // Set worker source to unpkg cdn
      if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '5.4.299'}/build/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      const pagesText: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageString = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageString.length > 0) {
          pagesText.push(pageString);
        }
      }

      if (pagesText.length > 0) {
        const allText = pagesText.join(' ');
        const totalWords = allText.split(/\s+/).filter(Boolean).length;
        return {
          title: fallbackTitle.replace(/[_-]/g, ' '),
          author: 'Uploaded Document',
          pages: pagesText,
          totalWords,
          estimatedDurationMinutes: Math.max(1, Math.round(totalWords / 140)) // ~140 wpm reading speed
        };
      }
    } catch (err) {
      console.warn('pdfjs-dist extraction failed, falling back to binary stream extractor:', err);
    }

    // Binary stream fallback: extract plain strings from PDF stream
    return this.fallbackPdfStreamExtractor(file, fallbackTitle);
  }

  /**
   * Robust stream parser extracting text objects directly from PDF binary
   */
  private async fallbackPdfStreamExtractor(file: File, fallbackTitle: string): Promise<ParsedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new TextDecoder('latin1');
    const rawString = decoder.decode(arrayBuffer);

    // Extract text in PDF parentheses (Text) Tj or TJ blocks
    const matches: string[] = [];
    const textRegex = /\(([^)]+)\)\s*(?:Tj|TJ)/g;
    let match: RegExpExecArray | null;

    while ((match = textRegex.exec(rawString)) !== null) {
      const clean = match[1]
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\[nrtbf]/g, ' ')
        .trim();
      if (clean.length > 1) {
        matches.push(clean);
      }
    }

    let combined = matches.join(' ').replace(/\s+/g, ' ').trim();
    if (combined.length < 50) {
      combined = `Document: ${fallbackTitle}\nThis PDF content has been loaded into the KayBiT Audiobooks player. Click Play to listen to the audio stream or use the text box to paste full chapter text.`;
    }

    return this.parseRawText(combined, fallbackTitle);
  }

  /**
   * Split pasted or extracted text into reasonable reading pages (approx 200-300 words each)
   */
  public parseRawText(rawText: string, customTitle = 'Untitled Audiobook'): ParsedDocument {
    const cleaned = rawText.replace(/\r\n/g, '\n').trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Split into chapters / sections by double newlines or page length (~250 words per page)
    const pages: string[] = [];
    const WORDS_PER_PAGE = 220;

    for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
      const chunk = words.slice(i, i + WORDS_PER_PAGE).join(' ');
      if (chunk.trim()) {
        pages.push(chunk);
      }
    }

    if (pages.length === 0) {
      pages.push(cleaned || 'Empty document.');
    }

    return {
      title: customTitle,
      author: 'Pasted / Uploaded Audio',
      pages,
      totalWords: Math.max(1, totalWords),
      estimatedDurationMinutes: Math.max(1, Math.round(totalWords / 140))
    };
  }
}

export const pdfService = new PDFService();
