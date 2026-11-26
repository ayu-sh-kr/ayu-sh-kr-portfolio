# T3 Code promised opt-in telemetry. The app shipped it on by default.

The day OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), T3 Code creator Theo Browne [called Astra the worst model OpenAI had released](https://www.teapawt.net/theo/status/2122757647170703550). He’d tested it before launch and watched it lose track of long tasks. OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) pointed to changes made in the final days and said the models still needed work. Browne replied that the changes helped but didn’t fix everything.

Six days later, Browne was on the other side of a public critique. Someone was mocking T3 Code’s interface, but the screenshot showed a different app.

## A screenshot of the wrong app

Browne [pointed out the mix-up](https://www.teapawt.org/suyuan1711/status/2124769583521529931). The developer confirmed it was an unofficial fork, thanked the T3 Code team for making the code public and apologized for the confusion. When they said they’d consider a clearer name, [Browne replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.”

The developer renamed the fork Stardust, and Browne thanked them. The next day, a review of the official app’s code raised a question its users had been asking since summer.

## The switch users had asked for

[Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) traced the mismatch to March. T3 Code [enabled telemetry by default](https://github.com/pingdotgg/t3code/pull/174) while its [homepage still promised opt-in](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) removed the promise and left the default intact. Later in June, maintainer Julius Marminge [closed a request for an in-app switch](https://github.com/pingdotgg/t3code/issues/1397), saying the team wouldn’t make opting out easier because it needed to count users. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch directly.

Older builds reported model names and token counts. They also read Codex and Claude sign-in files and sent [hashed account IDs](https://github.com/pingdotgg/t3code/pull/42299). Those weren’t login tokens, but they let T3 Code count the same person across multiple machines. On November 24, a [user in Germany said they’d filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

## The public response and the fixes

That evening, Browne [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He also threatened to block access from Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The [post the complainant quoted](https://teapaw.org/sabotaj0707/status/2125329561005043935) is [no longer available on X](https://x.com/i/status/2125326505169531312).

The privacy promise didn’t end at Germany’s border. The [FTC can enforce companies’ privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) lets residents ask covered businesses what personal information they collect and why.

When Browne [published his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211) that evening, the team had already removed the provider account IDs. It also [stripped IP addresses and user-agent strings from relay traces](https://github.com/pingdotgg/t3code/pull/42380) and [separated anonymous feedback from identified events](https://github.com/pingdotgg/t3code/pull/42466). Those changes merged on November 24, before [v0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped the next day.

OpenAI’s reply gave Browne room to say what had improved and what still hadn’t. T3 Code’s fixes narrowed what it collects, but its users were asking about the default, too. The homepage once said the app would wait for them to say yes. The [current instructions](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md) tell them how to say no.
