'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { processArchive } from '@/lib/archive-processor';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function PDFCombinePage() {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/zip': ['.zip'],
            'application/x-rar-compressed': ['.rar'],
        },
        maxFiles: 1,
        maxSize: 1024 * 1024 * 100, // 100MB
        onDropRejected: (fileRejections) => {
            setError(
                fileRejections[0]?.errors[0]?.message || 'Arquivo não suportado'
            );
        },
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            setIsProcessing(true);
            setError(null);
            setDownloadUrl(null);

            try {
                const result = await processArchive(
                    acceptedFiles[0],
                    (progress) => {
                        setProgress(progress);
                    }
                );

                // Criar URL para download
                const blob = new Blob([result], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);

                // Download automático
                const link = document.createElement('a');
                link.href = url;
                link.download = 'documentos-combinados.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Erro ao processar arquivo'
                );
            } finally {
                setIsProcessing(false);
            }
        },
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-8 h-8 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2L2 19h20L12 2zm0 3.8L18.5 17H5.5L12 5.8z" />
                            </svg>
                            <span className="text-xl font-semibold text-gray-900">
                                PDF Combine
                            </span>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            Combine seus PDFs
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Junte múltiplos PDFs em um único arquivo de forma
                            rápida e segura
                        </p>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`
                            mt-12 p-12 rounded-xl border-2 border-dashed 
                            transition-colors duration-200 ease-in-out
                            cursor-pointer text-center
                            ${
                                isDragActive
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-blue-200 hover:border-blue-300'
                            }
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="space-y-4">
                            <div className="text-blue-600">
                                <svg
                                    className="mx-auto h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-lg text-gray-900">
                                    Arraste um arquivo ZIP ou RAR contendo seus
                                    PDFs
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    ou clique para selecionar
                                </p>
                            </div>
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="mt-8 space-y-4">
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-gray-600 text-center">
                                Processando: {progress}%
                            </p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mt-8">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {downloadUrl && !isProcessing && (
                        <Alert className="mt-8 bg-blue-50 border-blue-100">
                            <AlertDescription className="flex items-center justify-between text-gray-900">
                                <span>PDF combinado com sucesso!</span>
                                <a
                                    href={downloadUrl}
                                    download="documentos-combinados.pdf"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Baixar PDF
                                </a>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </main>
        </div>
    );
}
