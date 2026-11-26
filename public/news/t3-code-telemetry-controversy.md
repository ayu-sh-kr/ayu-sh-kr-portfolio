# T3 Code promised opt-in telemetry. The app shipped it on by default.

A developer apologized for a mix-up over an unofficial T3 Code fork. Theo Browne still threatened to have their GitHub account taken down. The next day, it was his own project that had something to explain: T3 Code told users it would ask before collecting telemetry, then collected it by default.

## The promise and the default

The dispute over telemetry began months before the fork argument. In **March**, T3 Code [turned analytics on by default](https://github.com/pingdotgg/t3code/pull/174). Its [homepage still promised opt-in telemetry in May](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) dropped the promise but kept the default. That month, maintainer Julius Marminge [closed a request for an in-app switch](https://github.com/pingdotgg/t3code/issues/1397), saying the team needed to count users and would not make opting out easier. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch.

## From a correction to a takedown threat

On **November 23**, a [post mocking T3 Code’s interface](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a fork, not the official app. Browne pointed that out. The fork’s developer thanked the team for open-sourcing T3 Code, apologized and said they’d consider a clearer name. Browne [replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.” The developer renamed the fork Stardust, and Browne thanked them. That settled the naming dispute. The next day’s audit was about T3 Code itself.

## A GDPR complaint and a reported threat to ban Germany

On **November 24**, [Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) showed why the default mattered. Older builds reported model names and token counts. They also read local sign-in files and sent [hashed Codex and Claude account IDs](https://github.com/pingdotgg/t3code/pull/42299) to link usage across machines. A [user in Germany said they had filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

That evening, Browne [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He also threatened to block access from Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The complainant [pushed back](https://teapaw.org/sabotaj0707/status/2125329561005043935); the [post they quoted is no longer available on X](https://x.com/i/status/2125326505169531312).

Blocking access in Germany wouldn’t answer why T3 Code broke its opt-in promise. That question matters in the U.S., too. The [FTC can enforce privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) lets residents ask covered businesses what personal information they collect and why.

Later that night, Browne [published his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211) and said the account ID collection had been removed. The team also stripped IP addresses from [relay traces](https://github.com/pingdotgg/t3code/pull/42380) and separated [anonymous feedback](https://github.com/pingdotgg/t3code/pull/42466) from identified events. [Version 0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped on **November 25**. Routine analytics are [still on by default](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md).

## What Browne could learn from OpenAI

On **November 17**, the day OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), Browne [called Astra the worst model OpenAI had ever released](https://www.teapawt.net/theo/status/2122757647170703550). OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) explained what the team had changed and acknowledged the model still needed work. Browne replied that some changes helped but the model still lost track of long tasks.

That’s the part Browne could learn from: OpenAI answered his criticism without having to agree with him. T3 Code’s users deserved an equally direct answer about why the app collected data before asking. The fork developer apologized and changed the name. The T3 team changed what it collected. It still owed users an apology for breaking its promise.
