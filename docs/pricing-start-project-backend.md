# Pricing start-project backend contract

This document describes the data collected by the pricing page's **Start a project** intake.
It is intended as an implementation contract for the backend. The source of truth for the current
browser fields is `src/events/pricing.events.ts`, `src/data/pricing-content.ts`, and the three
branch form components under `src/components/pages/pricing/start-project/`.

## Submission shape

The intake has three mutually exclusive starting points. The browser sends a flat JSON object with
one discriminator:

```text
mode = "spec"  -> existing specification
mode = "idea"  -> early-stage concept
mode = "quote" -> defined scope requiring a proposal
```

The shared fields are present for every mode. Fields belonging to another mode should be ignored
or rejected by the API; they are retained in the browser only so switching modes does not discard
visitor input.

The current frontend does not submit an HTTP request. It prepares a `mailto:` link after browser
validation. The classes below define the payload for a future backend endpoint such as
`POST /api/project-intakes`.

## Kotlin model

The following DTOs deliberately mirror the browser's flat payload. `null` is recommended for
optional values at the API boundary, even though the current browser represents an unfilled text
field as `""`.

```kotlin
import java.util.UUID

data class ProjectAttachment(
    /** Client-side identifier; do not use this as the storage identity. */
    val id: UUID,
    val name: String,
    val size: Long,
    /** Current browser status: `pending`, `uploading`, `uploaded`, or `error`. */
    val status: String,
    /** Temporary object key returned by the upload service. */
    val key: String? = null,
)

/**
 * Request for a project where requirements or tickets already exist.
 * Wire discriminator: `mode: "spec"`.
 */
data class SpecificationProjectRequest(
    val mode: String = "spec",
    val projectName: String,
    val specLink: String? = null,
    val specNotes: String? = null,
    val existing: List<String> = emptyList(),
    val budget: String? = null,
    val timeline: String? = null,
    val files: List<ProjectAttachment> = emptyList(),
    val name: String,
    val email: String,
    val company: String? = null,
    val nextStep: String,
    val needsNda: Boolean = false,
)

/**
 * Request for an early-stage concept whose outcome is understood but whose scope needs definition.
 * Wire discriminator: `mode: "idea"`.
 */
data class IdeaProjectRequest(
    val mode: String = "idea",
    val idea: String,
    val audience: String,
    val success: String,
    val existing: List<String> = emptyList(),
    val budget: String? = null,
    val timeline: String? = null,
    val files: List<ProjectAttachment> = emptyList(),
    val name: String,
    val email: String,
    val company: String? = null,
    val nextStep: String,
    val needsNda: Boolean = false,
)

/**
 * Request for sufficiently defined work that can be priced and scheduled.
 * Wire discriminator: `mode: "quote"`.
 */
data class QuoteProjectRequest(
    val mode: String = "quote",
    val workType: String,
    val scope: String,
    val constraints: String? = null,
    val existing: List<String> = emptyList(),
    val budget: String? = null,
    val timeline: String? = null,
    val files: List<ProjectAttachment> = emptyList(),
    val name: String,
    val email: String,
    val company: String? = null,
    val nextStep: String,
    val needsNda: Boolean = false,
)
```

## Current wire values

These are the values currently rendered by the page. Store stable codes internally if possible and
map these labels at the API boundary.

| Field | Allowed values |
| --- | --- |
| `mode` | `spec`, `idea`, `quote` |
| `existing` | `Nothing yet`, `Designs`, `A prototype`, `Live product`, `An in-house team` |
| `budget` | `Under $3k`, `$3k – $6k`, `$6k – $15k`, `$15k+`, `Monthly retainer`, `Not yet determined` |
| `timeline` | `As soon as possible`, `Within a month`, `1 – 3 months`, `Later this year`, `Exploratory` |
| `nextStep` | `Reply by email`, `20-minute call` |
| `workType` | `An API or service`, `A complete product`, `AWS infrastructure`, `An applied AI feature`, `Other` |

`existing` is multi-select. `Nothing yet` is exclusive: when selected it must be the only value.
`budget`, `timeline`, and `nextStep` are single-value selections.

