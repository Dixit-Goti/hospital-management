import express from 'express';
import { loginDoctor } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @desc  To login the doctor
 */

router.post('/login', loginDoctor);

export default router;