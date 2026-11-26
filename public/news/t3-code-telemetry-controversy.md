# T3 Code promised opt-in telemetry. The app shipped it on by default.

Sometimes a simple apology can stop a small dispute from becoming a bigger one. When a screenshot of a fork was mistaken for T3 Code, correcting the mix-up should have been easy. But the argument sent people back to the official app’s source, where they found a discrepancy that had nothing to do with the fork.

## What the homepage promised

In May, the [T3 Code homepage](https://web.archive.org/web/20260514051916/https://t3.codes/) said users would get to choose whether to send telemetry. By then, the [March analytics change](https://github.com/pingdotgg/t3code/pull/174) had already switched collection on by default. Users could turn it off with an environment variable, but the app didn’t wait for them to opt in. A [June homepage redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) removed the promise, not the default. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch months before it drew wider attention.

## The fork dispute brought more eyes to the code

On November 23, a Chinese-language critique showed a third-party fork rather than the official app. Maintainer Theo Browne [called the fork a knockoff](https://x.com/theo/status/2124829315657576890) and later said [his objection was how it presented itself](https://x.com/theo/status/2125077163011674591). The fork was renamed Stardust, according to [Chen Dahuang’s account of the dispute](https://github.com/realchendahuang/before-you-install-t3code).

The next day, [Chen published his review of T3 Code’s telemetry](https://x.com/realchendahuang/status/2125153472450527440). Alongside usage metrics such as model names and token counts, older builds read local Codex and Claude sign-in files and reported **hashes of account IDs**. Those hashes weren’t raw login tokens. They were stable identifiers that could link activity from the same account across installs. The practical question was no longer whose app was in a screenshot. It was what the official app collected before users had made a choice.

## What the team changed

Browne [published an export of his own telemetry](https://x.com/theo/status/2125186071357251715), giving people an example of what the analytics contained. He also [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). The repository stayed public. Sharing the export helped answer what the app sent; the exchange over closing the source did less to explain why it sent those events by default.

The fixes were more direct. [Version 0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) stopped reading and reporting Codex and Claude account IDs for analytics. Separate changes [removed IP addresses and user-agent strings from relay traces](https://github.com/pingdotgg/t3code/pull/42380) and [gave anonymous analytics events their own requests](https://github.com/pingdotgg/t3code/pull/42466) so they wouldn’t be bundled with identified events. The [current telemetry docs](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md) still describe routine product analytics as **on by default**, with ways to turn it off.

A rename could settle which app people were looking at. The telemetry dispute called for a different acknowledgment: the homepage made users one promise, and the app gave them a different default. An apology couldn’t replace the patches. It could have made clear what the team was fixing, and what choice users would still have to make for themselves.
