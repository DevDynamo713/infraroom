export type ResourceState = 'in_sync' | 'drifted' | 'missing' | 'pending';
export interface Resource { id: string; name: string; type: string; desired: string; actual: string; state: ResourceState; lastChecked: string }
export function detectDrift(desired: string, actual: string): ResourceState {
  if (desired === actual) return 'in_sync';
  if (!actual || actual === '') return 'missing';
  return 'drifted';
}
export function driftScore(resources: Resource[]): number {
  if (resources.length === 0) return 100;
  const inSync = resources.filter(r => r.state === 'in_sync').length;
  return Math.round((inSync / resources.length) * 100);
}
export function formatResource(r: Resource): string { return `${r.name} [${r.type}] desired:${r.desired} actual:${r.actual} state:${r.state}`; }