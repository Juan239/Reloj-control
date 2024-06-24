import express from 'express';
import { Router } from 'express';
import upload from '../middlewares/upload.middleware.js';
import {filterData, uploadFile} from '../controllers/file.controller.js';

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);
router.post('/filter', filterData);

export default router;
