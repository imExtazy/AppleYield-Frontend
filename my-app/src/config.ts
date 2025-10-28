export const MINIO_STATIC_BASE = (
  (import.meta as any).env?.VITE_MINIO_STATIC_BASE as string
) || 'http://localhost:9000/apple-static';


