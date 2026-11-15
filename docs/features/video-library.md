# Video library

Moved from CLAUDE.md section 5. Update this file when the feature changes.

**📺 Video library** (`homeWatch`, `screenVideo`): level filter; catalogue videos are `VIDS` items **with** an `id`;
channel recommendations are `VIDS` items **without** an `id` (they open YouTube). User videos are stored in
`S[lang].videos` (title, id, level). The in-app player uses the YouTube IFrame API (`loadYT`): speed
(`setPlaybackRate`), back 5 seconds, section loop between a start and an end point, and synced subtitles when the
video has a `transcript`. Watched state: `videos[].watched` and `S[lang].videosWatched` for catalogue videos.
