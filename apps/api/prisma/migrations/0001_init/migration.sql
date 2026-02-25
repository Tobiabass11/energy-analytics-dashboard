CREATE TABLE "ProductionLine" (
  "id" TEXT PRIMARY KEY,
  "lineCode" TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "SensorReading" (
  "id" TEXT PRIMARY KEY,
  "lineId" TEXT NOT NULL,
  "timestamp" TIMESTAMP NOT NULL,
  "throughput" DOUBLE PRECISION NOT NULL,
  "temperature" DOUBLE PRECISION NOT NULL,
  "pressure" DOUBLE PRECISION NOT NULL,
  "energy" DOUBLE PRECISION NOT NULL,
  "anomalyJson" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "FaultEvent" (
  "id" TEXT PRIMARY KEY,
  "lineId" TEXT NOT NULL,
  "startedAt" TIMESTAMP NOT NULL,
  "endedAt" TIMESTAMP,
  "faultType" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "resolutionStatus" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ThresholdConfig" (
  "id" TEXT PRIMARY KEY,
  "lineId" TEXT NOT NULL UNIQUE,
  "throughputMin" DOUBLE PRECISION NOT NULL,
  "throughputMax" DOUBLE PRECISION NOT NULL,
  "throughputWarningBuffer" DOUBLE PRECISION NOT NULL,
  "temperatureMin" DOUBLE PRECISION NOT NULL,
  "temperatureMax" DOUBLE PRECISION NOT NULL,
  "temperatureWarningBuffer" DOUBLE PRECISION NOT NULL,
  "pressureMin" DOUBLE PRECISION NOT NULL,
  "pressureMax" DOUBLE PRECISION NOT NULL,
  "pressureWarningBuffer" DOUBLE PRECISION NOT NULL,
  "energyMin" DOUBLE PRECISION NOT NULL,
  "energyMax" DOUBLE PRECISION NOT NULL,
  "energyWarningBuffer" DOUBLE PRECISION NOT NULL,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "sensor_line_timestamp_idx" ON "SensorReading" ("lineId", "timestamp");
CREATE INDEX "fault_line_started_idx" ON "FaultEvent" ("lineId", "startedAt");
CREATE INDEX "fault_category_idx" ON "FaultEvent" ("category");

ALTER TABLE "SensorReading" ADD CONSTRAINT "sensor_line_fk" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE CASCADE;
ALTER TABLE "FaultEvent" ADD CONSTRAINT "fault_line_fk" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE CASCADE;
ALTER TABLE "ThresholdConfig" ADD CONSTRAINT "threshold_line_fk" FOREIGN KEY ("lineId") REFERENCES "ProductionLine"("id") ON DELETE CASCADE;
