# MUSAFIR Firestore Security Specification

## 1. Data Invariants
- `/users/{userId}`: Only the owning authenticated, email-verified user (or admin) can read or write their profile. Users cannot self-assign elevated roles (`role == 'user'` enforced on create, immutable on update).
- `/bookings/{bookingId}`: Only authenticated, email-verified users can create bookings with `userId == request.auth.uid`, valid YYYY-MM-DD dates, positive traveler count (`1..20`), positive price, and `status == 'confirmed'`. Only the owner (`resource.data.userId == request.auth.uid`) or admin can read/list/cancel their bookings. Cancelled bookings are terminal and locked for non-admins.
- `/subscribers/{subscriberId}`: Document ID must equal `request.auth.uid`; only owner or admin can read/create.
- `/destinationOverrides/{destinationId}`: Publicly readable (`get`/`list`) for destination verification display; strictly writable only by verified admins (`isAdmin()`).
- `/admins/{userId}`: Only owner or admin can read; client writes strictly denied.
- `/test/connection`: Read-only (`get`) connectivity check document; `list` and writes denied.

## 2. Dirty Dozen Adversarial Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/users/u1` -> Denied (PII protection).
2. Cross-user read of `/users/u2` while signed in as `u1` -> Denied.
3. Self-escalation on `/users/u1` creation with `{ role: 'admin' }` -> Denied.
4. Shadow field injection on `/users/u1` with `{ extraFlag: true }` -> Denied (`hasOnly`).
5. Unverified email user creating `/bookings/b1` -> Denied (`email_verified == true`).
6. Identity spoofing creating `/bookings/b1` with `userId: 'victim'` -> Denied.
7. Blanket list query on `/bookings` without owner filter -> Denied (`resource.data.userId == request.auth.uid`).
8. Invalid date/negative price/oversized string on `/bookings/b1` -> Denied.
9. Re-activating a `cancelled` booking as non-admin -> Denied (terminal state locking).
10. Modifying `createdAt` or `userId` on `/bookings/b1` update -> Denied (immutable fields).
11. Non-admin writing to `/destinationOverrides/rishikesh-uttarakhand` -> Denied.
12. Spoofed admin email (`email_verified: false`) writing `/destinationOverrides/rishikesh-uttarakhand` -> Denied.
