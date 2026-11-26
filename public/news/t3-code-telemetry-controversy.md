# T3 Code promised opt-in telemetry. The app shipped it on by default.

The day OpenAI [launched GPT-6.2](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), T3 Code creator Theo Browne [called Astra the worst model OpenAI had released](https://www.teapawt.net/theo/status/2122757647170703550). He’d tested it before launch and watched it lose track of long tasks. OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) pointed to changes made in the final days and said the models still needed work. Browne replied that the changes helped but didn’t fix everything.

Six days after launch, it was Browne’s turn to answer a complaint about his own app. The first screenshot wasn’t even of T3 Code.

## A screenshot of the wrong app

On November 23, a [post mocking T3 Code’s interface](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed an unofficial fork. Browne corrected the mistake. The fork’s developer thanked the team for making the code public, apologized for the confusion and said they’d consider a clearer name. [Browne replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.”

The developer renamed the fork Stardust. Browne thanked them. By the next day, the discussion had moved from the fork’s interface to what the official app sent from users’ machines.

## The switch users had asked for

[Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) traced a mismatch back to March: T3 Code [enabled telemetry by default](https://github.com/pingdotgg/t3code/pull/174) while its [homepage still promised opt-in](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) removed the promise and left the default intact. That month, when users asked for a setting, maintainer Julius Marminge [closed the request](https://github.com/pingdotgg/t3code/issues/1397), saying the team wouldn’t make opting out easier because it needed to count users. A [July issue](https://github.com/pingdotgg/t3code/issues/4123) called out the mismatch directly.

Alongside model names and token counts, older builds read Codex and Claude sign-in files and sent [hashed account IDs](https://github.com/pingdotgg/t3code/pull/42299). They didn’t send raw login tokens, but the hashes let T3 Code link usage across machines. On November 24, a [user in Germany said they’d filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

## What changed after the complaint

That evening, Browne [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He also threatened to block Germany, according to [Sagnik Pramanik, who quoted him as saying “Will ban Germany”](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The [post the complainant quoted](https://teapaw.org/sabotaj0707/status/2125329561005043935) is [no longer available on X](https://x.com/i/status/2125326505169531312). Blocking a country wouldn’t settle the question of what users had been told. The [FTC enforces privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) gives residents the right to ask covered businesses what they collect and why.

Browne later [shared his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211) and explained that the hashes helped count people using more than one device. The team removed those account IDs, [stripped IP addresses and user-agent strings from relay traces](https://github.com/pingdotgg/t3code/pull/42380), and [separated anonymous feedback from identified events](https://github.com/pingdotgg/t3code/pull/42466). The changes merged on November 24; [v0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped the next day.

After OpenAI’s reply, Browne could say what had improved and what still bothered him. T3 Code users eventually got a list of what had changed, too. The part left unanswered was why the app collected data by default while the homepage said it would ask first. In the [current docs](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md), users are still the ones who have to switch it off.
