# Cloudflare Quick Tunnels take localhost to the internet

There is a developer rite of passage: build your first website, proudly send someone `localhost:3000`, and wait for the compliments. They get a connection error. You reply, “But it works on my machine.”

Cloudflare Quick Tunnels give that joke a better ending. The TryCloudflare service puts a local web app behind a shareable HTTPS address on `trycloudflare.com`, without buying a domain or setting up DNS.

The project stays on your machine. The link gets to leave it.

## From local demo to public link

With Cloudflare's `cloudflared` tool installed and the app running, one command starts the tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

The terminal prints a randomly generated public URL. Send that address—not the localhost one—and someone on another network can open your app. There is no separate build upload in this workflow: Cloudflare forwards requests to the server you already have running.

That makes the feature particularly handy in the messy middle of building something. A layout is ready for feedback, a prototype needs a second pair of eyes, or a teammate wants to try a flow before it reaches staging. The conversation can move from “here is a screenshot” to “try clicking it.”

For developers sharing work on social media, that distinction matters. A screenshot shows what a project looks like; a working demo lets people explore it. A temporary tunnel can serve that short-lived demo while you are around to keep it running.

## Less setup, faster feedback

The appeal is not that localhost suddenly means something different. It is that the gap between “working here” and “look at this” gets smaller. You can keep editing locally while a reviewer checks the app in their own browser, instead of turning every small review into a deployment task.

Cloudflare positions Quick Tunnels for development and testing, with no uptime guarantee. Keep the local server and tunnel running for the demo, and share only an app you intend to make public.

The beginner who sent a localhost link had the right idea: finish something, send a link, let people see it. Cloudflare supplies the missing part—the link that works outside your machine.

Source: [Cloudflare Quick Tunnels documentation](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/).
