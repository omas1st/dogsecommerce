import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CloudinaryService } from '../services/cloudinaryService';

export const uploadMedia = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { image, folder = 'hound_and_harbor' } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image data or URL is required.' });
    }

    const uploadResult = await CloudinaryService.uploadImage(image, folder);
    return res.status(200).json({
      success: true,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Media upload failed' });
  }
};
