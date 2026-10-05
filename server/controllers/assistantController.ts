import { Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/geminiService.js';

export const chatAssistantController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const reply = await geminiService.chatAssistant({
      message,
      history,
      context,
    });
    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
