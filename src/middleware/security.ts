import { Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const securityMiddleware = Router();

securityMiddleware.use(cors());
securityMiddleware.use(helmet());

export { securityMiddleware };
