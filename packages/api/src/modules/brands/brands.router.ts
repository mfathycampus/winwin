import { Router } from 'express';
import { authenticate, requireRole } from '../../common/guards/auth.guard';
import * as brandsService from './brands.service';

const router = Router();
router.use(authenticate);

// Brands the current account can see (admin → all, brand manager → theirs)
router.get('/', async (req, res) => {
  const brands = await brandsService.getBrandsForUser(req.user!.sub, req.user!.role);
  res.json({ success: true, data: brands });
});

// Admin creates a brand (and optionally assigns an owner by phone)
router.post('/', requireRole('admin'), async (req, res) => {
  const brand = await brandsService.createBrandByAdmin(req.body);
  res.status(201).json({ success: true, data: brand });
});

router.get('/company/:companyId', async (req, res) => {
  const brands = await brandsService.getBrandsByCompany(req.params.companyId);
  res.json({ success: true, data: brands });
});

router.post('/company/:companyId', async (req, res) => {
  const brand = await brandsService.createBrand(req.params.companyId, req.body);
  res.status(201).json({ success: true, data: brand });
});

router.get('/:brandId/dashboard', async (req, res) => {
  const data = await brandsService.getBrandDashboard(req.params.brandId);
  res.json({ success: true, data });
});

router.get('/:brandId/posts', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const filters = {
    platform: req.query.platform as string,
    status: req.query.status as string,
    from: req.query.from as string,
    to: req.query.to as string,
  };
  const data = await brandsService.getBrandPosts(req.params.brandId, page, limit, filters);
  res.json({ success: true, data });
});

export { router as brandsRouter };
