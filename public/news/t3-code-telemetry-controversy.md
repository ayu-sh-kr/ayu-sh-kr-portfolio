# T3 Code promised opt-in telemetry. The app shipped it on by default.

The developer behind an unofficial T3 Code fork had already apologized for the confusion when Theo Browne threatened to get their GitHub account taken down. Browne had a fair complaint: someone had mistaken the fork’s interface for his app. But the apology was right there in the thread, and he answered it with an ultimatum.

## A correction became a takedown threat

On November 23, a [Chinese-language post mocking the UI](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a third-party fork. Browne pointed that out. The fork maintainer confirmed it was unofficial, thanked the team for open-sourcing T3 Code and said they would make the distinction clearer. When they said they would consider a less confusing name, Browne [threatened to contact GitHub](https://www.teapawt.org/theo/status/2124829315657576890) unless they changed it immediately. They renamed the fork Stardust, and Browne thanked them. Asking for a clearer name was reasonable. Threatening the developer’s entire account was disproportionate.

## Then the official app had its own explaining to do

The next day, [Chen Dahuang published a telemetry audit](https://x.com/realchendahuang/status/2125153472450527440). The [T3 Code homepage](https://web.archive.org/web/20260514051916/https://t3.codes/) had promised opt-in telemetry as late as May, even though the project had [turned collection on by default in March](https://github.com/pingdotgg/t3code/pull/174). The [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) removed the promise, but collection stayed on. A [GitHub issue in July](https://github.com/pingdotgg/t3code/issues/4123) had already flagged the mismatch.

Older builds sent model names and token counts and read Codex and Claude sign-in files to send [hashed account IDs](https://github.com/pingdotgg/t3code/pull/42299) that could link usage across machines. Those hashes were not login tokens.

On November 24, a [user in Germany said they’d filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority. Browne responded by threatening to block access from Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The [post the complainant quoted](https://teapaw.org/sabotaj0707/status/2125329561005043935) is [no longer available on X](https://x.com/i/status/2125326505169531312).

Blocking Germany wouldn’t answer what T3 Code had told its users about data collection. That question matters in the U.S., too: the [FTC enforces companies’ privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) lets residents ask covered businesses what personal information they collect and why. A complaint is not a finding that T3 Code broke either law.

That evening, Browne also briefly [said he would close the source](https://x.com/theo/status/2125316769858683312) before [walking it back](https://x.com/theo/status/2125317722552889353). He later [shared an export of his own telemetry](https://www.xitter.gq/theo/status/2125332390239494211) and explained why the app used account hashes to count users across devices. That explained the hashes, but it didn’t address why collection had been on by default while the homepage still promised opt-in.

The team stopped collecting the provider account IDs, [stripped IP addresses and user-agent strings from relay traces](https://github.com/pingdotgg/t3code/pull/42380), and [separated anonymous feedback from identified events](https://github.com/pingdotgg/t3code/pull/42466). Those changes merged November 24, before [v0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped the next day. Routine usage analytics are [still on by default](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md).

## What Browne could have learned from OpenAI

On the day OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), Browne [called Astra the worst model OpenAI had ever released](https://www.teapawt.net/theo/status/2122757647170703550). He’d tested it early and described how it lost track of long tasks. OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) explained what had changed before launch and acknowledged the model still needed work. Browne replied that the changes helped but hadn’t solved the problems he was seeing. OpenAI took the criticism seriously without having to agree with his verdict.

Browne could have taken a lesson from that exchange. When a developer apologized for the confusion over a fork, Browne threatened their entire GitHub account anyway. That was arrogance, not a defense of the project. When T3 Code’s own users questioned its telemetry, he could have done what OpenAI did with his criticism: answer the substance and say where the product fell short. An apology for collecting telemetry after promising to ask first wouldn’t have undone the collection. It would have shown users that he understood why they were angry.
