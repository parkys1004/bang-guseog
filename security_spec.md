# Firestore Security Specification - Bang-guseog Musician

## 1. Data Invariants
- A User profile must match the authenticated user's UID and verified email.
- A Material must have an `authorId` matching the creator's UID.
- A Message's `senderId` must be the authenticated user's UID.
- All timestamps (`createdAt`, `updatedAt`) must strictly match `request.time`.
- Role fields (role, tier) must only be modifiable by Admins.
- Document IDs must match `^[a-zA-Z0-9_\-]+$` and be under 128 characters.

## 2. The "Dirty Dozen" (Attack Payloads)
1.  **Admin Spoof**: Attempt to gain admin access with unverified email "aimaster1004@gmail.com".
2.  **Shadow Injection**: Create a user with `isVip: true` and `role: "admin"` hidden in metadata.
3.  **Identity Theft (Material)**: User A tries to create a material with `authorId: "UserB"`.
4.  **Identity Theft (Message)**: User A tries to send a message with `senderId: "Admin"`.
5.  **Timestamp Fraud**: Set `createdAt` to 10 years in the future via string manipulation.
6.  **Path Poisoning**: Create a material with a document ID that is a 1MB string of junk characters.
7.  **Privilege Escalation**: User A tries to update their own `tier` from `free` to `gold`.
8.  **Orphaned Material**: Create a material without a valid author.
9.  **PII Blanket Read**: Authenticated User B tries to `get` User A's private profile data (email).
10. **Shadow Update**: Update a material's `title` but also sneakily change the `authorId`.
11. **Terminal State Bypass**: (If applicable) Update a finished status to 'in_progress'.
12. **Query Scraping**: Attempt to list ALL messages without a filter.

## 3. Test Runner Invariants
All "Dirty Dozen" payloads must return `PERMISSION_DENIED`.
Rules must enforce `affectedKeys().hasOnly()` on every update.
Rules must enforce `request.time` for all date fields.
