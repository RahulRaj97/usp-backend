import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/authMiddleware';
import {
  listCompaniesAdmin,
  getCompanyAdmin,
  createCompanyAdmin,
  updateCompanyAdmin,
  deleteCompanyAdmin,
} from '../../controllers/admin/companyController';
import { requireAdmin } from '../../middlewares/requireAdmins';

const router = Router();
const upload = multer();

// All endpoints: JWT auth + admin check
router.use(authenticate, requireAdmin);

router
  .route('/')
  .get(listCompaniesAdmin)
  .post(upload.single('logo'), createCompanyAdmin);

router
  .route('/:id')
  .get(getCompanyAdmin)
  .put(
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'documents', maxCount: 5 },
    ]),
    updateCompanyAdmin,
  )
  .delete(deleteCompanyAdmin);

export default router;
