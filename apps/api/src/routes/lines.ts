import { Router } from 'express';
import { z } from 'zod';
import {
  sortLinesByStatus,
  type FaultEvent,
  type ThresholdConfig,
  type TimeWindow,
} from '@energy-dashboard/shared';
import {
  getFaultEvents,
  getLineOverview,
  getLineSeries,
  getLineThresholds,
  getShiftSummary,
  updateLineThresholds,
} from '../services/syntheticData.js';

const router = Router();

const timeWindowSchema = z.enum(['hour', 'shift', 'day', 'week']);

router.get('/overview', (_req, res) => {
  const sorted = sortLinesByStatus(getLineOverview());

  res.json({
    data: sorted,
    meta: {
      total: sorted.length,
      generatedAt: new Date().toISOString(),
    },
  });
});

router.get('/:lineId/timeseries', (req, res) => {
  const paramsSchema = z.object({
    lineId: z.string().regex(/^LINE-\d{2}$/),
  });

  const querySchema = z.object({
    window: timeWindowSchema.default('shift'),
  });

  const params = paramsSchema.safeParse(req.params);
  const query = querySchema.safeParse(req.query);

  if (!params.success || !query.success) {
    res.status(400).json({ message: 'Invalid lineId or window query parameter.' });
    return;
  }

  const lineId = params.data.lineId;
  const window = query.data.window as TimeWindow;

  res.json({
    data: getLineSeries(lineId, window),
    meta: {
      lineId,
      window,
    },
  });
});

router.get('/:lineId/faults', (req, res) => {
  const paramsSchema = z.object({
    lineId: z.string().regex(/^LINE-\d{2}$/),
  });

  const querySchema = z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
    category: z.enum(['mechanical', 'electrical', 'quality', 'utility']).optional(),
  });

  const params = paramsSchema.safeParse(req.params);
  const query = querySchema.safeParse(req.query);

  if (!params.success || !query.success) {
    res.status(400).json({ message: 'Invalid filters provided for fault log query.' });
    return;
  }

  const faults = getFaultEvents({
    lineId: params.data.lineId,
    start: query.data.start,
    end: query.data.end,
    category: query.data.category as FaultEvent['category'] | undefined,
  });

  res.json({
    data: faults,
    meta: {
      total: faults.length,
    },
  });
});

router.get('/:lineId/thresholds', (req, res) => {
  const paramsSchema = z.object({
    lineId: z.string().regex(/^LINE-\d{2}$/),
  });

  const params = paramsSchema.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({ message: 'Invalid lineId format.' });
    return;
  }

  res.json({
    data: getLineThresholds(params.data.lineId),
  });
});

router.put('/:lineId/thresholds', (req, res) => {
  const paramsSchema = z.object({
    lineId: z.string().regex(/^LINE-\d{2}$/),
  });

  const bodySchema = z.object({
    thresholds: z.object({
      throughput: z.object({
        min: z.number(),
        max: z.number(),
        warningBuffer: z.number().nonnegative(),
      }),
      temperature: z.object({
        min: z.number(),
        max: z.number(),
        warningBuffer: z.number().nonnegative(),
      }),
      pressure: z.object({
        min: z.number(),
        max: z.number(),
        warningBuffer: z.number().nonnegative(),
      }),
      energy: z.object({
        min: z.number(),
        max: z.number(),
        warningBuffer: z.number().nonnegative(),
      }),
    }),
  });

  const params = paramsSchema.safeParse(req.params);
  const body = bodySchema.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({ message: 'Invalid payload for threshold update.' });
    return;
  }

  const updated = updateLineThresholds(params.data.lineId, body.data.thresholds as ThresholdConfig);

  res.json({
    data: updated,
    message: 'Thresholds updated',
  });
});

router.get('/:lineId/shifts/summary', (req, res) => {
  const paramsSchema = z.object({
    lineId: z.string().regex(/^LINE-\d{2}$/),
  });

  const querySchema = z.object({
    date: z.string().optional(),
  });

  const params = paramsSchema.safeParse(req.params);
  const query = querySchema.safeParse(req.query);

  if (!params.success || !query.success) {
    res.status(400).json({ message: 'Invalid lineId or date.' });
    return;
  }

  res.json({
    data: getShiftSummary(params.data.lineId, query.data.date),
  });
});

export default router;
