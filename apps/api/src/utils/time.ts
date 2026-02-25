import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { SHIFT_DEFINITIONS, TIMEZONE, type TimeWindow } from '@energy-dashboard/shared';

dayjs.extend(utc);
dayjs.extend(timezone);

export function nowInLagos() {
  return dayjs().tz(TIMEZONE);
}

export function resolveWindowStart(window: TimeWindow) {
  const now = nowInLagos();

  switch (window) {
    case 'hour':
      return now.subtract(1, 'hour');
    case 'day':
      return now.subtract(1, 'day');
    case 'week':
      return now.subtract(7, 'day');
    case 'shift': {
      const hour = now.hour();

      if (hour >= 6 && hour < 14) {
        return now.startOf('day').hour(6).minute(0).second(0).millisecond(0);
      }

      if (hour >= 14 && hour < 22) {
        return now.startOf('day').hour(14).minute(0).second(0).millisecond(0);
      }

      if (hour >= 22) {
        return now.startOf('day').hour(22).minute(0).second(0).millisecond(0);
      }

      return now.subtract(1, 'day').startOf('day').hour(22).minute(0).second(0).millisecond(0);
    }
    default:
      return now.subtract(1, 'hour');
  }
}

export function formatShiftName(timestampIso: string) {
  const stamp = dayjs(timestampIso).tz(TIMEZONE);
  const hour = stamp.hour();

  if (hour >= SHIFT_DEFINITIONS[0].startHour && hour <= SHIFT_DEFINITIONS[0].endHour) {
    return SHIFT_DEFINITIONS[0].name;
  }

  if (hour >= SHIFT_DEFINITIONS[1].startHour && hour <= SHIFT_DEFINITIONS[1].endHour) {
    return SHIFT_DEFINITIONS[1].name;
  }

  return SHIFT_DEFINITIONS[2].name;
}

export function toLagosDate(timestampIso: string) {
  return dayjs(timestampIso).tz(TIMEZONE).format('YYYY-MM-DD');
}
