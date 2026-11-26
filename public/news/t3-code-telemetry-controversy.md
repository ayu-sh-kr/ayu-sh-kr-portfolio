# T3 Code promised opt-in telemetry. The app shipped it on by default.

A developer apologized for a mix-up involving an unofficial T3 Code fork. Theo Browne could have left it at a correction. Instead, he threatened to have the developer’s GitHub account taken down. A day later, people were asking Browne to answer for a mistake in his own app.

## The promise and the default

In **March**, T3 Code [turned analytics on by default](https://github.com/pingdotgg/t3code/pull/174). Its [homepage still promised opt-in telemetry in May](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) dropped the promise but kept the default. That month, maintainer Julius Marminge [closed a request for an in-app switch](https://github.com/pingdotgg/t3code/issues/1397), saying the team needed to count users and would not make opting out easier. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch.

## From a correction to a takedown threat

On **November 23**, a [post mocking T3 Code’s interface](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a fork, not the official app. Browne pointed that out. The fork’s developer thanked the team for open-sourcing T3 Code, apologized and said they’d consider a clearer name. Browne [replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.” The developer renamed the fork Stardust, and Browne thanked them.

## A GDPR complaint and a reported threat to ban Germany

On **November 24**, [Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) brought attention back to the official app. Along with model names and token counts, older builds sent [hashed Codex and Claude account IDs](https://github.com/pingdotgg/t3code/pull/42299) that let T3 Code link usage across machines. A [user in Germany said they had filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

After the complaint became public, Browne threatened to ban Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The complainant [pushed back in a quote-post](https://teapaw.org/sabotaj0707/status/2125329561005043935); the [original post is no longer available on X](https://x.com/i/status/2125326505169531312). Blocking Germany wouldn’t answer for the opt-in promise. The [FTC can enforce privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement) in the U.S., and [California law](https://cppa.ca.gov/faq) lets residents ask covered businesses what personal information they collect and why.

That evening Browne also [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He later [published his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211) and said the account ID collection had been removed. The team also stripped IP addresses from [relay traces](https://github.com/pingdotgg/t3code/pull/42380) and separated [anonymous feedback](https://github.com/pingdotgg/t3code/pull/42466) from identified events. [Version 0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped on **November 25**. Routine analytics are [still on by default](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md).

## What Browne could learn from OpenAI

A week earlier, on the day OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), Browne [called Astra the worst model OpenAI had ever released](https://www.teapawt.net/theo/status/2122757647170703550). OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) explained what the team had changed and acknowledged the model still needed work. Browne replied that some changes helped but the model still lost track of long tasks.

Browne could have taken a cue from that exchange. OpenAI didn’t have to agree with his verdict to answer his criticism. T3 Code’s users deserved the same courtesy: an acknowledgment that the app had collected telemetry after promising to ask first, and an apology. The patches answered what would change. The threats never answered why users hadn’t been given the choice they were promised.
