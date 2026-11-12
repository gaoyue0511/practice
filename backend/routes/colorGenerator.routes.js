import express from 'express';
import ColorGeneratorController from '../controllers/colorGenerator.controller.js';

const router = express.Router();

router.post('/generate', ColorGeneratorController.generateColors);

router.post('/save', ColorGeneratorController.saveAIGeneratedScheme);

router.get('/styles', ColorGeneratorController.getStyles);

export default router;
