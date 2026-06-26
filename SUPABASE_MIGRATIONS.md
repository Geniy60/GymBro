# Supabase Migrations

Use the project migration runner:

```powershell
npm.cmd run db:apply -- supabase/migrations/<migration-file>.sql
```

The runner reads the database connection string from one of these environment
variables:

- `SUPABASE_DATABASE_URL`
- `DATABASE_URL`

If neither variable is already set, set `SUPABASE_DATABASE_URL` temporarily in
the same PowerShell session. Do not commit the real database password to the
repository.

Example:

```powershell
$env:SUPABASE_DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
npm.cmd run db:apply -- supabase/migrations/20260626130000_gymbro_initial_schema.sql
Remove-Item Env:\SUPABASE_DATABASE_URL
```

The command prints `Applied migration: ...` when the migration succeeds.
