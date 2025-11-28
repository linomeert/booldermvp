import { Router } from 'express';
import { getGyms, getCrags } from '../controllers/locationController';

const router = Router();

router.get('/gyms', getGyms);
router.get('/crags', getCrags);

export default router;
