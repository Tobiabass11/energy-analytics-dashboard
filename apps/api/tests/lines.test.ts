import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('lines API', () => {
  it('returns line overview sorted by status', async () => {
    const response = await request(app).get('/api/lines/overview');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(20);
  });

  it('returns timeseries for a line and window', async () => {
    const response = await request(app)
      .get('/api/lines/LINE-01/timeseries')
      .query({ window: 'hour' });

    expect(response.status).toBe(200);
    expect(response.body.meta.lineId).toBe('LINE-01');
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('updates thresholds for a line', async () => {
    const response = await request(app)
      .put('/api/lines/LINE-01/thresholds')
      .send({
        thresholds: {
          throughput: { min: 70, max: 123, warningBuffer: 5 },
          temperature: { min: 20, max: 45, warningBuffer: 3 },
          pressure: { min: 4.5, max: 8.5, warningBuffer: 0.5 },
          energy: { min: 220, max: 390, warningBuffer: 20 },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.data.thresholds.throughput.min).toBe(70);
  });
});
