# T3 Code Telemetry Controversy: The Broken Opt-In Promise

A developer apologized for a mix-up over an unofficial T3 Code fork. Theo Browne still threatened to have their GitHub account taken down. The next day, it was his own project that had something to explain: T3 Code told users it would ask before collecting telemetry, then collected it by default.

## The opt-in promise and default-on telemetry

The dispute over telemetry began months before the fork argument. In **March**, T3 Code [turned analytics on by default](https://github.com/pingdotgg/t3code/pull/174). Its [homepage still promised opt-in telemetry in May](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) dropped the promise but kept the default. That month, maintainer Julius Marminge [closed a request for an in-app switch](https://github.com/pingdotgg/t3code/issues/1397), saying the team needed to count users and would not make opting out easier. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch.

## Theo Browne’s GitHub takedown threat

On **November 23**, a [post mocking T3 Code’s interface](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a fork, not the official app. Browne pointed that out. The fork’s developer thanked the team for open-sourcing T3 Code, apologized and said they’d consider a clearer name. Browne [replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.” The developer renamed the fork Stardust, and Browne thanked them. That settled the naming dispute. The next day’s audit was about T3 Code itself.

## The German GDPR complaint and reported ban threat

On **November 24**, [Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) showed why the default mattered. Older builds reported model names and token counts. They also read local sign-in files and sent [hashed Codex and Claude account IDs](https://github.com/pingdotgg/t3code/pull/42299) to link usage across machines. A [user in Germany said they had filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

That evening, Browne [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He also threatened to block access from Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The complainant [pushed back](https://teapaw.org/sabotaj0707/status/2125329561005043935); the [post they quoted is no longer available on X](https://x.com/i/status/2125326505169531312).

Blocking access in Germany wouldn’t answer why T3 Code broke its opt-in promise. That question matters in the U.S., too. The [FTC can enforce privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) lets residents ask covered businesses what personal information they collect and why.

## What T3 Code v0.1.12 fixed

On the evening of **November 24**, Browne [published his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211) and said the account ID collection had been removed. The team also stripped IP addresses from [relay traces](https://github.com/pingdotgg/t3code/pull/42380) and separated [anonymous feedback](https://github.com/pingdotgg/t3code/pull/42466) from identified events. [Version 0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped on **November 25**. Routine analytics are [still on by default](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md).

## What Browne could learn from OpenAI’s GPT-6.2 response

Browne had been on the other side of a public round of criticism just a week before the audit. On **November 17**, OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/). That day, Browne [called Astra the worst model OpenAI had ever released](https://www.teapawt.net/theo/status/2122757647170703550). The next day, OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) explained what the team had changed and acknowledged the model still needed work. Browne replied that some changes helped but the model still lost track of long tasks.

OpenAI didn’t have to agree with Browne to take his criticism seriously. That’s the example he could have followed when T3 Code’s users asked why the app collected data before asking them.

## The backlash comes back to Theo Browne

By **November 26, 2026**, a day after v0.1.12 shipped, the argument had moved beyond what T3 Code collected. [Dmitry Figol shared screenshots of posts](https://www.teapaw.org/dmfigol/status/2126025885740626075) and [direct messages](https://www.teapaw.org/dmfigol/status/2126025889016094829) from a **January 2025** dispute over **T3 Chat**, a separate product. Figol had criticized Browne’s threat to rally his audience against two security vendors that blocked T3 Chat. In the exchange Figol published, Browne invoked being an AWS customer after Figol criticized him. Figol says he apologized.

![Figol’s screenshot of Browne’s January 2025 public posts about the T3 Chat block, including the post threatening to rally Browne’s audience.](/news/assets/t3-code-telemetry-controversy/figol-archived-public-posts.webp)

[Open Figol’s post with the archived tweets](https://www.teapaw.org/dmfigol/status/2126025885740626075).

![Screenshots of the direct messages between Browne and Figol, as published by Figol.](/news/assets/t3-code-telemetry-controversy/figol-published-dms.webp)

[Open Figol’s post with the direct messages](https://www.teapaw.org/dmfigol/status/2126025889016094829).

[Figol said](https://www.teapaw.org/dmfigol/status/2126025881844174968) AWS HR contacted him about a month after the exchange and told him someone had filed and withdrawn a complaint about his post. He says HR found no wrongdoing and closed the case. His account does not establish who filed the complaint.

Now it was Browne’s critics drawing an audience. [One reply called for him to be cancelled](https://www.teapaw.org/Damianships/status/2126054283590172976); [another called it karmic payback](https://www.teapaw.org/Zhangmuhui001/status/2126101603656913187). The irony is in the sequence: Browne had threatened to turn his audience on others. This time it was his own messages people were circulating.

![Screenshot collage: an excerpt from Dmitry Figol’s post describing the direct messages, followed by two replies calling for cancellation and describing the backlash as payback.](/news/assets/t3-code-telemetry-controversy/figol-thread-and-reactions.webp)

![Two more public replies to Figol: one recalls a separate T4 naming dispute and another asks for the screenshots to be archived.](/news/assets/t3-code-telemetry-controversy/figol-more-public-replies.webp)

[The reply about T4](https://www.teapaw.org/_Defeatable_/status/2126096598367117581) and [the call to archive the posts](https://www.teapaw.org/0xleelu/status/2126094351642321108) show where the discussion went next.

The fork developer apologized and changed the name. T3 Code changed what it collected. What users still deserved was a plain apology for collecting it without asking in the first place.
