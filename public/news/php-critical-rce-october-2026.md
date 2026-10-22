# PHP patches two critical remote code execution flaws

PHP released emergency updates on October 21 for two flaws in the language runtime, **CVE-2026-109618** and **CVE-2026-109619**. Both can let an attacker run code on a vulnerable web server without logging in. The PHP project rates each 9.2 under CVSS 4.0 and says there is no complete workaround short of updating.

The problem sits below WordPress, Laravel or any other PHP application. A website can have careful login checks and still expose the runtime that handles the incoming request.

## How a web request reaches the flaws

A PHP worker handles requests and manages memory while it does so. In the [first advisory](https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w), PHP explains that a request can exhaust its memory limit during input processing. An abrupt exit can leave partially prepared request data in an invalid state. Cleanup then acts on that data. The researchers demonstrated code execution against Apache's `mod_php` setup before the site's application code ran.

The [second advisory](https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp) concerns information a worker retains between requests. A fatal error can leave a pointer to memory that has already been released. When the same worker handles another request, some early operations may use that stale pointer. The two flaws have different triggers; both turn an internal memory error into a possible path to code execution.

The demonstrated paths and conditions vary by server setup. Apache `mod_php` has a confirmed exploit path. PHP also considers other web-serving setups susceptible, though the exact exploit does not carry over unchanged to every installation. This is a flaw in PHP itself, so updating a CMS plugin alone does not fix it.

## Which versions need updating?

The [PHP release notice](https://www.php.net/archive/2026.php) lists the fixed versions: **8.5.12, 8.4.27, 8.3.36 and 8.2.35**. A site running an earlier build of one of those branches needs the corresponding update. PHP 8.1 and older no longer receive regular fixes from the PHP project; teams on those branches need a supported upgrade or a vendor package that explicitly includes the fix.

Check the version actually serving web traffic, not only the `php -v` output from a developer laptop. Update the server package or container image, restart the PHP workers, and verify the running version. Linux distributions may backport fixes without using the upstream version number, so consult the vendor's security notice for their package.

Restricting access or changing configuration can reduce exposure while an update is arranged, but PHP says those measures are incomplete. The decisive check is that the web-facing runtime has the patched code.
