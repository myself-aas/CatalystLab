# Security Spec for CatalystLab

## Data Invariants
- A report can only be created by an authenticated user.
- A report's `ownerId` must match the `request.auth.uid`.
- Reports are readable by anyone (so they can be shared via permalinks) or maybe only by owner? The prompt says: "generating shareable permalinks". This means reads on `reports` must be public! (Or at least, if you have the ID, you can read it. A direct `get` is allowed, `list` should probably be restricted to the owner).
- Reports are immutable once created.

## Dirty Dozen Payloads
1. Unauthenticated creation -> DENY
2. Creation with mismatched ownerId -> DENY
3. Creation missing required fields -> DENY
4. Updating a report (immutability check) -> DENY
5. Deleting a report by non-owner -> DENY
6. Deleting a report by owner -> ALLOW (optional, but good)
7. Listing all reports globally -> DENY
8. Listing reports for specific owner == auth.uid -> ALLOW
9. Reading a specific report -> ALLOW
10. Creation with invalid types -> DENY
11. Creation with massive payload -> DENY
12. Creation with extra fields -> DENY

## Rules Constraints
- `allow read: if true;` (or specifically `allow get: if true; allow list: if isSignedIn() && resource.data.ownerId == request.auth.uid;`)
- `allow create: if isSignedIn() && isValidReport(incoming()) && incoming().ownerId == request.auth.uid;`
- `allow update: if false;`
- `allow delete: if isSignedIn() && resource.data.ownerId == request.auth.uid;`
