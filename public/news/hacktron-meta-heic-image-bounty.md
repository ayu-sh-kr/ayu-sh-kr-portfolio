# Hacktron researcher reports $115,000 Meta bounty for HEIC image flaw

A photo upload normally ends as a thumbnail. Security researcher **Harsh Jaiswal** reported that a crafted **HEIC image** could instead reach a flaw in Meta’s server-side image processing. A report on his bounty says Meta awarded him **$100,000**, plus a $15,000 program bonus, for a total of **$115,000**.

Jaiswal is part of **Hacktron AI**, the team that earlier used a similar image-upload route to expose a separate flaw in OpenAI’s community forum. The Meta payout comes from OfficeChai’s report on a confirmation Jaiswal shared. It describes a memory-corruption issue affecting Facebook and Instagram image conversion that could allow code execution under certain conditions. The report says Meta fixed it; a detailed public advisory for Meta’s case was not available in the sources reviewed.

## How a photo can reach a vulnerable decoder

Websites often resize or convert uploaded images before displaying them. A site might pass a HEIC photo to ImageMagick, which calls a lower-level library called `libheif` to read the file. A flaw in that library can therefore be reached through an ordinary upload feature, even when the site’s own image-upload code appears sound.

That path is what Hacktron’s **HEIF Heist** research followed across different services. Meta’s reported issue involved HEIC image conversion. The team’s earlier OpenAI case shows the chain in more detail, although the public accounts do not establish that the two companies had the exact same bug.

In July, Jaiswal and fellow researchers **Mohan Pedhapati** and **Rahul Maini** tested OpenAI’s community forum. It runs on Discourse, which sent their crafted HEIF image through ImageMagick to a vulnerable `libheif` decoder. Hacktron says this let them run code on the forum server. A second, separate flaw in OpenAI’s **single sign-on** then let them reach employee ChatGPT and Codex accounts. They asked one employee’s GitHub-connected Codex to open a harmless pull request in OpenAI’s private repository to demonstrate access. They say they did not read internal code and stopped testing.

OpenAI paid the team **$6,500** for the sign-in issue; its bounty program excluded testing against the Discourse-hosted forum. Meta’s reward concerned the image conversion finding, so the payouts cover different reports. Discourse separately published a security advisory, patched versions, and instructions to rebuild affected installations.

## What the reports mean for image uploads

The research extended beyond those two companies. Vercel documented a related `libheif` issue reachable through **AVIF image optimization** in Next.js deployments. It disabled AVIF optimization on its platform while coordinating a fix with the library maintainers. This was another path into image-decoding software, not evidence that every image upload was vulnerable.

For a service that accepts images, the useful check is **which formats it actually decodes** and which libraries do that work. Apply the relevant security updates and rebuild container images so patched system packages reach production. If HEIC or AVIF decoding is unnecessary, disable it; where it is needed, isolate image processing with limited access. Repeated crashes in image workers also deserve investigation.

The Meta bounty brought attention back to a familiar-looking upload. Hacktron’s OpenAI case explains why it matters: the image reached code deep in the processing chain, and another login flaw widened the impact. Knowing what decodes an uploaded photo, and what that process can reach, is the practical lesson from both reports.

Sources: [Hacktron’s OpenAI disclosure](https://www.hacktron.ai/blog/hacking-openai), [OfficeChai’s report on Jaiswal’s Meta bounty](https://officechai.com/stories/harsh-jaiswal-gets-100000-bug-bounty-from-meta-for-finding-similar-exploits-as-the-openai-hack/), [Discourse’s HEIF security advisory](https://github.com/discourse/discourse/security/advisories/GHSA-vhm9-85gw-x335), and [Vercel’s libheif disclosure](https://vercel.com/blog/reproducing-disclosing-and-fixing-the-libheif-vulnerability-with-hacktron-and-the-maintainers).
