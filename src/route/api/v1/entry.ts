import { Router } from 'express';
import { diceController } from '../../../controller/http/api/dice';
import { asyncErrorHandler } from '../../../middleware/async-error-handler';
import { validator } from '../../../util/schema-validator';
import { playRequestSchema } from '../../../schema/play';

const router = Router();

router
  .route('/')
  .post(
    validator.validate(playRequestSchema),
    asyncErrorHandler(diceController.entry),
  );

export const entryRouter = router;
