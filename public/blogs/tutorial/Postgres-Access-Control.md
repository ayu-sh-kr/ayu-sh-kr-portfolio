# PostgreSQL Permissions: Roles, GRANT and REVOKE Explained

An application connects to PostgreSQL successfully, but its first query fails with `permission denied for table orders`. Giving it `ALL PRIVILEGES ON DATABASE` sounds like a fix—until the same query fails again. Database access and table access are different permissions, and PostgreSQL checks both.

The useful question is not simply whether a user has access. It is **which role may perform which action on which object**. A reporting service should read orders, a checkout service should create them, and a migration process should change their structure. Giving all three the database owner's credentials hides those distinctions.

This guide builds that separation step by step. We will create one small shop database, give its reader and writer different permissions, test which operations are allowed, and make future migrations preserve them. Then we will add row-level security for tenant isolation and a repeatable way to diagnose permission errors.

*Updated October 8, 2026. The examples use PostgreSQL 16+ syntax and `psql`. Run the setup in a disposable development instance with an administrator account; managed services may require their own database and role provisioning steps.*

## Understand the access path before writing a GRANT

In our example, `shop` is the database, `sales` is a schema inside it, and `orders` is a table in that schema. A schema groups related objects under a name, much like a folder groups files.

Before an application can read an order, PostgreSQL needs to answer a few questions. Can this login connect to the database? Can it find the table in its schema? Is it allowed to read that table?

These are separate checks. **Authentication** verifies the login using the server’s connection rules and authentication method. **Authorization** checks what that login is allowed to do after connecting. The sketch follows a reporting query from the database connection to the rows it returns.

![A reporting query needs database CONNECT, schema USAGE and table SELECT; an enabled row policy filters the returned rows.](/blogs/tutorial/assets/postgresql-access-control/query-access.svg)

| Layer | What it controls | Permission in this example |
| --- | --- | --- |
| Database | Opening a connection to `shop` | `CONNECT` |
| Schema | Looking up objects in the `sales` namespace | `USAGE` |
| Table | Reading or changing `sales.orders` | `SELECT`, `INSERT`, or a specific column's `UPDATE` |
| Sequence | Obtaining IDs from the example's `bigserial` sequence | `USAGE` |
| Row policy, if enabled | Which rows an otherwise permitted query may access | An applicable RLS policy |

The schema’s `USAGE` privilege lets a role reach an object; the object's own privileges still determine what the role can do there. This is why database-level `ALL PRIVILEGES` does not grant access to every table inside the database.

We will follow that same path in the setup. If a later test fails, these layers give us an order in which to investigate it. PostgreSQL's [GRANT reference](https://www.postgresql.org/docs/18/sql-grant.html) lists the privileges available for each object type.

## Create roles that separate ownership from application access

PostgreSQL uses **roles** for both users and groups. A role with `LOGIN` can start a session after authentication. A `NOLOGIN` role can own objects or collect permissions for other roles to inherit.

Our example uses three responsibilities and two application logins:

| Role | Responsibility |
| --- | --- |
| `shop_owner` | Owns the schema and objects; used during migrations |
| `shop_reader` | Reads data in the reporting-approved `sales` schema |
| `shop_writer` | Reads and inserts orders; updates their status |
| `reporting_app` | Login that inherits the reader's permissions |
| `checkout_app` | Login that inherits the writer's permissions |

The application logins receive permissions through their group roles. Migrations use a separate identity that can switch to the owner role; ordinary application connections cannot make that switch.

![The reporting and checkout logins inherit reader and writer permissions; only the separate migration login can assume the owner role.](/blogs/tutorial/assets/postgresql-access-control/role-membership.svg)

In an administrator `psql` session, create them once:

```sql
CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_reader NOLOGIN;
CREATE ROLE shop_writer NOLOGIN;

CREATE ROLE reporting_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
CREATE ROLE checkout_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT shop_reader TO reporting_app WITH INHERIT TRUE;
GRANT shop_writer TO checkout_app WITH INHERIT TRUE;
```

