export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  devMode: import.meta.env.VITE_DEV_MODE === 'true',
  maxFileSizeMB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5,
  allowedFileTypes: ['.pdf', '.txt', '.docx'],
};
