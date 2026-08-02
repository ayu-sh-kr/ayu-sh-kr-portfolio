# PostgreSQL access control: a practical guide to roles and permissions

Access control in PostgreSQL is the set of rules that answers a simple question: *who is allowed to do what?* A database can hold customer details, payroll records, application data, and internal reports side by side. The goal is to let each person or service do its job without giving it a master key to everything else.

PostgreSQL gives us the building blocks to do that well. The terminology can look intimidating at first, but the underlying model is refreshingly small: roles represent identities, privileges describe allowed actions, and ownership controls who manages an object. Once those ideas click, permission errors become much easier to understand and permission designs become far less fragile.

## Start with the route to a table

Suppose an application needs to read `sales.orders`. Reading a table is not one permission check. PostgreSQL follows the path to the table:

1. The role must be able to connect to the database.
2. The role must be allowed to use the `sales` schema.
3. The role must be allowed to select from the `orders` table.
4. If row-level security is enabled, the requested rows must also match its policy.

This layered approach is deliberate. A schema is a namespace, similar to a folder, and a table belongs inside one. Access at one layer does not automatically bypass another. When PostgreSQL says “permission denied,” it is usually pointing to one missing link in this chain.

## Roles are PostgreSQL's idea of identity

Everything begins with a **role**. A role is an identity that can own database objects and receive permissions. PostgreSQL does not have separate underlying objects for users and groups; both are roles with different attributes and purposes.

A role with `LOGIN` is what people usually call a **user**. It can authenticate and start a session:

```sql
CREATE ROLE reporting_app LOGIN PASSWORD 'use-a-secret-manager-in-production';
```

Creating this role does not grant access to any application data. It only gives PostgreSQL someone to recognize when a connection arrives.

A role without `LOGIN` is often used as a **group role**. It cannot sign in, but it can hold a useful bundle of permissions:

```sql
CREATE ROLE reporting_reader NOLOGIN;
GRANT reporting_reader TO reporting_app;
```

In this example, `reporting_reader` expresses a job: “may read reporting data.” `reporting_app` is the actual login used by the application. The login can use the privileges it inherits from the group role.

That separation is the foundation of a maintainable setup. Permissions belong to job-shaped roles; individual people and services become members of those roles. When a new analyst joins, add them to the appropriate role. When their responsibility changes, move their membership instead of hunting through dozens of individual grants.

## Role attributes and object privileges are different things

It helps to keep two kinds of permission apart.

**Role attributes** describe what a role can do at the PostgreSQL server level. `LOGIN` permits authentication. `CREATEDB` permits creating databases. `CREATEROLE` permits managing other roles. `REPLICATION` is for replication connections. `SUPERUSER` bypasses normal permission checks and should be reserved for tightly controlled administration.

**Object privileges** describe what a role can do to a particular database object. `SELECT` on `sales.orders`, for example, means the role can read that table. A role can be a perfectly ordinary login and still have exactly the data access needed for its work.

This distinction is useful because everyday application access should almost always be expressed with object privileges, not powerful server-wide attributes.

## Privileges are verbs attached to objects

Privileges are best read as verbs: they name the action a role may take. PostgreSQL supports different verbs for different kinds of objects.

### Database privileges

At the database level, `CONNECT` allows a role to open a session to that database. `CREATE` allows it to create schemas there, and `TEMP` (or `TEMPORARY`) allows temporary tables during a session.

```sql
GRANT CONNECT ON DATABASE shop TO reporting_app;
GRANT TEMP ON DATABASE shop TO reporting_app;
```

In many installations, `PUBLIC`—the implicit group containing every role—has `CONNECT` and `TEMP` by default. That is convenient, but it is worth checking rather than assuming. A private database may deliberately revoke those defaults and grant them only to approved roles.

### Schema privileges

A schema groups objects such as tables, views, sequences, and functions. `USAGE` lets a role refer to objects in the schema when it already has the needed privilege on those objects. It does **not** grant access to every table inside the schema. `CREATE` lets the role create new objects there.

```sql
GRANT USAGE ON SCHEMA sales TO reporting_reader;
GRANT SELECT ON TABLE sales.orders TO reporting_reader;
```

Both grants matter. `SELECT` says the reader may read `orders`; `USAGE` says it may reach that table through the `sales` schema. `CREATE` should be handed out more carefully, especially on shared schemas, because object creation can affect how other queries resolve names.

### Table privileges

Table privileges control access to stored rows:

- `SELECT` reads rows.
- `INSERT` adds rows.
- `UPDATE` changes existing rows.
- `DELETE` removes rows.
- `TRUNCATE` quickly removes all rows from a table.
- `REFERENCES` allows foreign keys to reference the table.
- `TRIGGER` allows creation of triggers on the table.

You can grant only the verbs a role needs. A reporting role may receive `SELECT` only. A data-entry service may need `SELECT` and `INSERT`, but no `DELETE`. PostgreSQL also supports column-level grants when only a few columns should be writable, although a view is often a clearer interface when the access rule is more involved.

```sql
GRANT SELECT, INSERT ON TABLE sales.orders TO order_writer;
GRANT UPDATE (shipping_address) ON TABLE sales.orders TO order_writer;
```

### Sequences, functions, and other objects

Tables are not the only objects behind an application workflow. A sequence that supplies generated IDs commonly needs `USAGE` for a role that inserts rows. Functions need `EXECUTE` before a role can call them. Custom types, foreign servers, and large objects have their own supported privileges too.

