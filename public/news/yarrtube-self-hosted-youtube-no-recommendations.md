# Yarrtube replaces YouTube recommendations with a feed you choose

Paying for YouTube Premium removes ads, but it does not change how the home feed chooses what to play next. **Yarrtube**, an open-source project by software engineer Sergi González, takes a different approach: run a small service at home, choose YouTube channels or playlists, and watch their videos in a simple web interface or a media server such as Plex or Jellyfin.

## The algorithm is the product decision

Recommendation systems rank videos using signals about what a viewer might watch next. That can help people discover new channels, but it also means the feed is selected by a system optimising for continued viewing, rather than only by the viewer's subscriptions.

Yarrtube removes that ranking step from its own viewing flow. You add the channels and public playlists you want; it checks them for new uploads and downloads those videos to your own storage. The list is therefore based on **what you chose to follow**, not a prediction about what might keep you watching.

For a household, that changes the default. A child can open a curated set of channels without a recommendation column or autoplay leading to something nobody selected. Adults can use the same setup to keep a watchlist of tutorials or creators together. The project does not change YouTube's recommendation system; it creates a separate library from selected uploads.

## Your server keeps the library in sync

Yarrtube is written in **Rust** and is designed to run as a Docker service on a NAS, though it can also run on a laptop. It uses YouTube's API to check tracked channels and playlists, then calls `yt-dlp` to fetch video files and thumbnails. Its web app presents the local collection on desktop and mobile, and integrations can organise it in Plex, Kodi, or Jellyfin.

The service checks tracked channels on a schedule, so new uploads appear after the next sync and download. That makes Yarrtube closer to a personal video library than a replacement YouTube client: videos take up disk space, the owner maintains the server, and playback depends on the local setup.

## A smaller feed means more control and more upkeep

Yarrtube's appeal is the choice it removes from an opaque recommendation feed: **you select the sources, and the service mirrors their uploads**. You give up discovery features and take on storage, setup, and ongoing compatibility work as YouTube changes. Its creator describes it as a personal project for an ad-free, no-algorithm library, not a full-featured archive manager.

If the goal is to keep videos from a chosen set of channels available at home, that trade can be useful. Yarrtube does not make YouTube behave differently; it gives a household control over which videos enter its own library.

Sources: [Yarrtube project and setup](https://github.com/sergigp/yarrtube), [architecture and channel sync](https://github.com/sergigp/yarrtube/blob/main/doc/ARCHITECTURE.md), [installation guide](https://github.com/sergigp/yarrtube/blob/main/doc/INSTALLATION.md).
