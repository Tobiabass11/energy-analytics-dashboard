import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OverviewPage } from './OverviewPage';

vi.mock('../lib/api', () => ({
  getLineOverview: vi.fn(async () => [
    {
      lineId: 'LINE-03',
      throughputRate: 90,
      oee: 80,
      status: 'nominal',
      downtimeMinutes: 0,
      faultCount: 0,
      lastUpdated: new Date().toISOString(),
    },
    {
      lineId: 'LINE-01',
      throughputRate: 75,
      oee: 65,
      status: 'critical',
      downtimeMinutes: 45,
      faultCount: 2,
      lastUpdated: new Date().toISOString(),
    },
  ]),
}));

describe('OverviewPage', () => {
  it('renders line tiles sorted by status severity', async () => {
    const client = new QueryClient();

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <OverviewPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('LINE-01')).toBeInTheDocument();
    expect(await screen.findByText('LINE-03')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveTextContent('LINE-01');
  });
});
