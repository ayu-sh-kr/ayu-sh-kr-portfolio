# Hacktron researcher reports $115,000 Meta bounty for HEIC image flaw

A photo upload can travel through more software than its filename suggests. At Meta, a security report about a crafted **HEIC image** led to a $100,000 bounty, with a program bonus taking the reported total to **$115,000**. The researcher was **Harsh Jaiswal**, part of the three-person security team at Hacktron AI.

The payout was reported by OfficeChai, which says Jaiswal shared Meta’s bounty confirmation. The report describes a remote code execution flaw in image handling for Facebook and Instagram: under certain conditions, a crafted HEIC upload could trigger memory corruption during server-side conversion. Meta has reportedly fixed the issue. A public technical advisory describing the Meta bug in detail was not available in the sources reviewed.

## How an image reaches a server-side decoder

Websites often resize or convert uploaded images before displaying them. An application may call a tool such as ImageMagick, which in turn relies on lower-level libraries to understand formats such as HEIC and HEIF. That means an upload endpoint can expose code in a dependency several steps below the application itself.

Hacktron’s wider **HEIF Heist** research looked at this image-decoding path across services and frameworks. The Meta report concerns a similar class of risk, but the available reporting does not establish that it was the same vulnerability as the OpenAI incident.

Hacktron’s separate account of OpenAI’s case names Jaiswal, **Mohan Pedhapati**, and **Rahul Maini**. The team reported that a crafted HEIF image reached a vulnerable `libheif` decoder through ImageMagick and Discourse, the software running OpenAI’s community forum. They then found an OpenAI single sign-on issue that let forum access extend to employee ChatGPT and Codex accounts. One connected Codex account opened a proof-of-access pull request in OpenAI’s internal repository; the researchers say they did not inspect its code and stopped testing.

OpenAI paid **$6,500**, but the scope matters: OpenAI said testing against the Discourse-hosted forum was explicitly excluded from its bounty program. The award recognized the OpenAI-side identity finding. Discourse handled the image-processing vulnerability through its own disclosure process and published patched versions and rebuild guidance.

## What the reports mean for image uploads

Vercel later documented a related `libheif` remote-code-execution issue reachable through AVIF image optimization in Next.js deployments. It temporarily disabled AVIF optimization on its platform while working with maintainers on a fix. Together, these disclosures show why checking only an application’s direct dependencies can miss the decoder that actually processes an uploaded file.

For teams that accept images, check which formats the server decodes, whether the underlying image libraries have current security fixes, and whether processing runs with limited access in an isolated environment. Rebuild container images after updating the system packages inside them; changing application code alone may leave the old decoder in place.

The Meta payout is striking, but the shared thread across these reports is the route from an ordinary upload to a native image decoder. That route deserves attention wherever a service accepts and transforms files it did not create.

Sources: [Hacktron’s OpenAI disclosure](https://www.hacktron.ai/blog/hacking-openai), [OfficeChai’s report on Jaiswal’s Meta bounty](https://officechai.com/stories/harsh-jaiswal-gets-100000-bug-bounty-from-meta-for-finding-similar-exploits-as-the-openai-hack/), [Discourse’s HEIF security advisory](https://github.com/discourse/discourse/security/advisories/GHSA-vhm9-85gw-x335), and [Vercel’s libheif disclosure](https://vercel.com/blog/reproducing-disclosing-and-fixing-the-libheif-vulnerability-with-hacktron-and-the-maintainers).
