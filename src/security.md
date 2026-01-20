# Security Policy 🔐

This project takes security seriously, especially because it is intended for real people and a potentially vulnerable community.

If you discover a security vulnerability, please report it responsibly.

---

## Supported Versions

Until the project reaches a stable release, only the latest version in the `main` branch is considered supported.

---

## Reporting a Vulnerability

### ✅ Please report security issues privately

Do **not** open a public issue for vulnerabilities.

Instead, report privately using one of the following:

**Preferred method**

- Email: **(add email here)**

**Alternative**

- If email is not possible, create a GitHub issue with minimal details and label it `security`.
  (The maintainer will then move it to a private channel.)

---

## What to Include

To help us investigate quickly, include:

- A clear description of the issue
- Steps to reproduce (proof of concept if possible)
- Potential impact (what could happen?)
- Any logs, screenshots, or example payloads (if relevant)
- Where in the codebase it occurs (file/path)

---

## Response Timeline (Best Effort)

We aim to respond as quickly as possible:

- **Initial response:** within 72 hours
- **Status update:** within 7 days
- **Fix / mitigation:** depends on severity and complexity

This is a small project, but security reports are treated as high priority.

---

## Responsible Disclosure

We kindly ask that you do not publicly disclose vulnerabilities until:

- a fix is released, or
- a mitigation plan is in place

We will coordinate disclosure with you when appropriate.

---

## Security Notes (Project-Specific)

A few areas we consider high risk in a chat/community app:

- Authentication & sessions
- Rate limiting / spam protection
- Realtime subscriptions
- Data privacy & access control (Row Level Security if using Supabase)
- Stored content and moderation tools
- Any user-generated content rendering (XSS risks)

---

## Thank You 💛

Thanks for helping keep this project and its community safe.
