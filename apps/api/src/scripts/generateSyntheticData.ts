import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportDataset } from '../services/syntheticData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const outputDir = path.resolve(__dirname, '../data/generated');
  await mkdir(outputDir, { recursive: true });

  const dataset = exportDataset();
  const payload = {
    generatedAt: new Date().toISOString(),
    lines: Object.keys(dataset.readingsByLine).length,
    readingsCount: Object.values(dataset.readingsByLine).reduce(
      (sum, values) => sum + values.length,
      0,
    ),
    faultsCount: dataset.faults.length,
    thresholdsByLine: dataset.thresholdsByLine,
    faults: dataset.faults,
    readingsByLine: dataset.readingsByLine,
  };

  const filePath = path.join(outputDir, 'dataset.json');
  await writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`Synthetic dataset written to ${filePath}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
