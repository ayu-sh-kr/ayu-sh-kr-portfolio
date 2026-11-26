# T3 Code promised opt-in telemetry. The app shipped it on by default.

A screenshot of an unofficial T3 Code fork drew criticism meant for the official app. That mix-up could have ended with a correction. Instead, the argument drew attention to a much harder question for T3 Code: why did an app that promised to ask before collecting telemetry ship with collection already turned on?

## The promise disappeared. The default stayed.

The [T3 Code homepage](https://web.archive.org/web/20260514051916/https://t3.codes/) still promised opt-in telemetry in May. But the project had [enabled analytics by default in March](https://github.com/pingdotgg/t3code/pull/174). Users could switch it off with an environment variable if they knew to look for one. In June, a [homepage redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) removed the promise. The default stayed on, and a [user flagged the mismatch in July](https://github.com/pingdotgg/t3code/issues/4123).

## A fork dispute put the official app under scrutiny

On November 23, a [Chinese-language post criticizing the UI](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a third-party fork, not the official app. The fork maintainer apologized for the confusion and said they would consider a clearer name. Theo Browne [threatened to ask GitHub to take down the maintainer’s account](https://www.teapawt.org/theo/status/2124829315657576890) unless they renamed it immediately. The maintainer renamed it Stardust.

A day later, [Chen Dahuang published his telemetry audit](https://x.com/realchendahuang/status/2125153472450527440). Older builds sent usage data such as model names and token counts. They also read local Codex and Claude sign-in files and sent [hashes of the account IDs](https://github.com/pingdotgg/t3code/pull/42299). The app didn’t send the raw sign-in tokens through that code. It did send identifiers that let T3 Code link activity from the same account across machines.

## What the team fixed, and what stayed on

Browne [posted an export of his own telemetry](https://x.com/theo/status/2125186071357251715). He also [said he would close the source](https://x.com/theo/status/2125316769858683312), then [backed down](https://x.com/theo/status/2125317722552889353). The repository stayed public. The export showed what the app collected. It didn’t explain why T3 Code collected it without the opt-in it had promised.

On November 24, the team removed the [Codex and Claude account ID collection](https://github.com/pingdotgg/t3code/pull/42299), [dropped IP addresses and user-agent strings from relay traces](https://github.com/pingdotgg/t3code/pull/42380), and [stopped bundling anonymous feedback with identified events](https://github.com/pingdotgg/t3code/pull/42466). The stable [v0.1.12 release](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) followed on November 25. The [telemetry docs](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md) still give users instructions to opt out of routine usage analytics.

The fork maintainer apologized for the confusion and changed the name. T3 Code owed its users an acknowledgment just as direct: the homepage said the app would ask first, and the app didn’t. The patches cut back what the app sends, but ordinary users still have to turn analytics off themselves.
