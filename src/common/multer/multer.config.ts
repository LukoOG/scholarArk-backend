import { memoryStorage } from 'multer';

export const multerConfig = {
  storage: memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
  },
};
