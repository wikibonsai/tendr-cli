import { doctor } from './doctor';

// Backwards-compatible shim: `lint` was renamed to `doctor`.
export function lint(payload: any, opts?: any): void {
  doctor(payload, opts);
}

