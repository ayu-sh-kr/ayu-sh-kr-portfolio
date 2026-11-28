# T3 Code Telemetry Controversy: The Broken Opt-In Promise

A developer apologized for a mix-up over an unofficial T3 Code fork. Theo Browne still threatened to have their GitHub account taken down. The next day, his own project had something to explain: T3 Code had told users it would ask before collecting usage data, but the app collected it by default.

## The opt-in promise and default-on telemetry

T3 Code [turned analytics on by default](https://github.com/pingdotgg/t3code/pull/174) in **March**. Its [homepage still promised opt-in telemetry in May](https://web.archive.org/web/20260514051916/https://t3.codes/). A [June redesign](https://github.com/pingdotgg/t3code/commit/3bdaa6e100469) took the promise off the site and left the setting alone.

That same month, maintainer Julius Marminge [closed a request for an in-app switch](https://github.com/pingdotgg/t3code/issues/1397), saying the team needed to count users and wouldn’t make opting out easier. By July, a [GitHub issue](https://github.com/pingdotgg/t3code/issues/4123) had called out the mismatch. It resurfaced in November, just as another dispute put T3 Code under scrutiny.

## Theo Browne’s GitHub takedown threat

On **November 23**, a [post mocking T3 Code’s interface](https://www.teapawt.org/suyuan1711/status/2124769583521529931) showed a fork, not the official app. Its developer apologized and said they’d consider a clearer name. Browne [replied](https://www.teapawt.org/theo/status/2124829315657576890): “Not consider. Do it right now or I’m going to contact GitHub and have your account taken down.” The developer renamed the fork Stardust, and Browne thanked them. In [his own post](https://www.xitter.cf/DLKFZWilliam2/status/2124838130595643642), developer William criticized Browne for mocking a Chinese fork as a knockoff when the project itself invited people to fork it.

## The German GDPR complaint and reported ban threat

The next day, [Chen Dahuang’s audit](https://x.com/realchendahuang/status/2125153472450527440) turned the attention back to the official app. Older builds tracked model names and token counts, and read local sign-in files to send [hashed Codex and Claude account IDs](https://github.com/pingdotgg/t3code/pull/42299). Those identifiers let T3 Code link usage across machines. A [user in Germany said they filed a GDPR complaint](https://teapawt.org/sabotaj0707/status/2125210190005846326) with Saxony-Anhalt’s data protection authority.

Browne [said he would close the source](https://x.com/theo/status/2125316769858683312), then [walked it back](https://x.com/theo/status/2125317722552889353). He also threatened to block access from Germany after the complaint, according to [Sagnik Pramanik’s account of the exchange](https://www.xitter.gq/sagnikpramanik/status/2125614439449886847). The complainant [responded at the time](https://teapaw.org/sabotaj0707/status/2125329561005043935); Browne’s [original post is no longer available on X](https://x.com/i/status/2125326505169531312). Blocking users in Germany wouldn’t explain the broken promise, and questions about data collection don’t stop at the border: the [FTC can enforce privacy promises](https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement), and [California law](https://cppa.ca.gov/faq) gives residents rights to ask covered businesses what they collect and why.

## What T3 Code v0.1.12 fixed

Browne [published his own telemetry export](https://www.xitter.gq/theo/status/2125332390239494211). The team removed collection of the hashed account IDs, stripped IP addresses from [relay traces](https://github.com/pingdotgg/t3code/pull/42380) and separated [anonymous feedback](https://github.com/pingdotgg/t3code/pull/42466) from identified events. The complainant [acknowledged those fixes in a public follow-up](https://nitter.cf/sabotaj0707/status/2125506127156658580), arguing that the changes documented in GitHub went further than Browne’s public account suggested. [Version 0.1.12](https://github.com/pingdotgg/t3code/releases/tag/v0.1.12) shipped on **November 25**. Routine analytics are [still on by default](https://github.com/pingdotgg/t3code/blob/main/docs/user/telemetry.md).

## What Browne could learn from OpenAI’s GPT-6.2 response

A week earlier, Browne had been the one asking a software team to explain itself. On [GPT-6.2’s launch day](/news/gpt-6-2-microsoft-mai-gemini-4-neon/), he [called Astra the worst model OpenAI had released](https://www.teapawt.net/theo/status/2122757647170703550). OpenAI’s [Thibault Sottiaux](https://www.teapawt.net/thsottiaux/status/2122929634916679820) explained what the team had changed and acknowledged what still needed work. Browne said some changes helped, though the model still lost track of long tasks.

That was an example Browne could have followed. OpenAI addressed the problem he’d raised. T3 Code’s users had an equally direct question: why did the app collect data before asking?

## The backlash comes back to Theo Browne

On **November 26**, [Dmitry Figol revived a January 2025 dispute](https://www.teapaw.org/dmfigol/status/2126025881844174968) over **T3 Chat**, a separate product. Figol had objected after Browne threatened to rally his audience against two security vendors that had blocked T3 Chat. In the messages Figol published, Browne invoked being an AWS customer. Figol says he apologized. He says AWS HR later told him someone had filed and withdrawn a complaint, and that it found no wrongdoing. Figol’s account doesn’t establish who filed it.

On **November 27**, a [post by @bebuu_ai](https://x.com/bebuu_ai/status/2126285889110454432) challenged a different assurance from T3 Code, this time about running Google Antigravity through the app. T3 Code’s own changes confirm it [stopped checking quotas through Google’s internal APIs](https://github.com/pingdotgg/t3code/pull/43026) and [stopped identifying itself as the Zed editor](https://github.com/pingdotgg/t3code/pull/43087). Those fixes don’t establish the post’s claim that T3 Code caused account bans.

<div class="dispatch-evidence" role="group" aria-label="Source screenshots for the backlash">
<div class="dispatch-evidence-grid">
<a class="dispatch-evidence-tile" href="https://x.com/dmfigol/status/2126025881844174968"><img src="/news/assets/t3-code-telemetry-controversy/x-figol.webp" alt="Dmitry Figol’s original X post introducing his account of the January 2025 dispute." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Figol’s post</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/MarsUniversityX/status/2126094666898743775"><img src="/news/assets/t3-code-telemetry-controversy/x-quote.webp" alt="Mars University’s standalone quote-post criticizing Browne in response to Figol’s account." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Quote-post</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/dmfigol/status/2126025885740626075"><img src="/news/assets/t3-code-telemetry-controversy/figol-archived-public-posts.webp" alt="Figol’s screenshots of Browne’s January 2025 posts to the security vendors." loading="lazy" decoding="async"><span class="dispatch-evidence-label">January posts</span></a>
</div>
<details class="dispatch-evidence-more">
<summary>8 more source screenshots</summary>
<div class="dispatch-evidence-grid dispatch-evidence-grid-more">
<a class="dispatch-evidence-tile" href="https://x.com/dmfigol/status/2126025889016094829"><img src="/news/assets/t3-code-telemetry-controversy/figol-published-dms.webp" alt="Figol’s screenshots of his direct messages with Browne." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Direct messages</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/dmfigol/status/2126025881844174968"><img src="/news/assets/t3-code-telemetry-controversy/figol-thread-and-reactions.webp" alt="An excerpt from Figol’s account followed by two replies about the public backlash." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Thread reactions</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/dmfigol/status/2126025881844174968"><img src="/news/assets/t3-code-telemetry-controversy/figol-more-public-replies.webp" alt="Two further replies to Figol, about a previous naming dispute and archiving the posts." loading="lazy" decoding="async"><span class="dispatch-evidence-label">More replies</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/sabotaj0707/status/2125506127156658580"><img src="/news/assets/t3-code-telemetry-controversy/x-followup.webp" alt="The complainant’s standalone follow-up crediting the fixes and questioning Browne’s public account." loading="lazy" decoding="async"><span class="dispatch-evidence-label">GDPR follow-up</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/thsottiaux/status/2122929634916679820"><img src="/news/assets/t3-code-telemetry-controversy/x-openai.webp" alt="Thibault Sottiaux’s post explaining that early reviewers tested a build that changed before release." loading="lazy" decoding="async"><span class="dispatch-evidence-label">OpenAI response</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/bebuu_ai/status/2126285889110454432"><img src="/news/assets/t3-code-telemetry-controversy/x-antigravity.webp" alt="Bebu’s November 27 standalone post challenging T3 Code’s assurances about Antigravity." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Antigravity post</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/DLKFZWilliam2/status/2124838130595643642"><span class="dispatch-evidence-translation" lang="en">“When someone forks your code under the MIT license, translates it and changes the UI, that’s a fork, not a knockoff.”</span><img src="/news/assets/t3-code-telemetry-controversy/x-william.webp" alt="William’s standalone post criticizing Browne’s treatment of a Chinese-language T3 Code fork." loading="lazy" decoding="async"><span class="dispatch-evidence-label">William · English excerpt</span></a>
<a class="dispatch-evidence-tile" href="https://x.com/realchendahuang/status/2125153472450527440"><span class="dispatch-evidence-translation" lang="en">“On March 6, T3 Code merged PR #174, adding PostHog telemetry that was enabled by default.”</span><img src="/news/assets/t3-code-telemetry-controversy/x-audit.webp" alt="Chen Dahuang’s audit post showing T3 Code telemetry code and configuration." loading="lazy" decoding="async"><span class="dispatch-evidence-label">Chen Dahuang · English excerpt</span></a>
</div>
</details>
</div>

The fork developer apologized and changed the name. T3 Code changed what it collected, but it could have taken a cue from the developer Browne had threatened. A direct apology would have started with what users were promised and why they should have been asked first.
