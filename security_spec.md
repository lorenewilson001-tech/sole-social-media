# Security Specification - PostApproval Portal

## 1. Data Invariants
- A `Comment` cannot exist without a valid `postId`.
- A `Post` can only be created by an authenticated user (`authorId` must match `request.auth.uid`).
- Only the `author` can update the post content (caption/image).
- The `client` can only update the `status` and `comments`.
- Immortality: `createdAt` cannot be changed after creation.

## 2. The Dirty Dozen Payloads (Negative Tests)

1. **Identity Spoofing**: Creating a post with another user's `authorId`.
2. **Ghost Field Injection**: Adding `isAdmin: true` to a post document.
3. **Status Hijacking**: Client trying to change `authorId`.
4. **Orphaned Comment**: Creating a comment for a non-existent `postId`.
5. **Unauthorized Read**: Unauthenticated user trying to list posts.
6. **Immutable field update**: Trying to change `createdAt` on a post.
7. **Resource Poisoning**: Extremely long string in `caption` (over 5000 chars).
8. **Invalid ID**: Using special characters or too long string in document ID.
9. **State Shortcutting**: Skipping "Pending" to "Approved" without being authenticated.
10. **Shadow Commenting**: Adding a comment with someone else's `authorName`.
11. **Self-Promotion**: User trying to change their own role to 'admin' (if implemented).
12. **PII Leak**: Authenticated user trying to read user profiles they don't own.

## 3. Expectations
All the above payloads MUST return `PERMISSION_DENIED`.