## Validation rules

At minimum, the API should enforce the following:

- `mode` must be one of `spec`, `idea`, or `quote`.
- `name` and `email` are required. Validate `email` using normal email validation and apply a
  sensible maximum length to all user-entered strings.
- For `spec`, `projectName` is required. `specLink` is optional but, when supplied, must be a URL.
  `specNotes` is optional.
- For `idea`, `idea`, `audience`, and `success` are the three submitted idea fields. The browser
  does not currently mark them required, so the backend should choose whether to accept partial
  briefs or require all three.
- For `quote`, `scope` is the substantive free-text field. `workType` is selected from the current
  work-type list and `constraints` is optional.
- Validate `existing`, `budget`, `timeline`, `nextStep`, and `workType` against server-owned option
  codes rather than trusting display text from the client.
- `needsNda` is a boolean and defaults to `false`.
- Reject attachments whose size exceeds 20 MiB or whose count exceeds 8. The browser applies both
  limits, but the backend must enforce them as well.
- Do not accept an attachment's client-provided `status`, `size`, `name`, or `key` as proof that a
  file is safe or available. Verify that each attachment key belongs to the requesting intake and
  that its upload completed.

## Attachment handoff

The browser currently models this flow:

```text
select file
    -> pending
    -> request temporary upload access
    -> direct upload to object storage
    -> uploaded + storage key
```

The upload methods are placeholders today. A practical backend contract is:

1. `POST /api/project-intakes/uploads` accepts the original filename, byte size, and content type.
2. The response returns a short-lived pre-signed upload URL and an opaque object key.
3. The browser uploads directly to storage and retains the key in `files[].key`.
4. The intake endpoint verifies the key and records the attachment relationship.

Only `uploaded` attachments with a verified key should be included in the final intake. Pending,
uploading, and error records are client progress state and should not become downloadable backend
attachments.

## Example payloads

### Specification

```json
{
  "mode": "spec",
  "projectName": "Orders API v2",
  "specLink": "https://notion.so/example/orders-api-v2",
  "specNotes": "The retry and reconciliation behavior needs review.",
  "existing": ["Live product", "An in-house team"],
  "budget": "$6k – $15k",
  "timeline": "Within a month",
  "files": [],
  "name": "Priya Raghavan",
  "email": "priya@company.com",
  "company": "Northwind Foods",
  "nextStep": "Reply by email",
  "needsNda": false
}
```

### Idea

```json
{
  "mode": "idea",
  "idea": "Let staff take orders without a POS terminal",
  "audience": "Floor staff currently using pen and paper",
  "success": "Orders are captured accurately and synced within one minute.",
  "existing": ["Nothing yet"],
  "budget": "Not yet determined",
  "timeline": "Exploratory",
  "files": [],
  "name": "Priya Raghavan",
  "email": "priya@company.com",
  "company": "Northwind Foods",
  "nextStep": "20-minute call",
  "needsNda": true
}
```

### Quote

```json
{
  "mode": "quote",
  "workType": "An API or service",
  "scope": "Design and implement the order ingestion API, authentication, and deployment.",
  "constraints": "Postgres, AWS, eu-west-1 only",
  "existing": ["A prototype"],
  "budget": "$15k+",
  "timeline": "1 – 3 months",
  "files": [],
  "name": "Priya Raghavan",
  "email": "priya@company.com",
  "company": "Northwind Foods",
  "nextStep": "Reply by email",
  "needsNda": false
}
```

## Persistence and response

Persist the selected mode, all mode-specific fields, shared selections, contact details, NDA
request, attachment references, timestamps, and an intake status such as `RECEIVED` or `REVIEWED`.
Do not persist the prepared `mailto:` URL; it is a browser handoff, not a submission record.

The endpoint should return a server-generated intake ID and status, for example:

```json
{
  "id": "intake_01J...",
  "status": "RECEIVED"
}
```

Treat contact details and uploaded material as sensitive data. Apply authentication or abuse
controls appropriate to a public form, restrict attachment access, scan files before making them
available, and keep an audit trail for NDA requests and status changes.
