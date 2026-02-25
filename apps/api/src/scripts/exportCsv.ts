import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportDataset } from '../services/syntheticData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function csvEscape(value: string | number) {
  const raw = String(value);

  if (raw.includes(',') || raw.includes('"')) {
    return `"${raw.replaceAll('"', '""')}"`;
  }

  return raw;
}

async function run() {
  const outputDir = path.resolve(__dirname, '../data/generated');
  await mkdir(outputDir, { recursive: true });

  const dataset = exportDataset();

  const readingsHeader = [
    'line_id',
    'timestamp',
    'throughput',
    'temperature',
    'pressure',
    'energy',
    'anomaly_count',
  ];

  const readingsRows = Object.entries(dataset.readingsByLine).flatMap(([lineId, points]) =>
    points.map((point) =>
      [
        lineId,
        point.timestamp,
        point.throughput,
        point.temperature,
        point.pressure,
        point.energy,
        point.anomalies.length,
      ]
        .map(csvEscape)
        .join(','),
    ),
  );

  const faultsHeader = [
    'fault_id',
    'line_id',
    'started_at',
    'ended_at',
    'fault_type',
    'category',
    'severity',
    'resolution_status',
    'duration_minutes',
  ];

  const faultsRows = dataset.faults.map((fault) =>
    [
      fault.id,
      fault.lineId,
      fault.startedAt,
      fault.endedAt ?? '',
      fault.faultType,
      fault.category,
      fault.severity,
      fault.resolutionStatus,
      fault.durationMinutes,
    ]
      .map(csvEscape)
      .join(','),
  );

  await writeFile(
    path.join(outputDir, 'sensor_readings.csv'),
    [readingsHeader.join(','), ...readingsRows].join('\n'),
    'utf8',
  );
  await writeFile(
    path.join(outputDir, 'fault_events.csv'),
    [faultsHeader.join(','), ...faultsRows].join('\n'),
    'utf8',
  );

  console.log(`CSV exports written to ${outputDir}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
