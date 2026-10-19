import { describe, it, expect } from 'vitest';
import { detectDrift, driftScore, formatResource } from './infra';
describe('infra', () => {
  it('detectDrift in_sync when matching', () => { expect(detectDrift('v1.0', 'v1.0')).toBe('in_sync'); });
  it('detectDrift drifted when different', () => { expect(detectDrift('v1.0', 'v1.1')).toBe('drifted'); });
  it('detectDrift missing when actual empty', () => { expect(detectDrift('v1.0', '')).toBe('missing'); });
  it('driftScore 100% when all in sync', () => {
    const resources = [
      { id: '1', name: 'r1', type: 'vm', desired: 'v1', actual: 'v1', state: 'in_sync', lastChecked: '2026-10-19T12:00:00Z' },
      { id: '2', name: 'r2', type: 'db', desired: 'v2', actual: 'v2', state: 'in_sync', lastChecked: '2026-10-19T12:00:00Z' }
    ];
    expect(driftScore(resources)).toBe(100);
  });
  it('driftScore 50% when half drifted', () => {
    const resources = [
      { id: '1', name: 'r1', type: 'vm', desired: 'v1', actual: 'v1', state: 'in_sync', lastChecked: '2026-10-19T12:00:00Z' },
      { id: '2', name: 'r2', type: 'db', desired: 'v2', actual: 'v3', state: 'drifted', lastChecked: '2026-10-19T12:00:00Z' }
    ];
    expect(driftScore(resources)).toBe(50);
  });
  it('driftScore 0% when all drifted', () => {
    const resources = [
      { id: '1', name: 'r1', type: 'vm', desired: 'v1', actual: 'v2', state: 'drifted', lastChecked: '2026-10-19T12:00:00Z' }
    ];
    expect(driftScore(resources)).toBe(0);
  });
  it('formats correctly', () => {
    const r = { id: '1', name: 'web-server', type: 'vm', desired: 'v1.0', actual: 'v1.0', state: 'in_sync', lastChecked: '2026-10-19T12:00:00Z' };
    expect(formatResource(r)).toBe('web-server [vm] desired:v1.0 actual:v1.0 state:in_sync');
  });
});