The two `GRANT` statements assign **role membership**, rather than table permissions. With inheritance enabled, each login automatically receives the ordinary object privileges of its group role. PostgreSQL 16 and later let us make that inheritance explicit on the membership; see the [role membership documentation](https://www.postgresql.org/docs/18/role-membership.html).

Neither application is a member of `shop_owner`. That matters because an owner can alter or drop its objects and grant access to them. Revoking ordinary write permissions from a role that still owns the table does not create a reliable read-only account.

For password authentication, set secrets interactively instead of embedding a sample password in SQL history:

```text
\password reporting_app
\password checkout_app
```

These are `psql` commands, not SQL. They prompt for passwords; the server's authentication configuration must also allow the intended connections. Creating a `LOGIN` role alone does not configure network access or `pg_hba.conf`.

## Create the database and schema with a consistent owner

Still using the administrator session, create the dedicated demo database. `CREATE DATABASE` must run outside a transaction:

```sql
CREATE DATABASE shop OWNER shop_owner;

REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
GRANT CONNECT ON DATABASE shop TO shop_reader, shop_writer;
```

`PUBLIC` represents every role, including roles created later. PostgreSQL normally grants it database `CONNECT` and `TEMPORARY` privileges. Here we replace those defaults with explicit connection access for our applications. In an existing system, inventory maintenance and monitoring accounts before changing those defaults.

Connect to the new database as the same administrator:

```text
\connect shop
```

Now create the application schema and table as the owner:

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

SET ROLE shop_owner;
CREATE SCHEMA sales AUTHORIZATION shop_owner;

CREATE TABLE sales.orders (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  customer_name text NOT NULL,
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped'))
);

INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Asha', 1200.00),
  ('22222222-2222-2222-2222-222222222222', 'Ravi', 850.00);
RESET ROLE;
```

`SET ROLE` changes the active identity, so the schema, table and sequence are owned by `shop_owner`. `RESET ROLE` returns to the original administrator. Creating objects this way will also make our default privileges predictable later.

The `public` schema and the `PUBLIC` group are separate concepts. The first is a namespace; the second means everyone. New databases on PostgreSQL 15+ normally restrict public-schema creation already, while upgraded databases can retain older permissions. The explicit revoke documents our intended setup. Use qualified names such as `sales.orders` to make the target clear; [schema search paths](https://www.postgresql.org/docs/18/ddl-schemas.html) also affect how unqualified names resolve.

## Grant a read-only role access to existing tables

With the objects in place, we can grant the reader the two remaining permissions it needs. Run this in the administrator session connected to `shop`:

```sql
GRANT USAGE ON SCHEMA sales TO shop_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_reader;
```

`USAGE` lets the role look up objects in the schema, and `SELECT` permits reading its current tables. The login `reporting_app` inherits both through its membership. It receives no table-writing or schema-creation privileges from these grants.

This example treats the whole `sales` schema as approved for reporting. If it also contains private data, grant individual tables instead—for example, `GRANT SELECT ON sales.orders TO shop_reader`. The broader form is appropriate only when everything in that schema belongs approved for the same readers.

Test the effective permissions before moving on:

```sql
SET ROLE reporting_app;
SELECT current_user, session_user;
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
SELECT has_table_privilege(current_user, 'sales.orders', 'INSERT')
  AS can_insert;
RESET ROLE;
```

Expect the two seeded orders and `false` for `can_insert`. `current_user` is `reporting_app`; `session_user` remains the administrator that opened this test session. These checks exercise authorization. To test authentication and connection access too, open a second terminal and connect with the reporting login:

```bash
psql --host localhost --username reporting_app --dbname shop --password \
  --command 'SELECT id, customer_name, total FROM sales.orders ORDER BY id;'
```

Use the actual database host for a remote instance. This command prompts for the password and should return the same two rows; it does not rely on the administrator's existing connection.

> A read-only role needs a complete path to its tables, but it does not need ownership of them.

## Give the writer only the operations it needs

The checkout service should create orders and advance their status. It should not delete orders or overwrite their totals. Express that distinction directly:

```sql
GRANT USAGE ON SCHEMA sales TO shop_writer;
GRANT SELECT ON TABLE sales.orders TO shop_writer;
GRANT INSERT (tenant_id, customer_name, total)
  ON TABLE sales.orders TO shop_writer;
GRANT UPDATE (status) ON TABLE sales.orders TO shop_writer;
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_writer;
```

The column grants restrict which fields the service can supply or update. A full-table `UPDATE` grant would override that restriction, so do not combine the two if column-level limits are the goal. `SELECT` is needed for reading existing values, including columns used in a filter or `RETURNING` clause.

The sequence grant supports the `bigserial` column used in this example. Its default calls `nextval()` to allocate an ID, which requires permission on the sequence as well as permission to insert into the table. Identity columns have different implicit sequence-access behavior; the rule here applies to the explicit `bigserial`/`nextval()` design.

Test the permitted path:

```sql
SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;

UPDATE sales.orders SET status = 'paid' WHERE id = 1
RETURNING id, status;
RESET ROLE;
```

The insert returns a generated ID with `pending` status. The update changes the first seeded order to `paid`. Now try the operations that should fail, running each statement separately in `psql` autocommit mode:

```sql
SET ROLE checkout_app;
UPDATE sales.orders SET total = 1 WHERE id = 1;
-- Expected: permission denied for table orders
DELETE FROM sales.orders WHERE id = 1;
-- Expected: permission denied for table orders
ALTER TABLE sales.orders ADD COLUMN internal_note text;
-- Expected: must be owner of table orders
RESET ROLE;
```

These failures are part of the design. Testing only successful reads and inserts would miss an accidental owner membership or broader grant. The [privileges documentation](https://www.postgresql.org/docs/18/ddl-priv.html) explains the distinction between object ownership and ordinary privileges.

## Keep new tables accessible with default privileges

Our reader can access existing tables, but a deployment might create a new one tomorrow. `ON ALL TABLES IN SCHEMA` is a one-time operation; it does not subscribe the role to future tables.

The existing-table grant and the future-table default work at different times. Both are needed when a role must read tables that exist now and tables added by later migrations.

![A normal GRANT updates existing tables; default privileges give the reader SELECT when shop_owner creates a future table.](/blogs/tutorial/assets/postgresql-access-control/default-privileges.svg)

Configure future access for objects created by `shop_owner`:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_reader;
```

Then create another table under that same owner and test it:

```sql
SET ROLE shop_owner;
CREATE TABLE sales.order_events (
  order_id bigint NOT NULL REFERENCES sales.orders(id),
  event text NOT NULL
);
RESET ROLE;

SET ROLE reporting_app;
SELECT * FROM sales.order_events;
RESET ROLE;
```

The query succeeds and returns no rows because the table is empty. We did not grant the writer access to every future table: its permissions remain specific to the order workflow. New write paths should receive their own reviewed grants.

**Default privileges belong to the creating role.** If a migration login creates the table under its own identity, `shop_owner`'s defaults do not apply merely because the login is a member of that role. The migration must first `SET ROLE shop_owner`. Also, changing defaults does not repair old tables; existing objects still need a normal `GRANT`. These rules are documented in [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html).

For a deployment, an administrator can provision a separate migration login:

```sql
CREATE ROLE shop_migrator LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
GRANT CONNECT ON DATABASE shop TO shop_migrator;
GRANT shop_owner TO shop_migrator WITH INHERIT FALSE, SET TRUE;
```

Set its password separately with `\password shop_migrator` if password authentication is used. The membership allows `SET ROLE shop_owner`, but does not automatically inherit the owner's privileges. Start migrations with that role switch and finish with `RESET ROLE`. Keep these credentials out of the running application: the migration login can deliberately assume ownership authority.

## Add row-level security when access depends on the tenant

So far, the checkout service can read every order. Table privileges cannot express “only orders belonging to the current tenant.” **Row-level security (RLS)** adds that filter after ordinary object privileges have allowed the operation.

In the sketch, Asha and Meera belong to tenant A, while Ravi belongs to tenant B. The checkout query has permission to read the table, but its tenant policy returns only the rows for A.

![With tenant A context, the checkout query returns Asha and Meera, excludes Ravi from tenant B, and checks that new rows also belong to A.](/blogs/tutorial/assets/postgresql-access-control/tenant-row-policy.svg)

For this demonstration, trusted application code supplies a tenant UUID for each transaction. Add a writer policy as the table owner:

```sql
SET ROLE shop_owner;
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_writer_tenant ON sales.orders
  FOR ALL TO shop_writer
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );

CREATE POLICY orders_reporting ON sales.orders
  FOR SELECT TO shop_reader
  USING (true);
RESET ROLE;
```

`USING` selects the existing rows a writer may see or target. `WITH CHECK` checks the new row produced by an insert or update. A missing or empty tenant setting becomes `NULL`, so it does not match a tenant. An invalid UUID produces an error rather than granting access.

The reporting policy deliberately retains the reader's cross-tenant access. That is a separate business decision, not a default to copy into every multi-tenant application. With RLS enabled, a role without an applicable policy receives the default-deny behavior. See [CREATE POLICY](https://www.postgresql.org/docs/18/sql-createpolicy.html) for how command-specific policies combine.

Test the checkout session inside one transaction:

```sql
SET ROLE checkout_app;
BEGIN;
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';
SELECT customer_name FROM sales.orders ORDER BY id;
-- Asha and Meera; Ravi belongs to the other tenant.
UPDATE sales.orders SET status = 'shipped' WHERE id = 2;
-- UPDATE 0: the other tenant's row is not visible to this operation.
COMMIT;
RESET ROLE;
```

`SET LOCAL` scopes the value to the transaction, which matters when a connection pool reuses sessions. Set it at the start of every request transaction, and run all that request's queries on the same connection. In application code, a parameterized `SELECT set_config('app.tenant_id', $1, true)` can supply the value without constructing SQL text.

This setting is **context supplied by the application, not proof of tenant identity**. A caller able to execute arbitrary SQL as `checkout_app` can change it. Derive the tenant from authenticated server-side identity; do not expose these credentials or an unrestricted SQL interface to tenants. This pattern helps catch missing tenant filters, but does not make a compromised shared database credential tenant-safe.

Superusers and roles with `BYPASSRLS` bypass these policies. Owners normally bypass them too, unless `FORCE ROW LEVEL SECURITY` is enabled. Test with the runtime role, not the migration account. RLS also does not restrict whole-table operations such as `TRUNCATE`, which is another reason the runtime role never received that privilege. PostgreSQL's [row security guide](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) covers these exceptions.

## Diagnose permission errors using the same access path

Now that the roles have a known purpose, a failure can be traced to the permission that is missing. Start with the identity and effective privileges, rather than adding a broad grant:

```sql
SELECT current_user, session_user, current_database();
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
SELECT has_schema_privilege('checkout_app', 'sales', 'USAGE')
  AS can_use_schema;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT')
  AS can_read;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE')
  AS can_generate_id;
```

All five checks should return `true` for this setup. A table-level check for `UPDATE` would return `false`, because we granted only one column. Use the column-aware function when testing column privileges. These [information functions](https://www.postgresql.org/docs/18/functions-info.html) report effective access rather than requiring you to interpret every grant manually.

| Symptom | Check first | Narrow repair |
| --- | --- | --- |
| Authentication fails | Credentials, host rules, connection endpoint | Fix authentication before changing object grants |
| Permission denied for database | `CONNECT` for the login or inherited role | Grant connection access to the intended role |
| Permission denied for schema | Schema `USAGE` | Grant `USAGE` on that schema |
| Permission denied for table | Required operation, columns and inherited roles | Grant the missing operation on the intended table or columns |
| Permission denied for sequence | Sequence used by an insert's default | Grant the required sequence privilege |
| New table fails after deployment | Creator, owner and default privileges | Repair the existing table and correct future creation |
| Query returns no rows under RLS | Tenant context and applicable policies | Correct the request context or policy, not the table grant |

For an audit in `psql`, inspect the stored grants and defaults too:

```text
\du
\dn+ sales
\dp sales.*
\ddp
```

`\du` lists roles; `\dn+` shows schema details; `\dp` shows object privileges; and `\ddp` lists default privileges. If the application works as an administrator but fails as its actual login, that is evidence to inspect these permissions—not a reason to deploy administrator credentials.

## Revoke access and verify what remains

Access changes when a service or person's responsibilities change. Remove the membership that supplied the responsibility, then verify the result. For example, after the earlier tests:

```sql
REVOKE shop_reader FROM reporting_app;
SELECT has_table_privilege('reporting_app', 'sales.orders', 'SELECT')
  AS can_still_read;
-- Expected: false in this demo.
```

PostgreSQL permissions are additive. Revoking one path does not cancel access received through another group, a direct grant, ownership or `PUBLIC`. If the result remains `true`, inspect those other paths. `REVOKE` is not an explicit deny rule.

For a retiring login, `ALTER ROLE reporting_app NOLOGIN` blocks new logins but does not disconnect existing sessions. Session termination is a separate administrator action and should account for active work. The [REVOKE reference](https://www.postgresql.org/docs/18/sql-revoke.html) explains how grant dependencies affect removal.

## Make permissions part of the migration, not an emergency fix

Return to the opening failure: a successful connection followed by `permission denied for table`. We can now identify the login, follow its memberships, check schema and table access, and test the exact query. There is no need to guess whether a database-wide grant will solve it.

Keep role definitions, object grants, defaults and policy changes in reviewed migrations. For each application role, retain one test for an operation it must perform and one for an operation it must be unable to perform. Repeat those tests after adding a table or changing ownership.

The design stays understandable when each role has one clear job: migrations own the objects, reporting reads approved data, and checkout performs a limited set of writes. New requirements then become small, explicit permission changes instead of another reason to share the owner's credentials.
