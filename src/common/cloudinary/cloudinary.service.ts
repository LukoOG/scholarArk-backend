import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import { Types } from 'mongoose';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) { }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'users',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadVideo(file: Express.Multer.File, lessonId: Types.ObjectId, callback: (result) => void) {
    const result = await new Promise((resolve, reject) => {
      this.cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'demo-videos',
          eager: [
            { streaming_profile: 'sd', format: 'm3u8' }
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    return {
      id: result['public_id'],
      playbackUrl: result['secure_url'],
      hlsUrl: result['eager'][0]['secure_url'],
    };
  }
}
