# PHP2Shell: PHP RCE flaws, request flow and patched versions

PHP's **October 21 emergency release** fixes two flaws that can let someone run code on a web server without logging in: **unauthenticated remote code execution (RCE)**. Tracked as **CVE-2026-109618** and **CVE-2026-109619**, and widely called [PHP2Shell](https://digital.nhs.uk/cyber-alerts/2026/cc-4875), they affect the runtime that executes PHP applications. In a demonstrated Apache attack, the failure occurs before the site's own code starts.

The flaws are in **PHP itself**, the software that runs applications built with WordPress, Laravel and other PHP tools. In the demonstrated Apache attack, PHP fails while preparing the incoming request, before the application's login checks can run.

## Where PHP sits in the request and response cycle

When a browser sends a request, the web server passes the PHP work to a **worker**: a running process that handles it. PHP prepares request data, the application runs, and its output becomes an HTTP response. PHP also cleans up the request's memory. A worker may stay alive to handle another request, so it must clear references to the previous request's data.

The diagram separates the normal request from two failure paths. **A** follows a crafted form request through input parsing, memory exhaustion and unsafe cleanup before application code runs. **B** follows a stale reference across two requests handled by the same worker. The numbered arrows show the order within each path; these are separate flaws, not consecutive stages of one attack.

![Numbered PHP failure paths: A shows multipart headers and file metadata expanding in memory until allocation fails, startup aborts and Apache cleanup uses incomplete state before application login. B shows a reference surviving freed request memory and being used by early processing of a later request on the same worker.](/news/assets/php-critical-rce-october-2026/request-response-failure-points.svg)

## What goes wrong at each marked point?

**A — memory exhaustion during startup.** Before the application runs, PHP parses incoming form data into structures it can use. A multipart request splits form fields and uploads into parts with their own headers. Those headers and file metadata can take substantially more memory inside PHP than they occupy in the request, so even a body within the configured size limit can exhaust PHP's request memory budget. The [CVE-2026-109618 advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w) describes an abrupt abort that can leave internal data only partly initialized. Apache's `mod_php`, which runs PHP inside Apache, still invokes cleanup after failed startup. Cleanup then acts on invalid memory. Researchers demonstrated remote code execution through this path before application code ran.

A memory error does not automatically give every visitor control. Exploitation depends on arranging memory so that PHP's mistaken operations use attacker-controlled values. The demonstrated code runs with the **web worker's permissions**, which determine what files and credentials it can reach.

**B — a reference outlives its data.** A pointer records where data lives in memory. The [CVE-2026-109619 advisory](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) describes paths where a worker keeps a pointer after that request's memory has been released. A fatal error can interrupt an operation before it clears that reference. Early processing of a later request uses it before normal initialization clears it. Treating that stale reference as valid can lead to code execution.

The server setup changes the path. **PHP-FPM** manages a pool of PHP workers and terminates a child when startup fails, blocking the exact Apache startup sequence shown in A. The second advisory nevertheless documents a validated FPM path involving an application operation, a fatal error and a later request. Switching to FPM is therefore not a substitute for patching.

## Patched PHP versions

The [PHP security advisory](https://www.php.net/archive/2026.php#2026-10-21-5) lists these fixed releases:

| PHP branch | Fixed release |
| --- | --- |
| 8.5 | **8.5.12** |
| 8.4 | **8.4.27** |
| 8.3 | **8.3.36** |
| 8.2 | **8.2.35** |

PHP 8.1 and older are outside regular project support. Some vendors backport fixes into their packages; PHP also published minimal source patches for 7.4, 8.0 and 8.1. Those exceptions do not restore ongoing support.

## Check the runtime serving the site

Update the server package or container image, restart the PHP workers, and verify the version handling web requests. Command-line PHP can differ from the Apache or PHP-FPM installation serving the site. For managed hosting, ask the host to confirm its deployed fix; updating a WordPress plugin does not replace PHP.

Vendor packages may contain the fix without adopting the upstream version number. Check their security notice. PHP's temporary configuration measures reduce particular attack paths but do not fully fix the flaws.

The update is complete when the workers accepting requests are running patched code. A downloaded package or rebuilt image alone does not establish that.
