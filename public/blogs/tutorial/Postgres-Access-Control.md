# PostgreSQL Permissions: GRANT, REVOKE and Permission Denied Fixes

A checkout service needs to read orders, create new ones, mark them as paid and record what happened. It does not need permission to delete the order history or change the database structure. How do we give it enough access to finish its work without making it the database owner?

## Quick fixes for permission denied errors

Each row shows the message exactly as `psql` prints it and the smallest usual fix. Run fixes as the object owner or an administrator, and grant to the group role (`shop_checkout` in this guide) rather than to each login. Select an error to jump to its explanation.

| Error | Usual fix |
| --- | --- |
| [`ERROR:  permission denied for table orders`](#error%3A-permission-denied-for-table-orders) | Grant the operation that failed, such as `GRANT SELECT ON TABLE sales.orders TO shop_checkout;` |
| [`ERROR:  permission denied for sequence orders_id_seq`](#error%3A-permission-denied-for-sequence-orders_id_seq) | Let `serial` and `bigserial` inserts draw IDs: `GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;` |
| [`ERROR:  permission denied for schema sales`](#error%3A-permission-denied-for-schema-sales) | `GRANT USAGE ON SCHEMA sales TO shop_checkout;` and add `CREATE` only for roles that create objects |
| [`FATAL:  permission denied for database "shop"`](#fatal%3A-permission-denied-for-database-%22shop%22) | `GRANT CONNECT ON DATABASE shop TO shop_checkout;` |
| [`ERROR:  permission denied to create database`](#error%3A-permission-denied-to-create-database) | `ALTER ROLE checkout_app CREATEDB;`, if the role should create databases at all |
| [`ERROR:  must be owner of table orders`](#error%3A-must-be-owner-of-table-orders) | Run the DDL as the owning role, for example after `SET ROLE shop_owner;` |
| [New tables are not readable](#new-tables-are-not-accessible-to-the-role) | `ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales GRANT SELECT ON TABLES TO shop_checkout;` |
| [A query returns zero rows without an error](#zero-rows-without-an-error-is-row-level-security) | Not a missing grant: check the row-level security policy and the setting it reads |

To see what a role already has before changing anything, use the queries in [how to check existing privileges](#how-to-check-existing-privileges-in-postgresql).

## Build the checkout role one grant at a time

We will build that role from an empty starting point. At first, it cannot even connect to the shop database. Each section adds one capability, repeats the operation that needed it, and explains the result. The same checkout login, tables and orders continue through the whole guide.

By the end, the service will complete a payment update and write its event in one transaction. Along the way, we will see why `CONNECT`, schema `USAGE`, table privileges and sequence privileges are separate, how new tables get permissions, and where row-level security fits.

*Updated October 12, 2026. The tutorial uses a disposable PostgreSQL 16+ instance and `psql`; the troubleshooting SQL was tested on PostgreSQL 14, 16 and 17, with version differences marked where they appear. The setup requires a database administrator able to create roles and databases and assume the owner role. Managed services may require different provisioning steps.*

## Start with the shop and the job the role must do

Our database is called `shop`. Inside it, a schema named `sales` groups the tables for the order workflow. A schema works like a named folder: `sales.orders` means the `orders` table inside `sales`.

The checkout service will eventually need four operations: read an order, create an order, update its status, and add an entry to `sales.order_events`. We will create the event table only when the workflow reaches that requirement. That keeps the first setup small and lets us see what happens when a new table arrives.

PostgreSQL calls both users and permission groups **roles**. A role with `LOGIN` can authenticate. A `NOLOGIN` role can collect permissions or own objects. We need just three roles for this walkthrough:

| Role | Purpose |
| --- | --- |
| `shop_owner` | Owns the database objects and creates or changes them |
| `shop_checkout` | Collects the permissions required by checkout |
| `checkout_app` | The service login that inherits those permissions |

The login keeps the same membership throughout the guide. As we add permissions to `shop_checkout`, they become available to `checkout_app` too.

<img src="/blogs/tutorial/assets/postgresql-access-control/role-membership.svg" alt="The checkout login inherits permissions from shop_checkout. The separate shop_owner creates and changes objects; the application is not a member of it." width="640" height="490">

Open an administrator `psql` session and create the roles:

```sql
CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_checkout NOLOGIN;
CREATE ROLE checkout_app LOGIN
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

GRANT shop_checkout TO checkout_app WITH INHERIT TRUE;
```

This `GRANT` assigns membership, not data access. The group has no shop permissions yet, so the login receives none from it. PostgreSQL's [role membership documentation](https://www.postgresql.org/docs/18/role-membership.html) explains inheritance and the explicit membership options available in PostgreSQL 16+.

Set the login's password interactively, avoiding a password literal in the SQL:

```text
\password checkout_app
```

Now create the database, outside a transaction:

```sql
CREATE DATABASE shop OWNER shop_owner;
REVOKE CONNECT, TEMPORARY ON DATABASE shop FROM PUBLIC;
```

`PUBLIC` means every role. PostgreSQL normally gives it database connection and temporary-table privileges. We remove those defaults in this new demo database so that each permission we add has a visible effect. On an existing database, review application, monitoring and maintenance access before doing this.

Connect the administrator session to `shop`:

```text
\connect shop
```

Create the first table as `shop_owner`, with two sample orders:

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

`SET ROLE` makes `shop_owner` the active identity, so it owns the objects created here. `RESET ROLE` returns to the administrator. The application is not a member of the owner role: it will receive permission to use the tables, not authority to alter or drop them.

The lowercase `public` schema is different from the `PUBLIC` group. We explicitly disallow everyone from creating objects in that shared schema; new PostgreSQL 15+ databases normally already have that restriction. Our application uses `sales` instead.

## Give the checkout role permission to connect

The shop exists, but the checkout login cannot enter it yet. Confirm that from the administrator session:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- false
```

Grant the first capability and repeat the check:

```sql
GRANT CONNECT ON DATABASE shop TO shop_checkout;
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT')
  AS can_connect;
-- true
```

The service can now open a connection, provided its password, host rules and network settings are valid. Test that in a second terminal:

```bash
psql --host localhost --username checkout_app --dbname shop --password \
  --command 'SELECT current_user, current_database();'
```

Use the actual server host if it is remote. Expect `checkout_app` and `shop`. Authentication checks the login's identity; `CONNECT` authorizes entry to this database. Neither gives it permission to read the order table.

Keep the administrator session open. **Run the following blocks there, in order.** Each test switches to `checkout_app` and then resets to the administrator before the next grant. Run statements individually in `psql` autocommit mode, except where an explicit transaction is shown. Expected errors then do not prevent the next test.

## Let the connected role find the sales schema

Try the first real task: reading orders.

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for schema sales
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

PostgreSQL knows which table the query names, but the login lacks `USAGE` on its schema. Add that permission, then repeat the same query:

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;

SET ROLE checkout_app;
-- Expect error: permission denied for table orders
SELECT id, customer_name, total FROM sales.orders;
RESET ROLE;
```

The changed error is progress. The role can now look up objects in `sales`, but it still cannot read their data. Schema `USAGE` and table `SELECT` answer different questions, as shown below.

<img src="/blogs/tutorial/assets/postgresql-access-control/query-access.svg" alt="A checkout query needs database CONNECT, schema USAGE and table SELECT. If row-level security is enabled later, its policy filters the returned rows." width="640" height="462">

We did not grant schema `CREATE`. Checkout needs to use the existing tables, while creating tables remains the owner's job. PostgreSQL's [schema documentation](https://www.postgresql.org/docs/18/ddl-schemas.html) covers this distinction and how schema search paths resolve names.

## Let the role read orders

Now grant the permission named by the latest error:

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
SELECT id, customer_name, total FROM sales.orders ORDER BY id;
RESET ROLE;
```

The query returns Asha's order and Ravi's order. The role has accumulated a complete read path: it may connect to `shop`, look up objects in `sales`, and select from `sales.orders`.

At this point, its granted data access is **read-only**. We have not created a second reader account or switched examples; this is the same checkout role before we give it write responsibilities. A service whose whole job was reporting could stop at this stage.

This also explains why `GRANT ALL PRIVILEGES ON DATABASE shop` would not have fixed the table error. `ALL` applies to the named object type, not every object contained inside it. The [GRANT reference](https://www.postgresql.org/docs/18/sql-grant.html) lists the separate database, schema and table privileges.

## Allow order creation, then supply the generated ID

Reading works. The next checkout task is placing an order for Meera:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

Add `INSERT` for the three fields the service should supply. PostgreSQL will supply the ID and initial status through their defaults:

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

The insert now reaches the ID generator. Our `bigserial` column uses a sequence, `sales.orders_id_seq`, whose next value becomes the new ID. Table `INSERT` does not automatically grant access to that sequence.

Grant sequence `USAGE` and try the same insert once more:

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;

SET ROLE checkout_app;
INSERT INTO sales.orders (tenant_id, customer_name, total)
VALUES ('11111111-1111-1111-1111-111111111111', 'Meera', 500.00)
RETURNING id, status;
RESET ROLE;
```

This attempt succeeds and returns the generated ID with `pending` status. The earlier failures did not create an order. Sequence values can nevertheless have gaps, so applications should use the returned ID instead of predicting it.

The sequence permission here is specific to a `bigserial`/`nextval()` design; in our tests, inserts into identity columns did not need it, as the [sequence troubleshooting section](#error%3A-permission-denied-for-sequence-orders_id_seq) shows. The earlier `SELECT` grant also matters because `RETURNING` reads the inserted row's ID and status.

**The role can now read and create orders.** It still cannot change an existing order.

## Allow status updates without allowing price changes

Once a payment is confirmed, checkout needs to mark the order as paid. Try that on Asha's seeded order, whose ID is `1` in this fresh database:

```sql
SET ROLE checkout_app;
-- Expect error: permission denied for table orders
UPDATE sales.orders SET status = 'paid' WHERE id = 1;
RESET ROLE;
```

The service needs `UPDATE`, but only for `status`. Grant that column and repeat the operation:

```sql
GRANT UPDATE (status) ON TABLE sales.orders TO shop_checkout;

SET ROLE checkout_app;
UPDATE sales.orders SET status = 'paid' WHERE id = 1
RETURNING id, status;
RESET ROLE;
```

The returned status is now `paid`. The existing `SELECT` permission allows the query to read `id` in its filter and return the result. A table-wide `UPDATE` grant would allow changing other columns too, so we intentionally keep this grant narrow.

Check the limits while the intended behavior is fresh:

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

The role can advance an order's status, but these attempts fail. Permission to update a column does not restrict the business meaning of each transition: this simple example allows any value accepted by the status constraint. A production workflow still needs [rules for valid payment and shipping transitions](/blog/business-logic-auth-middleware/).

## Extend the same role when the workflow gains an event table

The service can update an order, but now we want a record of that change. A migration adds `sales.order_events`; checkout must read those events and append new ones.

Create the table under the same owner:

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

Access to `orders` did not spread to `order_events`. Grant this new task explicitly:

```sql
GRANT SELECT, INSERT ON TABLE sales.order_events TO shop_checkout;

SET ROLE checkout_app;
SELECT * FROM sales.order_events;
RESET ROLE;
```

The query succeeds with zero rows. The role now has what it needs for the complete order-and-event workflow. Event rows do not generate their own IDs, so this table adds no sequence permission. We also leave `UPDATE` and `DELETE` on the event table ungranted.

If every future table in `sales` is approved for checkout to read, we can make that one permission automatic:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
```

This is a deliberate schema-wide read policy. Skip it if future tables may contain data checkout should not see, and continue granting tables individually. New write permissions remain explicit either way.

<img src="/blogs/tutorial/assets/postgresql-access-control/default-privileges.svg" alt="An explicit grant gives checkout access to existing tables. A default SELECT grant applies to future sales tables created by shop_owner." width="640" height="530">

Defaults affect future objects only; they would not have repaired the existing event table. They also belong to the **creating role**. Migrations must create objects as `shop_owner` for these defaults to apply, using `SET ROLE shop_owner` from an appropriately authorized migration identity. Simply belonging to the owner role is insufficient if the migration creates objects under its own name. See [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html).

## Limit the completed workflow to the current tenant

Our permissions now describe what checkout may do. They still allow it to read orders belonging to both shops in the sample data. If one service handles multiple tenants, we need to describe which rows it may use as well.

**Row-level security (RLS)** filters operations that table privileges already allow. In the example, Asha and Meera belong to tenant A, while Ravi belongs to tenant B. With tenant A selected, checkout should see only Asha and Meera.

<img src="/blogs/tutorial/assets/postgresql-access-control/tenant-row-policy.svg" alt="Checkout with tenant A context sees Asha and Meera, while Ravi's tenant B row is excluded. New rows must also match tenant A." width="640" height="494">

As the owner, add a policy for the order table:

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

`USING` decides which existing rows the operation can see or target. `WITH CHECK` validates the new row produced by an insert or update. A missing or empty tenant setting does not match a row; an invalid UUID raises an error.

The event table needs a policy too. Otherwise, a service denied another tenant's orders could still read their events. Here an event is accessible only if its parent order is visible through the order policy:

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

These policies do not add privileges. `FOR ALL` does not give checkout `DELETE`, for example; that operation still lacks its table grant. PostgreSQL's [policy reference](https://www.postgresql.org/docs/18/sql-createpolicy.html) explains how policies work alongside ordinary permissions.

The application must derive tenant context from authenticated server-side identity. A shared login that can execute arbitrary SQL can change `app.tenant_id` itself, so the setting is **trusted application context, not proof of identity**. This pattern protects against accidentally omitted tenant filters; it does not make a compromised shared database credential tenant-safe.

Table owners normally bypass RLS, as do superusers and roles with `BYPASSRLS`. That is why we have kept checkout separate from the owner and test as the actual runtime role. [The RLS guide](https://www.postgresql.org/docs/18/ddl-rowsecurity.html) describes these exceptions, owner enforcement with `FORCE ROW LEVEL SECURITY`, and operations such as `TRUNCATE` that policies do not filter.

## Run the complete checkout task with the accumulated permissions

We can now use all the permissions together: find Asha's order, update its status and append an event. No extra grant should be needed for this transaction:

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

The update and event insert commit together. [Kafgres, a Kafka-compatible broker inside PostgreSQL](/news/kafgres-kafka-broker-postgres-700mbs/), applies the same pairing of a row and its event to Kafka clients. If either fails, the application should roll back the transaction so that the status change is not saved without its event. This demonstration is not a complete payment implementation: retry handling, [duplicate-event prevention](/blog/distributed-locks-redis/) and payment verification need their own application rules.

`SET LOCAL` keeps tenant context within this transaction. With connection pooling, set it for each request and execute that request's queries on the same connection. Application code can bind the tenant value with `SELECT set_config('app.tenant_id', $1, true)` instead of building SQL strings.

Test the other tenant too:

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

The role is now sufficient for the task, while its limits are visible in actual queries.

## Review what the role gained, and remove what it no longer needs

Here is the final permission set we built, in the same order as the workflow:

| Permission added | Capability it unlocked |
| --- | --- |
| Database `CONNECT` | Open a shop connection |
| Schema `USAGE` | Find objects inside `sales` |
| `SELECT` on orders | Read orders and use values in filters and returned results |
| Column `INSERT` on orders | Supply the permitted fields for a new order |
| Sequence `USAGE` | Generate the new order's ID |
| Column `UPDATE` on status | Mark an existing order as paid |
| `SELECT, INSERT` on events | Read and append order events |
| Optional default `SELECT` | Read future approved tables created by the owner |
| RLS policies | Restrict permitted operations to the selected tenant's orders and events |

When something fails later, check the permission for that operation rather than adding `ALL`. PostgreSQL's [privilege inspection functions](https://www.postgresql.org/docs/18/functions-info.html) let us ask about the effective login permissions:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect;
SELECT has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema;
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE')
  AS can_generate_id;
```

Each returns `true`. Notice the column-specific check for status: a table-wide `UPDATE` check would return `false`. If all the grants are correct but rows are missing, inspect tenant context and policies next.

Suppose a dedicated payment service takes over status updates. We can remove that capability without dismantling the rest of checkout's permissions:

```sql
REVOKE UPDATE (status) ON TABLE sales.orders FROM shop_checkout;
SELECT has_column_privilege('checkout_app', 'sales.orders', 'status', 'UPDATE')
  AS can_update_status;
-- false
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
-- true
```

Privileges are additive, so revoking one grant does not cancel access supplied by another membership, a direct grant, ownership or `PUBLIC`. Verify the result rather than treating `REVOKE` as an explicit deny. The [REVOKE documentation](https://www.postgresql.org/docs/18/sql-revoke.html) covers those other access paths.

## `ERROR:  permission denied for table orders`

The tutorial met this error several times. It is the most common PostgreSQL permission error, and the message is the same whichever operation was refused:

```text
ERROR:  permission denied for table orders
```

**Why it happens.** The role reached the table but holds no privilege for this operation. A `SELECT`, `INSERT`, `UPDATE` or `DELETE` each needs its own grant, and the message names the table, not the missing privilege. Read the failed statement to see which one is needed.

**Fix.** Grant the operation, preferably to the group role:

```sql
GRANT SELECT ON TABLE sales.orders TO shop_checkout;
```

For writes, grant only the columns the service supplies, as the tutorial did with `GRANT INSERT (tenant_id, customer_name, total)` and `GRANT UPDATE (status)`. An `INSERT ... RETURNING` or an `UPDATE ... WHERE` also reads values, so it needs `SELECT` on those columns too. In our test, a role with only `UPDATE (qty)` could run `UPDATE stock SET qty = 4` but received the table error once the statement added `WHERE sku = 'A'`.

**Confirm.** Ask PostgreSQL about the login, then repeat the statement as that login:

```sql
SELECT has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read;
-- t
```

**Common trap: the schema fails first.** PostgreSQL checks schema `USAGE` while it resolves the name, before it looks at table privileges. Without `USAGE` on `sales`, a schema-qualified query reports `ERROR:  permission denied for schema sales` instead. An unqualified query that relies on `search_path` fails differently, because PostgreSQL skips schemas the role cannot use:

```text
ERROR:  relation "orders" does not exist
```

The table exists; the role cannot see into its schema. Grant schema `USAGE` first, as in [the schema section](#error%3A-permission-denied-for-schema-sales). Granting `ALL PRIVILEGES ON DATABASE shop` does not help either: in our test the same table error remained, because database privileges do not reach the tables inside it.

PostgreSQL 10 reported this error as `ERROR:  permission denied for relation secret`. The versions tested for this guide, 13 through 17, say `table`.

### Zero rows without an error is row-level security

If a query succeeds but returns fewer rows than expected, or none, the role is not missing a grant. Row-level security filters the rows that a permitted query can see. In the tutorial schema, checkout with no tenant setting counts zero orders, and the same query inside a transaction with `SET LOCAL app.tenant_id` counts that tenant's orders:

```sql
SET ROLE checkout_app;
SELECT count(*) AS visible_orders FROM sales.orders;
-- 0
RESET ROLE;
```

Check whether the table has RLS enabled and which policies apply:

```sql
SELECT relname, relrowsecurity FROM pg_class WHERE oid = 'sales.orders'::regclass;
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'orders';
```

Then inspect the setting or identity the policy reads. A role with no matching policy sees no rows at all once RLS is enabled.

## `ERROR:  permission denied for sequence orders_id_seq`

An insert into a table with a `serial` or `bigserial` key can fail even after the role has `INSERT` on the table:

```text
ERROR:  permission denied for sequence orders_id_seq
```

**Why it happens.** The default of a `bigserial` column calls `nextval()` on its sequence, here `sales.orders_id_seq`. Calling `nextval()` needs `USAGE` on that sequence, and table `INSERT` does not include it.

**Fix.** Grant `USAGE` on the sequence, or on every existing sequence in the schema:

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO shop_checkout;
-- or, for every sequence that already exists in the schema:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sales TO shop_checkout;
```

`USAGE` alone was enough for the insert and for `currval()` in our tests. `SELECT` alone was not: the insert still failed with the same error.

**Confirm.**

```sql
SELECT has_sequence_privilege('checkout_app', 'sales.orders_id_seq', 'USAGE') AS can_generate_id;
-- t
```

**Identity columns behave differently.** We repeated the test with `id bigint GENERATED ALWAYS AS IDENTITY` and with `GENERATED BY DEFAULT AS IDENTITY`. On PostgreSQL 14, 16 and 17, a role with only table `INSERT` could insert rows, although `has_sequence_privilege` reported `false` for the identity sequence. Calling `nextval()` on `sales.payments_id_seq` directly as that role still failed with `ERROR:  permission denied for sequence payments_id_seq`. So the sequence grant is needed for `serial` and `bigserial` columns, but not for inserts into identity columns.

**Common trap.** `ON ALL SEQUENCES IN SCHEMA` covers sequences that exist when it runs. A table created by the next migration brings a new sequence; cover it with default privileges, shown in [the section on new tables](#new-tables-are-not-accessible-to-the-role).

## `ERROR:  permission denied for schema sales`

```text
ERROR:  permission denied for schema sales
```

**Why it happens.** The role lacks a schema privilege. The same message covers two different operations:

- **Using objects** in the schema needs `USAGE`. Without it, any statement that names `sales.orders` fails here, as shown in the tutorial.
- **Creating objects** in the schema needs `CREATE`. Our checkout role, which has `USAGE` only, received this error for `CREATE TABLE sales.scratch (id int)`.

**Fix.** Grant `USAGE` to roles that use the tables. Grant `CREATE` only to the role that runs migrations:

```sql
GRANT USAGE ON SCHEMA sales TO shop_checkout;
GRANT USAGE, CREATE ON SCHEMA sales TO migrator;
```

`CREATE` does not include `USAGE`. A migration role granted only `CREATE` received this same error when its `ALTER TABLE` named the existing `sales.orders`.

**Confirm.**

```sql
SELECT has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_schema_privilege('checkout_app', 'sales', 'CREATE') AS can_create_in_schema;
-- t | f
```

**The `public` schema changed in PostgreSQL 15.** In PostgreSQL 14 and earlier, every role could create objects in the `public` schema of a new database. From PostgreSQL 15, new databases no longer grant that `CREATE` to everyone. In our test, an ordinary login ran `CREATE TABLE public.notes (body text)` successfully on 14 and received `ERROR:  permission denied for schema public` on 15, 16 and 17. `\dn+ public` shows the change: `=UC/postgres` on 14, `=U/pg_database_owner` from 15. Code that relied on creating tables in `public` needs a schema of its own or an explicit grant.

## `FATAL:  permission denied for database "shop"`

This error appears while connecting, before any query runs:

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "shop"
DETAIL:  User does not have CONNECT privilege.
```

**Why it happens.** Authentication succeeded, but the role has no `CONNECT` privilege on this database. New databases grant `CONNECT` to `PUBLIC`, which is why most roles never see this. The tutorial revoked that default, so each role needs its own grant.

**Fix.**

```sql
GRANT CONNECT ON DATABASE shop TO shop_checkout;
```

**Confirm.** Check the privilege and connect again as the login:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect;
-- t
```

**Common trap.** `CONNECT` is only entry. The role still needs schema `USAGE` and table privileges before a query can read data.

### `no pg_hba.conf entry` is an authentication problem

A different connection error has nothing to do with `GRANT`:

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  no pg_hba.conf entry for host "127.0.0.1", user "checkout_app", database "shop", no encryption
```

The server refused the connection before checking database privileges, because no line in `pg_hba.conf` matches this host, user, database and connection type. Granting privileges cannot fix it. Add a matching rule to `pg_hba.conf`, or the managed service's equivalent network and authentication settings, and reload the configuration.

### `ERROR:  permission denied to create database`

```text
ERROR:  permission denied to create database
```

Creating a database is a role attribute, not a grant on an object. The checkout login was created with `NOCREATEDB`, so `CREATE DATABASE` fails. An administrator can add the attribute:

```sql
ALTER ROLE checkout_app CREATEDB;
```

In our test the same `CREATE DATABASE` then succeeded. Before adding it, ask whether the application should create databases at all. Provisioning is usually a job for an administrator or a deployment identity, and an application login rarely needs it.

## `ERROR:  must be owner of table orders`

```text
ERROR:  must be owner of table orders
```

**Why it happens.** Changing or dropping a table is reserved for its owner. Table privileges such as `SELECT` or `UPDATE` cover data operations; no grant allows `ALTER TABLE` or `DROP TABLE` for a role that does not own the table. In the tutorial, `shop_owner` owns `sales.orders`, so checkout's `ALTER TABLE` fails here.

**Fix: run the change as the owner.** Give the migration login membership in the owning role. In PostgreSQL 16 and later, the `INHERIT` and `SET` options are explicit:

```sql
GRANT shop_owner TO migrator WITH INHERIT TRUE, SET TRUE;
-- PostgreSQL 14 and 15 reject those options; use:
-- GRANT shop_owner TO migrator;
```

With that membership, `migrator` could run `ALTER TABLE sales.orders ADD COLUMN internal_note text` in our tests on 14, 16 and 17.

**Fix: transfer ownership.** An administrator can hand the table to the role that should own it:

```sql
ALTER TABLE sales.coupons OWNER TO shop_owner;
```

A role without that ownership receives the same `must be owner` error when it tries `ALTER TABLE ... OWNER TO`.

**Confirm.**

```sql
SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'sales';
```

**Common trap.** Membership lets `migrator` alter tables that `shop_owner` owns, but a table that `migrator` creates under its own name is owned by `migrator`. That table then misses default privileges defined for `shop_owner`, which the next section shows.

## New tables are not accessible to the role

The role can read the tables that existed when it was set up, then a migration adds a table and the role receives `ERROR:  permission denied for table shipments`.

**Why it happens.** `GRANT ... ON ALL TABLES IN SCHEMA sales` is a one-time grant on the tables that exist when it runs. In our test, a table created after that statement stayed unreadable:

```sql
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO shop_checkout;
SET ROLE shop_owner;
CREATE TABLE sales.shipments (order_id bigint NOT NULL, carrier text);
RESET ROLE;
SET ROLE checkout_app;
-- Expect error: permission denied for table shipments
SELECT * FROM sales.shipments;
RESET ROLE;
```

**Fix.** Grant the existing table explicitly, then define default privileges for objects created from now on:

```sql
GRANT SELECT ON TABLE sales.shipments TO shop_checkout;

ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO shop_checkout;
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE ON SEQUENCES TO shop_checkout;
```

After these defaults, checkout could read a new `bigserial` table created by `shop_owner` and held `USAGE` on its sequence, with no further grant.

**Confirm.** `\ddp` lists default privileges by creating role:

```text
                  Default access privileges
   Owner    | Schema |   Type   |     Access privileges
------------+--------+----------+----------------------------
 shop_owner | sales  | sequence | shop_checkout=U/shop_owner
 shop_owner | sales  | table    | shop_checkout=r/shop_owner
```

**Common trap: defaults belong to the creating role.** `FOR ROLE shop_owner` applies only to objects that `shop_owner` creates later. Without `FOR ROLE`, the defaults apply to objects created by the role that runs the statement. In our test, `migrator`, a member of `shop_owner`, created `sales.returns` under its own name; the table was owned by `migrator`, and checkout received `ERROR:  permission denied for table returns`. The same migration with `SET ROLE shop_owner` before `CREATE TABLE` produced a table checkout could read. Make migrations create objects as the owning role, or define defaults for the role that actually creates them.

## How to check existing privileges in PostgreSQL

PostgreSQL has no `SHOW GRANTS` statement. Running MySQL's form returns `ERROR:  syntax error at or near "FOR"`. Use `psql` meta-commands, the information schema, or the privilege functions instead. The examples below come from the tutorial database after the troubleshooting tests.

### psql meta-commands

`\dp` and its alias `\z` list table, view and sequence privileges, column privileges and row-level security policies:

```text
\dp sales.orders
 Schema |  Name  | Type  |       Access privileges        |      Column privileges       | Policies
--------+--------+-------+--------------------------------+------------------------------+----------
 sales  | orders | table | shop_owner=arwdDxtm/shop_owner+| tenant_id:                  +| checkout_orders: ...
        |        |       | shop_checkout=r/shop_owner     |   shop_checkout=a/shop_owner+|
```

Each entry reads `grantee=privileges/grantor`. Here `shop_checkout=r` is `SELECT`, and `a` in the column list is column `INSERT`. PostgreSQL 17 adds `m` for the new `MAINTAIN` privilege, so the owner shows `arwdDxtm` on 17 and `arwdDxt` on 14 and 16. The policy text is shortened here.

Other useful commands:

- `\du` lists roles and their attributes. In psql 14 and 15 it also shows a "Member of" column. From psql 16 that column is gone and `\drg` lists memberships with their `INHERIT` and `SET` options.
- `\l shop` shows database privileges, such as `shop_checkout=c/shop_owner` for `CONNECT`.
- `\dn+ sales` shows schema privileges, such as `shop_checkout=U/shop_owner` for `USAGE`.
- `\ddp` shows default privileges for future objects.

### Query role_table_grants in the information schema

The information schema returns grants as rows, which suits scripts and reviews:

```sql
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee IN ('shop_checkout', 'checkout_app')
  AND table_schema = 'sales'
ORDER BY grantee, table_name, privilege_type;
```

It lists grants made directly to each role. In our database every row belonged to `shop_checkout`; the login `checkout_app` had none of its own, because it inherits through membership. Column-level grants appear in the information schema's `column_privileges` view instead.

### Privilege functions

To ask what a login can actually do, including inherited privileges, use the `has_*_privilege` functions:

```sql
SELECT has_database_privilege('checkout_app', 'shop', 'CONNECT') AS can_connect,
       has_schema_privilege('checkout_app', 'sales', 'USAGE') AS can_use_schema,
       has_table_privilege('checkout_app', 'sales.orders', 'SELECT') AS can_read_orders;
```

To list everything one role can do on one table:

```sql
SELECT p.privilege,
       has_table_privilege('checkout_app', 'sales.orders', p.privilege) AS granted
FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS p(privilege);
```

Read column grants with care. Checkout holds `INSERT` on three columns of `sales.orders`, so the table-level check returns `false` while the column checks return `true`:

```sql
SELECT has_table_privilege('checkout_app', 'sales.orders', 'INSERT') AS table_insert,
       has_any_column_privilege('checkout_app', 'sales.orders', 'INSERT') AS any_column_insert,
       has_column_privilege('checkout_app', 'sales.orders', 'total', 'INSERT') AS total_insert;
-- f | t | t
```

## Least-privilege PostgreSQL role checklist

The tutorial reached its permission set one failure at a time. As a checklist for the next service role:

- **Separate the job from the login.** Grant permissions to a `NOLOGIN` role such as `shop_checkout` and give the service login membership, so a replacement login inherits the same access.
- **Allow entry to one database.** Grant `CONNECT` on the databases the service uses, and revoke the `PUBLIC` default where other roles should not connect.
- **Use schemas without creating in them.** Grant `USAGE`; keep `CREATE` with the role that runs migrations.
- **Grant table privileges per operation.** Use column lists for `INSERT` and `UPDATE` where only some fields belong to the service, and remember that `RETURNING` and `WHERE` need `SELECT`.
- **Add sequence `USAGE` for `serial` keys.** Inserts into identity columns did not need it in our tests.
- **Set default privileges for the creating role.** Use `ALTER DEFAULT PRIVILEGES FOR ROLE` the migration owner, and only for access every future table should grant.
- **Keep rows within the tenant.** Add row-level security policies, and keep the application role separate from the table owner and without `BYPASSRLS`.
- **Revoke what is no longer used and verify it.** Check with the `has_*_privilege` functions, since another membership or `PUBLIC` can still supply access.

For broad read-only or write-only roles, PostgreSQL 14 added the predefined roles `pg_read_all_data` and `pg_write_all_data`; PostgreSQL 13 does not have them. They suit reporting or loading jobs, not a service role that needs specific tables. In our test, row-level security still applied to their members, and a `pg_write_all_data` member could insert into a `bigserial` table but not run `INSERT ... RETURNING`, because it has no `SELECT`.

## Stop granting when the domain task works

The checkout role began with no access to the shop database. We added a connection, schema access, reads, narrowly scoped writes and the permissions needed by the event table. Each addition answered a specific failure in the same order workflow.

That gives us a practical way to maintain access control: write down the task, grant the operation it requires, test it as the service login, and keep a test for something it must not do. Store these grants and policies alongside the migrations that introduce the objects.

A useful application role is not the role with the most privileges. It is the one that can complete its domain's work with an understandable reason for every permission it holds.
