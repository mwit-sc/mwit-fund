# Prisma Migration Guide

This project has been migrated from using direct PostgreSQL connections to Prisma ORM.

## What Changed

- **Database Connection**: Replaced manual `pg` pool connections with Prisma Client
- **Type Safety**: All database operations now use generated TypeScript types
- **Query Builder**: Replaced raw SQL queries with Prisma's type-safe query API
- **Schema Management**: Database schema is now defined in `prisma/schema.prisma`

## Key Files

- `prisma/schema.prisma` - Database schema definition
- `src/app/lib/prisma.ts` - Prisma client configuration
- `src/app/lib/api.ts` - Updated database API using Prisma

## Database Schema

The schema includes:
- `donations` - Donation records with approval workflow
- `donation_stats` - Global donation statistics  
- `expenses` - Income/expense tracking by academic year
- `yearly_stats` - Yearly financial summaries
- `users` - User authentication and roles

## Development Commands

```bash
# Generate Prisma client (runs automatically on build/install)
npx prisma generate

# View/edit database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Environment Variables

Make sure your `.env` file includes:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mwit_fund
DB_USER=postgres
DB_PASSWORD=password

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
```

## Production Deployment

The existing `init.sql` file is still used for initial database setup. The Prisma schema matches this structure exactly, so no migration is needed for existing data.

For new deployments:
1. Database will be initialized with `init.sql` via Docker
2. Prisma client will be generated during build
3. Application will connect using Prisma ORM