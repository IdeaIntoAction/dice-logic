import { Router } from 'express';
import { entryRouter } from './api/v1/entry';

const router = Router();

router.use('/api/v1/entry/', entryRouter);

export {
  router,
};
