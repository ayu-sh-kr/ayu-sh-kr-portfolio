# PostgreSQL Permissions: Build a Role with GRANT and REVOKE

A checkout service needs to read orders, create new ones, mark them as paid and record what happened. It does not need permission to delete the order history or change the database structure. How do we give it enough access to finish its work without making it the database owner?

We will build that role from an empty starting point. At first, it cannot even connect to the shop database. Each section adds one capability, repeats the operation that needed it, and explains the result. The same checkout login, tables and orders continue through the whole guide.

By the end, the service will complete a payment update and write its event in one transaction. Along the way, we will see why `CONNECT`, schema `USAGE`, table privileges and sequence privileges are separate, how new tables get permissions, and where row-level security fits.

*Updated October 8, 2026. Use a disposable PostgreSQL 16+ instance and `psql`. The setup requires a database administrator able to create roles and databases and assume the owner role. Managed services may require different provisioning steps.*

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

![The checkout login inherits permissions from shop_checkout. The separate shop_owner creates and changes objects; the application is not a member of it.](/blogs/tutorial/assets/postgresql-access-control/role-membership.svg)

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

![A checkout query needs database CONNECT, schema USAGE and table SELECT. If row-level security is enabled later, its policy filters the returned rows.](/blogs/tutorial/assets/postgresql-access-control/query-access.svg)

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

The sequence permission here is specific to a `bigserial`/`nextval()` design; identity columns handle implicit sequence access differently. The earlier `SELECT` grant also matters because `RETURNING` reads the inserted row's ID and status.

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

The role can advance an order's status, but these attempts fail. Permission to update a column does not restrict the business meaning of each transition: this simple example allows any value accepted by the status constraint. A production workflow still needs rules for valid payment and shipping transitions.

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

![An explicit grant gives checkout access to existing tables. A default SELECT grant applies to future sales tables created by shop_owner.](/blogs/tutorial/assets/postgresql-access-control/default-privileges.svg)

Defaults affect future objects only; they would not have repaired the existing event table. They also belong to the **creating role**. Migrations must create objects as `shop_owner` for these defaults to apply, using `SET ROLE shop_owner` from an appropriately authorized migration identity. Simply belonging to the owner role is insufficient if the migration creates objects under its own name. See [ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html).

## Limit the completed workflow to the current tenant

Our permissions now describe what checkout may do. They still allow it to read orders belonging to both shops in the sample data. If one service handles multiple tenants, we need to describe which rows it may use as well.

**Row-level security (RLS)** filters operations that table privileges already allow. In the example, Asha and Meera belong to tenant A, while Ravi belongs to tenant B. With tenant A selected, checkout should see only Asha and Meera.

![Checkout with tenant A context sees Asha and Meera, while Ravi's tenant B row is excluded. New rows must also match tenant A.](/blogs/tutorial/assets/postgresql-access-control/tenant-row-policy.svg)

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

The update and event insert commit together. If either fails, the application should roll back the transaction so that the status change is not saved without its event. This demonstration is not a complete payment implementation: retry handling, duplicate-event prevention and payment verification need their own application rules.

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

## Stop granting when the domain task works

The checkout role began with no access to the shop database. We added a connection, schema access, reads, narrowly scoped writes and the permissions needed by the event table. Each addition answered a specific failure in the same order workflow.

That gives us a practical way to maintain access control: write down the task, grant the operation it requires, test it as the service login, and keep a test for something it must not do. Store these grants and policies alongside the migrations that introduce the objects.

A useful application role is not the role with the most privileges. It is the one that can complete its domain's work with an understandable reason for every permission it holds.
