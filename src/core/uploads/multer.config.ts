import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { Request } from 'express';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = join(process.cwd(), 'public', 'assets', 'avatars');

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },

    filename: (req: Request & { user?: { id?: string } }, file, callback) => {
      const userId = req.user?.id || 'anonymous';
      const fileExt = extname(file.originalname);
      const timestamp = Date.now();
      const fileName = `avatar_${userId}_${timestamp}${fileExt}`;
      callback(null, fileName);
    },
  }),

  fileFilter: (req: any, file: any, callback: any) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowed.includes(ext)) {
      return callback(
        new Error('Only image files are allowed (.jpg, .jpeg, .png)'),
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
};
