import { isAfter } from 'date-fns';

export function isSlotExpired(startTime: string): boolean {
  const now = new Date();
  const slotStartTime = new Date(startTime);
  return isAfter(now, slotStartTime);
}