# PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes

Picture a small online shop with a checkout service in front of its PostgreSQL database. Checkout reads orders, creates them, marks them as paid and logs each payment. It never needs to delete orders or change tables.

The easy setup is to let checkout log in as the database owner. Then a bug or a leaked password can drop tables too. Giving it a login that can do only its job is safer, but that login runs into `permission denied` errors. We'll build it one error at a time.

Already stuck on a specific error? The [quick fixes table](#quick-fixes-for-permission-denied-errors) maps each message to its fix.

## How PostgreSQL decides whether a query is allowed

Before writing any SQL, it helps to know what PostgreSQL checks when a query arrives. Every user, service and group in PostgreSQL is a **role**. A role with the `LOGIN` attribute can connect, like a user account. A role without it is a container for permissions or an owner of tables, like a group. Roles can be members of other roles and inherit their permissions.

When checkout runs `SELECT * FROM sales.orders`, PostgreSQL asks four questions in order:

1. **May this role connect to the database?** That is the `CONNECT` privilege on `shop`.
2. **May it look inside the schema?** A schema is a named folder of tables inside a database. `sales.orders` means the `orders` table in the `sales` schema, and looking inside needs `USAGE` on the schema.
3. **May it run this operation on this table?** `SELECT`, `INSERT`, `UPDATE` and `DELETE` are separate privileges, and `INSERT` and `UPDATE` can be limited to specific columns.
4. **Which rows may it see?** If row-level security is turned on, a policy filters the rows.

A "no" at any layer stops the query, and the error names the layer: database, schema, table or sequence. That is why a single "permission denied" can need four different fixes. Changing a table's structure is a separate matter altogether. Only the table's owner can do that, and no privilege grants it.

## Start with the shop and the job the role must do

We will use three roles. Separating the owner from the service is the point of the exercise: the service uses tables, the owner creates and changes them.

| Role | Purpose |
| --- | --- |
| `shop_owner` | Owns the tables and changes them |
| `shop_checkout` | Holds the permissions checkout needs |
| `checkout_app` | The service login, a member of `shop_checkout` |

Granting to `shop_checkout` instead of directly to the login means a second checkout instance, or a replacement login, gets the same access by joining the group.

<img src="/blogs/tutorial/assets/postgresql-access-control/role-membership.svg" alt="The checkout login inherits permissions from shop_checkout. The separate shop_owner creates and changes objects; the application is not a member of it." width="640" height="490">

Every command in this guide was run on PostgreSQL 14, 16 and 17. The walkthrough uses PostgreSQL 16 syntax for role membership and needs an administrator account that can create roles and databases. Use a disposable database while you follow along.

Create the roles from an administrator `psql` session:

```sql
CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE checkout_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
```

The `GRANT` makes the login a member of the group, so anything we grant to `shop_checkout` reaches `checkout_app`. Right now the group has nothing, so the login has nothing. Set its password with `\password checkout_app` rather than writing the password into SQL.

Next, create the database. A new database lets every role connect through a built-in group called `PUBLIC`, which means "every role". We remove that default so each grant below has a visible effect:

```sql
CREATE DATABASE shop OWNER shop_owner;
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
```

Don't do this on an existing database without checking which services rely on the default.

Run `\connect shop`, then create the `sales` schema and the orders table as the owner, with two sample orders:

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

`SET ROLE shop_owner` makes the owner the active role, so it owns what gets created; `RESET ROLE` switches back to the administrator. The `tenant_id` column records which shop customer an order belongs to. We use it at the end to keep tenants apart. The first line stops every role from creating objects in the shared `public` schema. New databases on PostgreSQL 15 and later already work that way.

## Give the checkout role permission to connect

**Problem:** the login exists, but it can't open a connection to `shop`, because we removed the default `CONNECT`.

**Solution:** grant `CONNECT` to the group. `has_database_privilege` lets the administrator check before and after:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- false
GRANT CONNECT ON DATABASE shop TO shop_checkout;
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- true
```

Confirm it from a second terminal. Expect `checkout_app` and `shop`:

```bash
psql --host localhost --username checkout_app --dbname shop --password \
  --command 'SELECT current_user, current_database();'
```

Connecting is all `CONNECT` allows. The login still can't read a single row.

Back in the administrator session, each test below switches to the login with `SET ROLE checkout_app` and back with `RESET ROLE`. Run the statements one at a time, so an expected error doesn't stop the next one.

## Let the connected role find the sales schema

**Problem:** checkout's first real task is reading orders, and it fails at the schema layer:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for schema sales
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

**Solution:** grant `USAGE` on the schema, which lets the role look up the tables inside it. Then run the same query:

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;

SET ROLE checkout_app;
-- Expect error: permission denied for table orders
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

It still fails, but the error has moved from the schema to the table. That is progress: the role can find `sales.orders` now, it just isn't allowed to read it.

<img src="/blogs/tutorial/assets/postgresql-access-control/query-access.svg" alt="A checkout query needs database CONNECT, schema USAGE and table SELECT. If row-level security is enabled later, its policy filters the returned rows." width="640" height="462">

We don't grant `CREATE` on the schema. Checkout uses tables; creating them stays with the owner.

## Let the role read orders

**Problem:** the role can find the table but has no privilege on it.

**Solution:** grant `SELECT` on the table:

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
RESET ROLE;
```

Asha's and Ravi's orders come back. The role now has a complete read path: connect, find the schema, read the table. A reporting service could stop here.

You may see `GRANT ALL PRIVILEGES ON DATABASE shop` suggested as a fix for table errors. It doesn't work: privileges on a database cover the database itself, not the tables inside it. The [GRANT reference](https://www.postgresql.org/docs/18/sql-grant.html) lists which privileges each kind of object accepts.

## Allow order creation, then supply the generated ID

**Problem:** checkout needs to place an order for a new customer, Meera, and the insert is refused:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

**Solution, part one:** grant `INSERT`, but only on the three columns the service fills in. The ID and status come from column defaults:

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

A new error, from a new layer. The `id` column is a `bigserial`, which gets its next number from a **sequence**: a small counter object, here called `sales.orders_id_seq`. Taking a number from it needs its own permission, and table `INSERT` doesn't include it.

**Solution, part two:** grant `USAGE` on the sequence:

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;

SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

The insert returns Meera's new ID with status `pending`. `RETURNING` reads the new row back, which works because the role already has `SELECT`. Identity columns, the newer alternative to `bigserial`, don't need the sequence grant at all; [the sequence error section](#error%3A-permission-denied-for-sequence-orders_id_seq) shows the difference.

## Allow status updates without allowing price changes

**Problem:** when a payment clears, checkout has to mark the order as paid, and it has no `UPDATE` privilege:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
UPDATE sales.orders SET status = 'paid' WHERE id = 1;
RESET ROLE;
```

**Solution:** grant `UPDATE` on the `status` column only. A table-wide `UPDATE` would also let checkout change totals and customer names:

```sql
GRANT UPDATE (status) ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
UPDATE sales.orders SET status = 'paid' WHERE id = 1
RETURNING id, status;
RESET ROLE;
```

Now confirm the limits. Each of these should fail:

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

The last one is the ownership rule from the start: changing a table's structure belongs to its owner, whatever privileges another role holds.

A column grant controls which column changes, not which value it changes to. Checkout could still set an order back to `pending`, because the `CHECK` constraint allows it. The [rules for valid payment and shipping transitions](/blog/business-logic-auth-middleware/) belong in application code.

## Extend the same role when the workflow gains an event table

**Problem:** a later migration adds `sales.order_events` for the event log. Checkout's access to `orders` does not carry over to the new table:

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

**Solution:** grant the new table explicitly, with only the two operations the log needs:

```sql
GRANT SELECT, INSERT ON TABLE sales.order_events TO shop_checkout;

SET ROLE checkout_app;
SELECT * FROM sales.order_events;
RESET ROLE;
```

The query returns no rows, and no error. Events have no generated ID, so there's no sequence to grant, and `UPDATE` and `DELETE` stay ungranted so the log can only grow.

Granting every new table by hand gets tedious. If every future table in `sales` should be readable by checkout, set a **default privilege** once:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
```

<img src="/blogs/tutorial/assets/postgresql-access-control/default-privileges.svg" alt="An explicit grant gives checkout access to existing tables. A default SELECT grant applies to future sales tables created by shop_owner." width="640" height="530">

Defaults apply only to tables created later, and only to tables created by the role named in `FOR ROLE`. A migration that creates tables under a different role skips them, which is a common surprise; [the section on new tables](#new-tables-are-not-accessible-to-the-role) shows the fix. Write access stays explicit either way.

## Limit the completed workflow to the current tenant

**Problem:** the shop runs several storefronts, or tenants, in the same tables. Asha and Meera belong to tenant A and Ravi to tenant B. Our grants decide *what* checkout can do, but checkout serving tenant A can still read Ravi's order.

**Solution:** **row-level security (RLS)** adds a filter on *which rows* each operation can touch. With tenant A selected, checkout should see two orders.

<img src="/blogs/tutorial/assets/postgresql-access-control/tenant-row-policy.svg" alt="Checkout with tenant A context sees Asha and Meera, while Ravi's tenant B row is excluded. New rows must also match tenant A." width="640" height="494">

As the owner, turn on RLS for the orders table and add a policy that compares each row's `tenant_id` with a setting the application provides:

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

`USING` filters the rows a query can read or change. `WITH CHECK` validates rows being written, so checkout can't create an order for another tenant. If the setting is missing, no row matches.

The event table needs its own policy, or checkout could still read another tenant's events. This one allows an event only when its order is visible:

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

Three limits are worth knowing. Policies only filter: `FOR ALL` doesn't give checkout `DELETE`, because it still has no grant for it. Any connection can change `app.tenant_id`, so the application must set it from the authenticated user on the server; RLS here protects against a forgotten `WHERE` clause, not against a leaked database password. And table owners, superusers and roles with `BYPASSRLS` skip policies entirely, which is one more reason checkout is not the owner. The [RLS guide](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) covers the remaining exceptions.

## Run the complete checkout task with the accumulated permissions

**Problem:** each grant has been tested on its own. The real test is the full job in one transaction: find the order, mark it paid, log the event.

**Solution:** run it as checkout, with the tenant set for this transaction only:

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

No extra grant was needed. The status change and its event commit together, or not at all. [Kafgres, a Kafka-compatible broker inside PostgreSQL](/news/kafgres-kafka-broker-postgres-700mbs/), pairs a row with its event the same way. A real payment flow still needs retries, [duplicate-event prevention](/blog/distributed-locks-redis/) and payment verification on top.

`SET LOCAL` ends the tenant setting with the transaction. With a connection pool, set it for every request on the connection that runs that request's queries; application code can bind it safely with `SELECT set_config('app.tenant_id', $1, true)`.

Switch to tenant B to confirm the separation:

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

Each permission checkout holds now answers a failure we saw along the way:

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

**Problem:** months later, something fails, and the tempting fix is `GRANT ALL`. **Solution:** check the one permission involved. The `has_*_privilege` functions answer for the login, including anything it inherits from its group:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect;
SELECT has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE')
  AS can_generate_id;
```

All five return `true`. The status check uses the column function on purpose: a table-wide `UPDATE` check would return `false`, because the grant covers one column.

Access should also shrink when the job does. If a separate payment service takes over status updates, remove just that capability and confirm the rest still works:

```sql
REVOKE UPDATE (status) ON TABLE sales.orders FROM shop_checkout;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
-- false
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
-- true
```

`REVOKE` removes one grant; it isn't a deny rule. The same access can still arrive through another group, a direct grant or `PUBLIC`, so always check the result.

## Quick fixes for permission denied errors

The walkthrough met the common errors in a tidy order. In a real system they arrive out of order, often in a setup someone else built. This table maps each message, exactly as `psql` prints it, to its usual fix in terms of the shop example. Run fixes as the owner or an administrator, and grant to the group role rather than the login. Each error links to a short explanation below.

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

## `ERROR:  permission denied for table orders`

**Cause:** the role reached the table but lacks the privilege for this statement. The message is identical for `SELECT`, `INSERT`, `UPDATE` and `DELETE`, so read the failing statement to see which grant is missing.

**Fix:** grant that operation, then confirm:

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT');
```

Writes can need `SELECT` too. `INSERT ... RETURNING` reads the new row back, and `UPDATE ... WHERE` reads the columns in the filter. On PostgreSQL 10 the same error read `permission denied for relation`; versions 13 to 17 say `table`.

### Zero rows without an error is row-level security

A query that succeeds but returns fewer rows than expected is not a permission error. Check whether row-level security is on, and which policies apply, before changing any grants:

```sql
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
```

Once RLS is enabled on a table, a role that no policy applies to sees no rows at all.

## `ERROR:  permission denied for sequence orders_id_seq`

**Cause:** `serial` and `bigserial` columns fill their value by calling `nextval()` on a sequence, and that needs `USAGE` on the sequence. Table `INSERT` doesn't include it, and `SELECT` on the sequence alone doesn't help either.

**Fix:**

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
-- or every sequence that exists in the schema now:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
```

Identity columns behave differently. On PostgreSQL 14, 16 and 17, inserts into `GENERATED ALWAYS AS IDENTITY` and `GENERATED BY DEFAULT AS IDENTITY` columns worked with no sequence privilege at all. For a new table, an identity column avoids this error entirely.

## `ERROR:  permission denied for schema sales`

**Cause:** one of two missing schema privileges. Without `USAGE`, the role can't name anything inside the schema. Without `CREATE`, it can't create objects there. `CREATE` doesn't include `USAGE`, so a migration role needs both.

**Fix:**

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT USAGE, CREATE ON SCHEMA sales TO migrator;
```

If a query leaves out the schema name and relies on the `search_path` setting, the same missing `USAGE` looks different: `ERROR:  relation "orders" does not exist`. The table exists; the role just can't see into its schema.

PostgreSQL 15 changed the `public` schema. On 14 and earlier, any role could create tables in the `public` schema of a new database; from 15 it gets `ERROR:  permission denied for schema public`. An application that relied on the old behaviour needs its own schema or an explicit `GRANT CREATE ON SCHEMA public`.

## `FATAL:  permission denied for database "shop"`

**Cause:** this one appears while connecting, before any query runs:

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.
```

The login authenticated, but has no `CONNECT` on this database. New databases grant it to `PUBLIC`, so you only see this where someone revoked that default, as this guide did.

**Fix:**

```sql
GRANT CONNECT ON DATABASE shop TO shop_checkout;
```

### `no pg_hba.conf entry` is an authentication problem

```text
FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption
```

This looks similar but no `GRANT` fixes it. The server refused the connection because no line in its `pg_hba.conf` file allows this host, user and database to connect. Add a matching rule, or change the equivalent network setting on a managed service, and reload the configuration.

### `ERROR:  permission denied to create database`

Creating databases is an attribute of the role, not a privilege on an object. `ALTER ROLE checkout_app CREATEDB;` fixes it, but an application login rarely needs it. Leave database creation to an administrator.

## `ERROR:  must be owner of table orders`

**Cause:** only a table's owner can alter or drop it, and no `GRANT` changes that.

**Fix:** run schema changes as the owner. Make the migration login a member of the owning role, so it can act as the owner:

```sql
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
-- PostgreSQL 14 and 15: GRANT shop_owner TO migrator;
```

An administrator can also hand a table to the right owner with `ALTER TABLE ... OWNER TO shop_owner`.

Watch what the migration creates. Tables it creates under its own name belong to `migrator`, not to `shop_owner`. Run `SET ROLE shop_owner` before `CREATE TABLE`, or the next problem follows.

## New tables are not accessible to the role

**Cause:** `GRANT SELECT ON ALL TABLES IN SCHEMA sales` is a one-off. It covers the tables that exist when it runs, so after the next migration checkout gets `ERROR:  permission denied for table shipments` on the new table.

**Fix:** set default privileges for the role that creates the tables, for both tables and their sequences:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
```

The detail that trips people up is `FOR ROLE`. These defaults apply only to objects `shop_owner` creates. When the migration login created a table under its own name, checkout couldn't read it; the same migration with `SET ROLE shop_owner` first worked. Without `FOR ROLE`, a default applies to whichever role runs the statement. `\ddp` lists the defaults in place, and the [ALTER DEFAULT PRIVILEGES reference](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html) has the full syntax.

## How to check existing privileges in PostgreSQL

Before fixing anything, it helps to see what a role already has. PostgreSQL has no `SHOW GRANTS` command; `SHOW GRANTS FOR checkout_app` is a syntax error. In `psql`, use these instead:

- `\dp sales.orders`, or `\z`, shows table, column and sequence privileges and RLS policies. An entry such as `shop_checkout=r/shop_owner` means `shop_checkout` has `SELECT` (`r` for read), granted by `shop_owner`.
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

To see what a login can actually do, inherited grants included, use the privilege functions. This lists every table privilege one role has on one table:

```sql
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
```

It reports table-wide grants only. For checkout's column-level `INSERT` and `UPDATE`, use `has_column_privilege` as in the review section.

## Least-privilege PostgreSQL role checklist

The walkthrough turns into a short checklist for the next service:

- Grant to a `NOLOGIN` group role and make the service login a member.
- Grant `CONNECT` only on the databases the service uses.
- Grant schema `USAGE`, and keep `CREATE` with the migration role.
- Grant table privileges per operation, by column for writes.
- Add sequence `USAGE` for `serial` keys, or use identity columns.
- Set default privileges `FOR ROLE` the owner that runs migrations.
- Use RLS for tenant data, and keep the application role out of the owner role and without `BYPASSRLS`.
- Revoke what is no longer used, and verify with the `has_*_privilege` functions.

For broad reporting or data-loading jobs, PostgreSQL 14 added two ready-made roles, `pg_read_all_data` and `pg_write_all_data`; version 13 doesn't have them. They skip per-table grants, but row-level security still applies to them.

## Stop granting when the domain task works

We started with a checkout service that could have run as the database owner, where a bug or a leaked password could drop tables. It now runs as a login that can do exactly its job: connect to `shop`, read and create orders, mark them paid, and append events, all inside one tenant. If its password leaks tomorrow, the damage stops at those operations.

Each `permission denied` along the way pointed at one layer, and each fix was the smallest grant for that layer. That is the method for the next service too: write down the task, grant what it needs, test as the service login, and keep a test for something it must not do. Store the grants beside the migrations that create the tables, so access changes with the schema.

A useful application role is not the one with the most privileges. It is the one with a reason for every privilege it holds.
