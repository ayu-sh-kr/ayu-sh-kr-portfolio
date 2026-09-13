# Quote intake now writes straight to DynamoDB on-demand

The project quote form receives roughly eleven serious submissions in a typical month. Keeping an RDS instance available for that traffic meant paying continuously for a database whose main job was waiting.

The new path validates the request at the same boundary, writes one bounded item to a DynamoDB on-demand table, and publishes the existing notification after persistence succeeds. There is no connection pool to warm and no schema migration required for the small, stable record.

## Why this shape fits

The access pattern is intentionally narrow: create by generated identifier, retrieve for follow-up, and expire abandoned records after the retention window. There are no joins, ad-hoc reports, or transactions spanning unrelated aggregates. DynamoDB earns its place because the data model already behaves like a key-value document, not because “serverless” is automatically cheaper.

At current traffic the annual storage and request cost is around the price of a coffee. More useful than the saving is the removal of an idle dependency from the public form path. If the workflow grows into reporting or relational coordination, that decision can be revisited with real usage data.
