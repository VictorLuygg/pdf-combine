import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

interface ProcessingOptions {
    maxFileSize?: number;
    supportedFormats?: string[];
    chunkSize?: number;
}

export async function processArchive(
    file: File,
    onProgress: (progress: number) => void,
    options: ProcessingOptions = {}
): Promise<Uint8Array> {
    // Validações iniciais
    if (options.maxFileSize && file.size > options.maxFileSize) {
        throw new Error('Arquivo muito grande');
    }

    const zip = new JSZip();

    try {
        // Lê o arquivo zip
        const zipContent = await zip.loadAsync(file);

        // Filtra e valida PDFs
        const pdfFiles = Object.values(zipContent.files).filter((zipEntry) =>
            zipEntry.name.toLowerCase().endsWith('.pdf')
        );

        if (pdfFiles.length === 0) {
            throw new Error(
                'Nenhum arquivo PDF encontrado no arquivo compactado'
            );
        }

        // Ordena os arquivos pelo nome
        pdfFiles.sort((a, b) => a.name.localeCompare(b.name));

        // Cria documento PDF final
        const mergedPdf = await PDFDocument.create();

        let processedFiles = 0;
        const totalFiles = pdfFiles.length;

        // Processa cada PDF em chunks
        for (const pdfFile of pdfFiles) {
            try {
                const pdfBytes = await pdfFile.async('uint8array');
                const pdf = await PDFDocument.load(pdfBytes);
                const pages = await mergedPdf.copyPages(
                    pdf,
                    pdf.getPageIndices()
                );
                pages.forEach((page) => mergedPdf.addPage(page));

                processedFiles++;
                onProgress(Math.round((processedFiles / totalFiles) * 100));
            } catch (error) {
                console.error(`Erro ao processar ${pdfFile.name}:`, error);
                // Continua processando outros arquivos
            }
        }

        if (mergedPdf.getPageCount() === 0) {
            throw new Error('Não foi possível processar nenhum PDF válido');
        }

        // Salva o documento final
        return await mergedPdf.save();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Erro ao processar arquivo');
    }
}
