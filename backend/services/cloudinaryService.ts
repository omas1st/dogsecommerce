import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with user's environment credentials
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
  });
} else if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  // Default to user's provided credentials
  cloudinary.config({
    cloud_name: 'dn8cf0bdb',
    api_key: '334764147489227',
    api_secret: 'CRofFxnD9zONG0jr59EpA7bybo0',
  });
}

export class CloudinaryService {
  /**
   * Upload an image file or base64 data string to Cloudinary
   */
  public static async uploadImage(
    fileUriOrBase64: string,
    folder: string = 'hound_and_harbor'
  ): Promise<{
    success: boolean;
    url: string;
    secureUrl: string;
    publicId: string;
    format?: string;
  }> {
    try {
      const result = await cloudinary.uploader.upload(fileUriOrBase64, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return {
        success: true,
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
      };
    } catch (error: any) {
      console.error('[Cloudinary] Upload failed:', error.message);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  /**
   * Delete an image by its public ID
   */
  public static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (error: any) {
      console.error('[Cloudinary] Delete failed:', error.message);
      return false;
    }
  }
}

export const cloudinaryClient = cloudinary;
