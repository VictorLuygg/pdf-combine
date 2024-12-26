import { processArchive } from '@/lib/archive-processor';

self.onmessage = async (e: MessageEvent) => {
    try {
        const { file } = e.data;

        const result = await processArchive(file, (progress) => {
            self.postMessage({ type: 'progress', progress });
        });

        self.postMessage({ type: 'complete', result });
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
    }
};

export {};
