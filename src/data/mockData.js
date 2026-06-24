// ============================================================
// DATA LAYER — Syncs with Google Sheets via Backend
// ============================================================

export let GCS = [];

export let goLiveTracker = [];
export let gcv3 = [];
export let hitsTracker = [];
export let dailyMetrics = {};
export let metabase = [];

export function updateSheetData(data) {
  if (data.goLiveTracker) goLiveTracker = data.goLiveTracker;
  if (data.gcv3) gcv3 = data.gcv3;
  if (data.hitsTracker) hitsTracker = data.hitsTracker;
  if (data.dailyMetrics) dailyMetrics = data.dailyMetrics;
}
// Old mock data deleted.

// ── Initial Seed Tasks (human-created) ────────────────────
export const seedTasks = [];
