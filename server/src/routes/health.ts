import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ShiftSync API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

