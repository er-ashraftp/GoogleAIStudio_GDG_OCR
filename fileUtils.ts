
import type { Part } from '@google/genai';

// Add a declaration for the pdfjsLib global variable
declare const pdfjsLib: any;

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const pdfToImageParts = async (file: File): Promise<Part[]> => {
    const fileReader = new FileReader();

    const pdfData = await new Promise<ArrayBuffer>((resolve, reject) => {
        fileReader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });

    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(pdfData) }).promise;
    const imageParts: Part[] = [];
    const canvas = document.createElement("canvas");

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get canvas context');
        }

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg");
        const base64Data = dataUrl.split(',')[1];
        imageParts.push({
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        });
    }
    
    canvas.remove();
    return imageParts;
};


export const convertFileToGeminiParts = async (file: File): Promise<Part[]> => {
  if (file.type === 'application/pdf') {
    return pdfToImageParts(file);
  } else if (file.type.startsWith('image/')) {
    const part = await fileToGenerativePart(file);
    return [part];
  } else {
    throw new Error('Unsupported file type. Please upload an image or PDF.');
  }
};
