# MWIT Fund

[![Docker](https://img.shields.io/badge/Deployed%20with-Docker-2496ED?logo=docker)](https://www.docker.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20NC-purple.svg)](./LICENSE)

A donation management platform for MWIT alumni fundraising.

## Features

- **Donation Tracking** - Record and manage donations with receipt generation
- **Alumni Profiles** - Member directory and profile management
- **Blog System** - Content management with rich text editor
- **Q&A Section** - Community questions and answers
- **Admin Dashboard** - User management, content moderation, analytics
- **Statistics** - Donation analytics and visualizations
- **Dark Mode** - System-aware theme switching

## Tech Stack

- Next.js 16 (Turbopack)
- React 19
- Prisma + PostgreSQL
- NextAuth.js
- Tailwind CSS
- Cloudflare R2

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js secret |
| `NEXTAUTH_URL` | Yes | Application URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `R2_ENDPOINT` | Yes | Cloudflare R2 endpoint |
| `R2_ACCESS_KEY_ID` | Yes | R2 access key ID |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret access key |
| `R2_BUCKET_NAME` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | Public URL for R2 assets |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key |

## License

[PolyForm Noncommercial 1.0.0](./LICENSE)
