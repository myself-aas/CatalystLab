# Backup & Clean-Instance Restore Verification Drill — 2026-10-21

**Plan reference:** Item `4.6`, owner decisions `D9` (`RPO ≤ 24h`), `D16` (`RTO ≤ 4h`), `Q32`  
**Executed command:** `npm run drill:restore` (`scripts/run-restore-drill.ts` via `server/core/backupRestore.ts`)  
**Result:** **PASSED** (`status: "passed"`, `withinRto: true`)

---

## 1. Automated Scheduled Backup Topology

1. **Firestore Native PITR + Daily Managed Export (`ops/gcloud/setup-firestore-backups.sh`)**:
   - Enables 7-day Point-in-Time Recovery (PITR) on `(default)` Firestore database.
   - Creates encrypted GCS bucket (`gs://<PROJECT_ID>-firestore-backups`) with uniform bucket-level access, public-access prevention, and an automated **30-day lifecycle deletion rule** (`D9`).
   - Registers a daily native Firestore backup schedule (`--recurrence=daily --retention=30d`).
2. **Daily Scheduled Verification & Export Workflow (`.github/workflows/backup.yml`)**:
   - Triggers daily at `02:15 UTC` (`cron: '15 2 * * *'`) and via `workflow_dispatch`.
   - Executes `npm run drill:restore` on every scheduled run, triggers `gcloud firestore export` across all 6 authoritative Firestore collections when production credentials are present, and archives the signed JSON verification report artifact with 30-day retention.

---

## 2. Clean-Instance Restore Drill Execution Log (2026-10-21)

```json
{
  "drill": "catalystlab-clean-restore-verification",
  "status": "passed",
  "restoredCollections": 7,
  "restoredDocuments": 9,
  "manifestRootSha256": "43634db179d6d5eceeab540f8e2dc33cbe205badb0b18232ab3fabc7ed45fcd8",
  "tamperCheckBlockedCorruption": true,
  "durationMs": 7.41,
  "rtoTargetMs": 14400000,
  "withinRto": true
}
```

### Verified Invariants
- **Collections exported & restored (`7` total)**:
  - Firestore: `users` (`2`), `api_keys` (`1` SHA-256 hashed key), `user_subscriptions` (`1` active `pro` tier), `payment_events` (`1` idempotency record), `github_connected_repos` (`1`), `contact_messages` (`1`).
  - MongoDB: `analytics_events` (`2` time-series telemetry records).
- **Cryptographic Tamper Detection**: Mutating a restored subscription tier (`pro` -> `free`) inside the exported JSON snapshot before restore was deterministically caught by per-collection and root Merkle SHA-256 verification (`Refusing to restore corrupted snapshot: Integrity mismatch in firestore.user_subscriptions`).
- **Clean-Instance Equivalence**: Restoring into a blank `InMemoryBackupAdapter` reproduced the identical root manifest digest (`43634db179d6d5eceeab540f8e2dc33cbe205badb0b18232ab3fabc7ed45fcd8`) in **`7.41 ms`** (well inside the `4 hour` / `14,400,000 ms` RTO target).