```sql
GRANT USAGE ON SEQUENCE sales.orders_id_seq TO order_writer;
GRANT EXECUTE ON FUNCTION sales.create_order(text, numeric) TO order_writer;
```

This explains a common surprise: an `INSERT` grant can still fail because the insert also calls a sequence, a function, or accesses another object that has not been granted.

## Ownership is control, not a role to share

Every database object has an owner, usually the role that created it. Owners can alter or drop their own objects and can grant access to them. Ownership is powerful; it is not merely another read or write privilege.

For applications, a useful pattern is to keep an **owner role** separate from runtime roles. A deployment or migration role owns schemas and tables. The application uses a more limited login role that has only the required grants. If an application credential is compromised, it cannot quietly change table definitions or grant itself more access.

```sql
CREATE ROLE shop_owner NOLOGIN;
CREATE ROLE shop_api LOGIN;

ALTER SCHEMA sales OWNER TO shop_owner;
GRANT USAGE ON SCHEMA sales TO shop_api;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA sales TO shop_api;
```

In real projects, the migration process should create new tables as the owner role. Otherwise, a developer or deployment identity may unexpectedly become the owner, and future grants become harder to reason about.

## `PUBLIC` is everyone

`PUBLIC` looks like a role, but it is a special built-in group that includes every role. A grant to `PUBLIC` therefore applies broadly, including to roles created later.

That makes `PUBLIC` useful for deliberately open capabilities, but risky for confidential data. When reviewing a database, look for grants to `PUBLIC` on databases, schemas, functions, and tables. A carefully limited role can still have broad access through this implicit membership.

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON TABLE sales.customer_notes FROM PUBLIC;
```

The `public` schema and the `PUBLIC` group have similar names but are different things: one is a namespace, the other is an all-roles group.

## A small, realistic role design

Imagine an online store with staff, a reporting tool, and a web application. Instead of granting permissions directly to each login, define the responsibilities first:

```sql
CREATE ROLE store_readonly NOLOGIN;
CREATE ROLE store_orders_writer NOLOGIN;
CREATE ROLE store_admin NOLOGIN;

GRANT USAGE ON SCHEMA sales TO store_readonly, store_orders_writer;
GRANT SELECT ON ALL TABLES IN SCHEMA sales TO store_readonly;
GRANT SELECT, INSERT, UPDATE ON TABLE sales.orders TO store_orders_writer;
GRANT USAGE, SELECT ON SEQUENCE sales.orders_id_seq TO store_orders_writer;

GRANT store_readonly TO reporting_app;
GRANT store_orders_writer TO checkout_api;
GRANT store_admin TO database_administrator;
```

The exact names are unimportant. The important part is that each role describes a responsibility, and the login identities receive one or more appropriate responsibilities. The administrator role should still be designed cautiously; being an administrator inside an application domain is very different from being a PostgreSQL superuser.

## New tables need a plan too

`GRANT ... ON ALL TABLES IN SCHEMA ...` affects tables that exist at the time the command runs. It does not automatically grant access to tables created next month. That gap is a frequent cause of post-deployment outages.

Use default privileges so that objects created by a particular owner carry the expected grants from the start:

```sql
ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT SELECT ON TABLES TO store_readonly;

ALTER DEFAULT PRIVILEGES FOR ROLE shop_owner IN SCHEMA sales
  GRANT USAGE, SELECT ON SEQUENCES TO store_orders_writer;
```

Default privileges are tied to the role that creates the object. If migrations run as a different role, configure that role as well—or standardize the migration owner. A one-time grant is still needed for existing objects.

## Row-level security adds rules within a table

Normal table privileges answer “may this role read this table?” **Row-level security** (RLS) adds a narrower question: “which rows in this table may this role read or change?”

For a multi-tenant table, an API role may have `SELECT` on `sales.orders`, while an RLS policy permits it to see only rows for the current tenant. This is valuable defense in depth: a query missing its tenant filter does not automatically expose every tenant’s data.

```sql
ALTER TABLE sales.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY orders_are_tenant_scoped ON sales.orders
  FOR SELECT
  TO shop_api
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

RLS deserves careful application design. The application must set tenant context safely for each request, policies need tests, and table owners can normally bypass RLS unless it is forced. It is a precise tool for row-based isolation, not a substitute for basic role and table grants.

## Functions and views can offer a safer interface

Sometimes users need to complete a task without being able to browse or modify the underlying tables freely. A view can expose only approved columns and rows. A function can package a controlled operation, such as submitting an order, and callers can receive only `EXECUTE` on that function.

This can make permissions easier to understand because the database exposes an intentional interface rather than its full internal structure. However, functions that run with an owner's privileges (`SECURITY DEFINER`) need special care: set a safe `search_path`, tightly control who can execute them, and keep the function small and reviewed. Used casually, they can accidentally become a privilege-escalation path.

## A practical checklist

Good PostgreSQL access control is less about collecting every available keyword and more about establishing a few durable habits:

- Give each human and application its own login role; do not share credentials.
- Grant access to non-login group roles, then make login roles members of them.
- Grant the narrowest useful actions on the narrowest useful objects.
- Separate object ownership and migrations from day-to-day application logins.
- Review grants to `PUBLIC`, especially on shared schemas and sensitive objects.
- Configure default privileges for newly created tables and sequences.
- Use RLS when data isolation depends on which rows a caller may see.
- Periodically review memberships, owners, and grants as the system changes.

The result is not a maze of permissions. It is a clear statement of responsibility: who may connect, what part of the database they may reach, what actions they may take, and what data they may see. That clarity is the real value of PostgreSQL's access-control model.
