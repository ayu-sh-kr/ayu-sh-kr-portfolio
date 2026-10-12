# PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes

A checkout service needs to read orders, create them, mark them as paid and log what happened. It should not be able to delete order history or change the schema. In this guide we build that role one grant at a time, then look at the permission errors you are most likely to hit.

If you landed here with an error message, start with the table.

## Quick fixes for permission denied errors

Run each fix as the table owner or an administrator. Grant to the group role (`shop_checkout` below), not to each login.

| Error | Fix |
| --- | --- |
| [`ERROR:  permission denied for table orders`](#error%3A-permission-denied-for-table-orders) | Grant the operation that failed, such as `GRANT SELECT ON TABLE sales.orders TO shop_checkout;` |
| [`ERROR:  permission denied for sequence orders_id_seq`](#error%3A-permission-denied-for-sequence-orders_id_seq) | `GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;` |
| [`ERROR:  permission denied for schema sales`](#error%3A-permission-denied-for-schema-sales) | `GRANT USAGE ON SCHEMA sales TO shop_checkout;` |
| [`FATAL:  permission denied for database "shop"`](#fatal%3A-permission-denied-for-database-%22shop%22) | `GRANT CONNECT ON DATABASE shop TO shop_checkout;` |
| [`ERROR:  permission denied to create database`](#error%3A-permission-denied-to-create-database) | `ALTER ROLE checkout_app CREATEDB;`, if it should create databases at all |
| [`ERROR:  must be owner of table orders`](#error%3A-must-be-owner-of-table-orders) | Run the change as the owner, for example after `SET ROLE shop_owner;` |
| [New tables are not readable](#new-tables-are-not-accessible-to-the-role) | `ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;` |
| [A query returns no rows and no error](#zero-rows-without-an-error-is-row-level-security) | Not a grant problem. Check row-level security. |

Every command here was run on PostgreSQL 14, 16 and 17. The walkthrough uses PostgreSQL 16 syntax for role membership, and needs an administrator who can create roles and databases.

## Start with the shop and the job the role must do

The database is `shop`. Its `sales` schema holds the order tables, so `sales.orders` is the `orders` table inside `sales`.

PostgreSQL calls users and groups **roles**. A role with `LOGIN` can connect; a `NOLOGIN` role holds permissions or owns objects. We need three:

| Role | Purpose |
| --- | --- |
| `shop_owner` | Owns the tables and changes them |
| `shop_checkout` | Holds the permissions checkout needs |
| `checkout_app` | The service login, a member of `shop_checkout` |

<img src="/blogs/tutorial/assets/postgresql-access-control/role-membership.svg" alt="The checkout login inherits permissions from shop_checkout. The separate shop_owner creates and changes objects; the application is not a member of it." width="640" height="490">

Create the roles from an administrator `psql` session:

```sql
CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE checkout_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
```

The `GRANT` makes the login a member of the group, so anything we grant to `shop_checkout` reaches `checkout_app`. Right now the group has nothing. Set the login's password with `\password checkout_app` rather than writing it into SQL.

Create the database and remove the defaults that let every role connect to it:

```sql
CREATE DATABASE shop OWNER shop_owner;
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
```

`PUBLIC` means every role. Removing its defaults makes each grant below visible. Don't do this on an existing database without checking who relies on it.

Run `\connect shop`, then create the first table as its owner:

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

`SET ROLE shop_owner` makes the owner create these objects. The application never joins that role, so it will be able to use the tables but not alter or drop them. The first line stops every role from creating objects in the shared `public` schema; new databases on PostgreSQL 15 and later already work that way.

## Give the checkout role permission to connect

The login can't enter `shop` yet. Check, grant, and check again:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- false
GRANT CONNECT ON DATABASE shop TO shop_checkout;
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- true
```

Confirm from a second terminal. Expect `checkout_app` and `shop`:

```bash
psql --host localhost --username checkout_app --dbname shop --password \
  --command 'SELECT current_user, current_database();'
```

`CONNECT` only lets the login in. It still can't read anything.

Back in the administrator session, each test below switches to the login with `SET ROLE checkout_app` and back with `RESET ROLE`. Run the statements one at a time, so an expected error doesn't stop the next one.

## Let the connected role find the sales schema

Try reading orders:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for schema sales
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

The role can't look inside `sales`. Grant `USAGE` on the schema and try again:

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;

SET ROLE checkout_app;
-- Expect error: permission denied for table orders
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

A different error means progress: the role can find the table now, but not read it.

<img src="/blogs/tutorial/assets/postgresql-access-control/query-access.svg" alt="A checkout query needs database CONNECT, schema USAGE and table SELECT. If row-level security is enabled later, its policy filters the returned rows." width="640" height="462">

We don't grant schema `CREATE`. Checkout uses tables; creating them is the owner's job.

## Let the role read orders

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
RESET ROLE;
```

Both orders come back. A reporting service could stop here.

`GRANT ALL PRIVILEGES ON DATABASE shop` would not have fixed the table error. Database privileges cover the database, not the tables inside it. The [GRANT reference](https://www.postgresql.org/docs/18/sql-grant.html) lists what each object type accepts.

## Allow order creation, then supply the generated ID

Next, checkout places an order for Meera:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

Grant `INSERT` on the three columns the service fills in. The ID and status come from defaults:

```sql
GRANT INSERT (tenant_id, customer_name, total)
  ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
-- Expect error: permission denied for sequence orders_id_seq
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

The `bigserial` ID comes from the sequence `sales.orders_id_seq`, and table `INSERT` doesn't cover it:

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;

SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

The insert returns Meera's new ID with status `pending`. `RETURNING` works because the role can already `SELECT`. Identity columns don't need the sequence grant; see [the sequence error](#error%3A-permission-denied-for-sequence-orders_id_seq).

## Allow status updates without allowing price changes

When a payment clears, checkout marks the order as paid:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
UPDATE sales.orders SET status = 'paid' WHERE id = 1;
RESET ROLE;
```

Grant `UPDATE` on `status` only:

```sql
GRANT UPDATE (status) ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
UPDATE sales.orders SET status = 'paid' WHERE id = 1
RETURNING id, status;
RESET ROLE;
```

Then check what it still can't do:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
UPDATE sales.orders SET total = 1 WHERE id = 1;
-- Expect error: permission denied for table orders
DELETE FROM sales.orders WHERE id = 1;
-- Expect error: must be owner of table orders
ALTER TABLE sales.orders ADD COLUMN internal_note text;
RESET ROLE;
```

A column grant doesn't check the transition itself: checkout can set any status the `CHECK` constraint allows. The [rules for valid payment and shipping transitions](/blog/business-logic-auth-middleware/) belong in application code.

## Extend the same role when the workflow gains an event table

A migration adds `sales.order_events`, and checkout needs to read and append to it:

```sql
SET ROLE shop_owner;
CREATE TABLE sales.order_events (
  order_id bigint NOT NULL REFERENCES sales.orders(id),
  event text NOT NULL
);
RESET ROLE;

SET ROLE checkout_app;
-- Expect error: permission denied for table order_events
SELECT * FROM sales.order_events;
RESET ROLE;
```

Access to `orders` doesn't carry over to a new table. Grant it explicitly:

```sql
GRANT SELECT, INSERT ON TABLE sales.order_events TO shop_checkout;

SET ROLE checkout_app;
SELECT * FROM sales.order_events;
RESET ROLE;
```

Events have no generated ID, so there is no sequence to grant. `UPDATE` and `DELETE` stay ungranted.

If every future table in `sales` should be readable by checkout, set a default instead of granting each one:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
```

<img src="/blogs/tutorial/assets/postgresql-access-control/default-privileges.svg" alt="An explicit grant gives checkout access to existing tables. A default SELECT grant applies to future sales tables created by shop_owner." width="640" height="530">

Defaults apply only to tables created later, and only to tables created by the role in `FOR ROLE`. A migration that creates tables under its own name skips them; [new tables](#new-tables-are-not-accessible-to-the-role) covers the fix.

## Limit the completed workflow to the current tenant

Grants decide what checkout can do. **Row-level security (RLS)** decides which rows it can do it to. Asha and Meera belong to tenant A and Ravi to tenant B. With tenant A selected, checkout should see two orders.

<img src="/blogs/tutorial/assets/postgresql-access-control/tenant-row-policy.svg" alt="Checkout with tenant A context sees Asha and Meera, while Ravi's tenant B row is excluded. New rows must also match tenant A." width="640" height="494">

As the owner, add a policy to the orders table:

```sql
SET ROLE shop_owner;
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY checkout_orders ON sales.orders
  FOR ALL TO shop_checkout
  USING (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  )
  WITH CHECK (
    tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
  );
RESET ROLE;
```

`USING` filters the rows a query can see or change. `WITH CHECK` validates rows being written. A missing tenant setting matches nothing.

Events need a policy too, or checkout could read another tenant's events. This one follows the parent order:

```sql
SET ROLE shop_owner;
ALTER TABLE sales.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY checkout_order_events ON sales.order_events
  FOR ALL TO shop_checkout
  USING (EXISTS (
    SELECT 1 FROM sales.orders o
    WHERE o.id = order_events.order_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM sales.orders o
    WHERE o.id = order_events.order_id
  ));
RESET ROLE;
```

Policies don't grant anything: `FOR ALL` doesn't give checkout `DELETE`. Also, any connection can change `app.tenant_id`, so set it from the authenticated user on the server. RLS here protects against a forgotten `WHERE` clause, not against a leaked database password. Table owners, superusers and `BYPASSRLS` roles skip policies, which is another reason checkout isn't the owner. The [RLS guide](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) lists the other exceptions.

## Run the complete checkout task with the accumulated permissions

Now run the whole task as checkout:

```sql
SET ROLE checkout_app;
BEGIN;
SET LOCAL app.tenant_id = '11111111-1111-1111-1111-111111111111';

SELECT id, customer_name, status FROM sales.orders ORDER BY id;
-- Asha and Meera; Ravi's order is hidden.

UPDATE sales.orders SET status = 'paid' WHERE id = 1
RETURNING id, status;

INSERT INTO sales.order_events (order_id, event)
VALUES (1, 'payment_received');

SELECT o.customer_name, o.status, e.event
FROM sales.orders o
JOIN sales.order_events e ON e.order_id = o.id
WHERE o.id = 1;
-- Asha | paid | payment_received

COMMIT;
RESET ROLE;
```

The status change and its event commit together. [Kafgres, a Kafka-compatible broker inside PostgreSQL](/news/kafgres-kafka-broker-postgres-700mbs/), pairs a row with its event the same way. Real payment code still needs retries, [duplicate-event prevention](/blog/distributed-locks-redis/) and payment verification.

`SET LOCAL` ends the tenant setting with the transaction. With a connection pool, set it for each request on the connection that runs the queries; application code can bind it with `SELECT set_config('app.tenant_id', $1, true)`.

The other tenant sees only its own data:

```sql
SET ROLE checkout_app;
BEGIN;
SET LOCAL app.tenant_id = '22222222-2222-2222-2222-222222222222';
SELECT customer_name FROM sales.orders;
-- Ravi only.
SELECT * FROM sales.order_events;
-- No rows: Asha's event belongs to another tenant.
ROLLBACK;
RESET ROLE;
```

## Review what the role gained, and remove what it no longer needs

| Permission | What it allows |
| --- | --- |
| Database `CONNECT` | Open a connection to `shop` |
| Schema `USAGE` | Find objects in `sales` |
| `SELECT` on orders | Read orders, filter and return values |
| Column `INSERT` on orders | Create orders with the permitted fields |
| Sequence `USAGE` | Generate the order ID |
| Column `UPDATE` on status | Mark an order as paid |
| `SELECT, INSERT` on events | Read and append events |
| Default `SELECT` (optional) | Read future tables created by the owner |
| RLS policies | Keep all of it inside the current tenant |

When something fails later, check the one permission involved instead of reaching for `ALL`:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect;
SELECT has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE')
  AS can_generate_id;
```

All return `true`. Note the column check for `status`: a table-wide `UPDATE` check would return `false`.

If a payment service takes over status updates, remove just that capability:

```sql
REVOKE UPDATE (status) ON TABLE sales.orders FROM shop_checkout;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
-- false
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
-- true
```

`REVOKE` removes a grant; it isn't a deny. The role can still get the same access through another membership, a direct grant or `PUBLIC`, so check the result.

## `ERROR:  permission denied for table orders`

The role reached the table but lacks the privilege for this statement. The message is the same for `SELECT`, `INSERT`, `UPDATE` and `DELETE`, so read the failing statement to see which grant is missing:

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT');
```

Writes can need `SELECT` too. `INSERT ... RETURNING` reads the new row, and `UPDATE ... WHERE` reads the filtered columns. PostgreSQL 10 worded this error as `permission denied for relation`; versions 13 to 17 say `table`.

### Zero rows without an error is row-level security

If a query works but returns fewer rows than you expect, check for RLS before changing any grants:

```sql
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
```

Once RLS is enabled, a role that no policy applies to sees no rows at all.

## `ERROR:  permission denied for sequence orders_id_seq`

`serial` and `bigserial` columns fill their ID by calling `nextval()` on a sequence, and that needs `USAGE`:

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
-- or every sequence that exists in the schema now:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
```

`SELECT` on the sequence alone doesn't fix it. Identity columns behave differently: on PostgreSQL 14, 16 and 17, inserts into `GENERATED ALWAYS AS IDENTITY` and `GENERATED BY DEFAULT AS IDENTITY` columns worked with no sequence privilege at all. On a new table, an identity column avoids this error.

## `ERROR:  permission denied for schema sales`

This appears in two cases: the role lacks `USAGE` and names a table in the schema, or it lacks `CREATE` and tries to create something there. `CREATE` doesn't include `USAGE`, so a migration role needs both:

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT USAGE, CREATE ON SCHEMA sales TO migrator;
```

If the query leaves out the schema and relies on `search_path`, the same missing `USAGE` shows up as `ERROR:  relation "orders" does not exist`. The table is there; the role just can't see into the schema.

PostgreSQL 15 also changed the `public` schema. On 14 and earlier, any role could create tables in `public` of a new database. From 15, it gets `ERROR:  permission denied for schema public`. Give the application its own schema, or grant `CREATE ON SCHEMA public` explicitly.

## `FATAL:  permission denied for database "shop"`

This happens while connecting:

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.
```

The login authenticated but has no `CONNECT`. New databases grant it to `PUBLIC`, so you only see this where someone revoked that default, as we did:

```sql
GRANT CONNECT ON DATABASE shop TO shop_checkout;
```

### `no pg_hba.conf entry` is an authentication problem

```text
FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption
```

No `GRANT` fixes this one. The server turned the connection away because no line in `pg_hba.conf` matches this host, user and database. Add a matching rule, or change the equivalent setting on a managed service, and reload.

### `ERROR:  permission denied to create database`

Creating databases is a role attribute, not a grant. `ALTER ROLE checkout_app CREATEDB;` fixes it, but an application login rarely needs it. Leave database creation to an administrator.

## `ERROR:  must be owner of table orders`

Only the owner can alter or drop a table, and no `GRANT` changes that. Run schema changes as the owner by making the migration login a member of the owning role:

```sql
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
-- PostgreSQL 14 and 15: GRANT shop_owner TO migrator;
```

An administrator can also hand a table over with `ALTER TABLE ... OWNER TO shop_owner`.

Tables the migration login creates under its own name belong to it, not to `shop_owner`. Run `SET ROLE shop_owner` before `CREATE TABLE`, or the next section's problem follows.

## New tables are not accessible to the role

`GRANT SELECT ON ALL TABLES IN SCHEMA sales` only covers tables that exist when it runs. After the next migration, checkout gets `ERROR:  permission denied for table shipments` on the new table. For future tables, set default privileges for the role that creates them:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
```

The catch is `FOR ROLE`. These defaults only apply to objects `shop_owner` creates. When a migration login created a table as itself, checkout couldn't read it; the same migration with `SET ROLE shop_owner` first worked. Without `FOR ROLE`, defaults apply to whoever runs the statement. `\ddp` lists the defaults in place, and the [ALTER DEFAULT PRIVILEGES reference](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html) has the full syntax.

## How to check existing privileges in PostgreSQL

PostgreSQL has no `SHOW GRANTS`; `SHOW GRANTS FOR checkout_app` is a syntax error. In `psql`, use these instead:

- `\dp sales.orders`, or `\z`, shows table, column and sequence privileges and RLS policies. An entry such as `shop_checkout=r/shop_owner` means `shop_checkout` has `SELECT`, granted by `shop_owner`.
- `\du` lists roles. From psql 16, role memberships moved to `\drg`.
- `\l shop` and `\dn+ sales` show database and schema privileges.
- `\ddp` shows default privileges.

For a script or an access review, query the information schema. It lists direct grants only, so inherited access appears under the group, not the login:

```sql
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;
```

To see what a login can actually do, inherited grants included, use the privilege functions. This lists one role's privileges on one table:

```sql
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
```

It reports table-wide grants only. For checkout's column-level `INSERT` and `UPDATE`, use `has_column_privilege` as in the review section.

## Least-privilege PostgreSQL role checklist

- Grant to a `NOLOGIN` group role and make the service login a member.
- Grant `CONNECT` only on the databases the service uses.
- Grant schema `USAGE`, and keep `CREATE` with the migration role.
- Grant table privileges per operation, by column for writes.
- Add sequence `USAGE` for `serial` keys, or use identity columns.
- Set default privileges `FOR ROLE` the owner that runs migrations.
- Use RLS for tenant data, and keep the application role out of the owner role and without `BYPASSRLS`.
- Revoke what is no longer used, and verify with the `has_*_privilege` functions.

For broad reporting or data-loading jobs, PostgreSQL 14 added `pg_read_all_data` and `pg_write_all_data`; 13 doesn't have them. They skip per-table grants, but RLS still applies to them.

## Stop granting when the domain task works

The checkout role started with no access. Each permission it holds now answers a failure we saw: connect, find the schema, read, write specific columns, generate IDs, append events. That is the method: write down the task, grant what it needs, test as the service login, and keep a test for something it must not do. Store the grants next to the migrations that create the objects.

A useful application role is not the one with the most privileges. It is the one with a reason for every privilege it holds.
