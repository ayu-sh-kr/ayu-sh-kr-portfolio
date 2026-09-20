# Z.ai's ZCode was caught stealing user code — silently uploading a 313MB project snapshot with a server-only key

An AI coding tool sending telemetry is annoying. An AI coding tool caught stealing your entire commercial project — Git history included — and queuing it for upload to a cloud bucket you never agreed to is something else entirely.

That is what an independent Chinese blogger known as Ferstar [reported finding](https://blog.ferstar.org/en/posts/zcode-silent-workspace-snapshot-upload/) inside Z.ai's ZCode. According to the report, a 313-megabyte archive sat in a local ZCode directory, pending upload to Alibaba cloud storage after 564 failed attempts. A smaller 15-kilobyte file had already gone through. Both files were encrypted, and the archive — named after a snapshot of a commercial project he was working on — could not be opened by him or the ZCode client. Only a private key on Z.ai's back end could decrypt it.

Z.ai has since apologised and called the upload a "bug" rather than intentional collection. A bug that packages a workspace, encrypts it away from its owner, and retries the upload 564 times.

## The encryption is the tell

Retries happen. A failed upload queue is mundane. Encryption that excludes the user is not.

If the purpose was diagnostics or crash recovery, the natural design is a key the user holds, or plain, inspectable logs the user can review before sending. Instead, the design here produced an opaque package of someone's work that only the vendor could read. The architecture trusted Z.ai's server with a developer's source and trusted the developer with nothing — not visibility, not consent, not the ability to verify what was taken. That is not what an accident looks like; that is what a system built to take code looks like when it gets caught.

Bugs misplace data. They don't design a pipeline this specific around it.

## It was stealing straight away — but let me also peek at the data layer while I fix the token layer

The timing couldn't be better scripted: AI coding tools are in a race to earn workspace access, repository permissions, and persistent credentials — each justified as necessary for the next helpful feature. The ZCode episode is a reminder that every new integration is also a new surface for quiet exfiltration, and "we only collect telemetry" deserves the same scrutiny here as anywhere else.

It was stealing straight away — but why stop there? Let me also peek at the data layer while I fix the token layer. A tool that can read your codebase to autocomplete a function can read it for other purposes the moment nobody is watching the upload queue.

## What to actually check

If you run AI coding tools on commercial work:

- Watch outbound traffic from the tool's process, not just its settings panel.
- Check local caches and staging directories for files you never created.
- Treat "encrypted for your safety" as a question, not an answer: encrypted so *who* can read it?
- Keep proprietary repos behind tools that let you inspect and approve anything before it leaves the machine.

The lesson is not that all AI tools are malicious. It is that trust has to be verifiable, and this one wasn't.

Sources: [Ferstar — Inside ZCode: silently uploading your entire Git history to the cloud](https://blog.ferstar.org/en/posts/zcode-silent-workspace-snapshot-upload/) · [SCMP — Z.ai faces reputation hit after users spot unauthorised uploads](https://www.scmp.com/tech/tech-trends/article/3368159/chinese-ai-firm-zai-faces-reputation-hit-after-users-spot-unauthorised-uploads)
