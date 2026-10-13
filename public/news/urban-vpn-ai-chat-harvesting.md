# Urban VPN AI chat collection: what happens and how it works

**Urban VPN Proxy was reported to copy users' AI conversations from their browser.** Koi Security's December 2025 investigation linked the collection to marketing analytics and the affiliated data broker BiScience. The concern is the browser extension's access to chat pages, rather than the VPN connection itself.

## What happens with the affected extension installed?

According to Koi, when someone opened ChatGPT, Claude, Gemini or another targeted service, the affected extension copied their prompts and the chatbot's replies. It also collected conversation identifiers, timestamps and information about the AI service, then uploaded the data to Urban VPN's servers.

The chat could continue normally while a separate copy left the browser. Anything included in those messages could therefore be included in that copy.

Koi reported that disconnecting the VPN or switching off its AI warnings did not stop collection. These findings describe the versions investigated in 2025, not a test of today's extension.

## What enabled the collection?

Koi traced the functionality to **version 5.5.0, released on July 9, 2025**. The extension inserted scripts into supported chat pages. Those scripts intercepted the browser functions carrying messages to and from the AI service, extracted the conversation and passed it to the extension for upload.

This access happens inside the browser, where messages are already readable. Encrypting the connection does not prevent installed code with access to that page from copying its contents.

Koi's [investigation, preserved by the AI Incident Database](https://incidentdatabase.ai/reports/6825/), describes the code and the data-sharing policy behind its marketing-use findings.

## What Urban VPN says

In its [December 18 response](https://www.urban-vpn.com/blog/setting-the-record-straight-how-urban-vpns-ai-protection-feature-actually-works/), Urban VPN disputed default collection. It said AI processing required explicit opt-in, could be disabled independently of the VPN, and filtered personal or sensitive information.

That leaves a disagreement over consent and controls. The practical distinction is still important: disconnecting a VPN changes the network connection; disabling or removing its browser extension removes the extension's access to the page.
