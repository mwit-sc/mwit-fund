# Database Migration from Supabase to PostgreSQL

This project has been migrated from Supabase to a local PostgreSQL database using Docker.

## Quick Start

1. **Start the PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env.local` and update the values if needed:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Setup

The PostgreSQL database is configured in `docker-compose.yml` with:
- **Host:** localhost
- **Port:** 5432
- **Database:** mwit_fund
- **User:** postgres
- **Password:** password

### Database Schema

The database includes:
- `donations` table: Stores donation records
- `donation_stats` table: Tracks total donations and donor counts
- Automatic triggers to update statistics when donations are approved

## API Changes

- Replaced `@supabase/supabase-js` with `pg` (PostgreSQL client)
- Created `DatabaseAPI` class in `src/app/lib/api.ts` for database operations
- Updated donation form to use new API

## File Storage

**Note:** This migration removes file upload functionality that was previously handled by Supabase Storage. For production use, you'll need to implement a file storage solution such as:
- Local file system storage
- AWS S3
- Google Cloud Storage
- Or another cloud storage provider

## Database Management

### Access the database directly:
```bash
docker exec -it mwit-fund-db psql -U postgres -d mwit_fund
```

### Stop the database:
```bash
docker-compose down
```

### Reset the database (removes all data):
```bash
docker-compose down -v
docker-compose up -d
```

## Removed Dependencies

The following Supabase-related dependencies can be removed if not needed elsewhere:
- `@supabase/supabase-js`

## Environment Variables

Required environment variables in `.env.local`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mwit_fund
DB_USER=postgres
DB_PASSWORD=password
```