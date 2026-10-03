import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err);
  const statusCode = err?.statusCode || 500;
  let message = 'An unexpected error occurred. Please try again later.';
  if (typeof err === 'string') {
    message = err;
  } else if (err && typeof err.message === 'string') {
    message = err.message;
  } else if (err && typeof err.error === 'string') {
    message = err.error;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err?.code || 'INTERNAL_ERROR',
  });
};
