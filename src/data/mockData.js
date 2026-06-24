// ============================================================
// DATA LAYER — Syncs with Google Sheets via Backend
// ============================================================

export let GCS = [];

export let goLiveTracker = [];
export let gcv3 = [];
export let hitsTracker = [];
export let dailyMetrics = {};
export let metabase = [];
export let pausedSellers = [];

export function updateSheetData(data) {
  if (data.goLiveTracker) {
    goLiveTracker = data.goLiveTracker;
    
    // Dynamically build GCS based on unique GCs found in Yash Bucket
    const gcMap = new Map();
    goLiveTracker.forEach(seller => {
      const gcName = seller.gc;
      if (!gcName) return;
      if (!gcMap.has(gcName)) {
        gcMap.set(gcName, { id: `gc_${gcName.replace(/\s+/g, '')}`, name: gcName, assignedCount: 0 });
      }
      gcMap.get(gcName).assignedCount++;
    });
    GCS = Array.from(gcMap.values());
  }
  
  // Extract valid IDs strictly from the Yash Bucket (goLiveTracker)
  const validIds = new Set(goLiveTracker.map(s => String(s.sellerId).trim()).filter(Boolean));

  if (data.gcv3) {
    // Force frontend-side filtering just in case the backend payload has unfiltered raw data
    gcv3 = data.gcv3.filter(s => validIds.has(String(s.sellerId).trim()));
  }
  
  if (data.hitsTracker) {
    hitsTracker = data.hitsTracker.filter(s => validIds.has(String(s.sellerId).trim()));
  }
  
  if (data.dailyMetrics) dailyMetrics = data.dailyMetrics;
  if (data.pausedSellers) pausedSellers = data.pausedSellers;
}
// Old mock data deleted.

// ── Initial Seed Tasks (human-created) ────────────────────
export const seedTasks = [];
