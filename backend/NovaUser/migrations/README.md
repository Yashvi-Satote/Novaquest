# NovaUser migrations

The NovaUser schema is small and created idempotently by the module's database
layer. There is no separate migration runner yet.

- `python backend/NovaUser/init_db.py` creates the `users.db` database (if
  needed) and calls SQLAlchemy `create_all` for the `users` table.
- `backend/NovaUser/schema.sql` is the reviewed SQL reference for the same
  table and can be applied manually with `psql`.

When the schema changes after a deployment, add a numbered SQL migration here
(for example `001_add_profile_fields.sql`) and apply it before starting the
backend. `create_all` only creates missing tables; it does not alter existing
columns, so production changes should always be shipped as an explicit
migration.
