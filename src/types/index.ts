export interface ArchiveFile {
    name: string;
    size: number;
    type: string;
}

export interface ProcessingError extends Error {
    code: string;
    details?: unknown;
}

export interface ProcessingProgress {
    current: number;
    total: number;
    percentage: number;
}
