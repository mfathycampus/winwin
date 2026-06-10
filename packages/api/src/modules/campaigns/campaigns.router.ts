import { Router } from 'express';
import { authenticate } from '../../common/guards/auth.guard';
import { createCampaignSchema } from '@winwin/shared';
import * as campaignsService from './campaigns.service';

const router = Router();

// Public: Home feed
router.get('/feed', authenticate, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const filters = {
    platform: req.query.platform as string,
    sector: req.query.sector as string,
  };
  const data = await campaignsService.getHomeFeed(req.user!.sub, page, limit, filters);
  res.json({ success: true, data });
});

router.get('/:campaignId', authenticate, async (req, res) => {
  const data = await campaignsService.getCampaignDetail(req.params.campaignId, req.user!.sub);
  res.json({ success: true, data });
});

// Brand manager: create campaign
router.post('/', authenticate, async (req, res) => {
  const data = createCampaignSchema.parse(req.body);
  const campaign = await campaignsService.createCampaign(req.body.brandId, data);
  res.status(201).json({ success: true, data: campaign });
});

router.patch('/:campaignId/status', authenticate, async (req, res) => {
  const { status } = req.body;
  const campaign = await campaignsService.updateCampaignStatus(req.params.campaignId, status);
  res.json({ success: true, data: campaign });
});

export { router as campaignsRouter };
