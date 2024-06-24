import express from 'express';
import { Router } from 'express';
import {generatePdf} from '../controllers/pdf.controller.js';

const router = Router();

router.post('/generate', generatePdf);

export default router;
