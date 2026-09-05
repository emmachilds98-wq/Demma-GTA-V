# The weekly refresh

`week.json` is the only file that changes week to week. The app fetches it on
every load, when it comes back to the foreground after ten minutes, and when you
tap ↻. Nothing else needs to be rebuilt or redeployed for a new week to appear.

## When it changes

GTA Online resets **Thursday at 10:00 UK time**. A scheduled routine runs shortly
after and commits the new week straight to `main`.

If the routine misses a week the app says so rather than passing the old week off
as current: the line under the date turns amber and reads *"This is the … board.
The new week started on … and has not been pulled in yet."* That amber line is the
signal that `week.json` needs a manual update.

## Shape

```jsonc
{
  "wkKey":   "2026-09-10",              // date of the NEXT Thursday reset
  "updated": "2026-09-05T08:00:00Z",    // when this file was written
  "current": {
    "week_label": "3 – 9 September 2026",
    "headline":   "One sentence, the thing worth knowing.",
    "summary":    "Two sentences on what to actually do.",
    "source_url": "https://www.rockstargames.com/newswire",
    "bonuses":   [{"title": "", "detail": "", "tag": ""}],
    "claims":    [{"title": "", "detail": "", "tag": ""}],
    "discounts": [{"name": "", "price": ""}],
    "gun_van":   "One line."
  },
  "history": [{"wkKey": "", "stamp": 0, "wk": { /* same as current */ }}]
}
```

`wkKey` is the date of the **next** reset, not the current one — it has to match
what `weekKey()` in `index.html` computes, or the app will think the file is
stale. For the week of 3–9 September, `wkKey` is `2026-09-10`.

`tag` is the small coloured badge. Keep it to two or three words (`All week`,
`Free $1M`, `GTA+ only`, `Weekend`) or leave it empty. `stamp` is the reset
timestamp in epoch milliseconds; only the ordering matters.

## Updating it by hand

1. Move the outgoing `current` into the end of `history`, wrapped as
   `{"wkKey": <its old wkKey>, "stamp": <reset epoch ms>, "wk": <the old current>}`,
   and change its wording to past tense.
2. Write the new week into `current` and set `wkKey` to the next reset date.
3. Check it parses: `python3 -c "import json;json.load(open('week.json'))"`.
4. Commit to `main`. That is the whole deploy.

Only ever put sourced figures in. If a number cannot be confirmed, describe the
thing without the number — the board is used to decide what to play, so a wrong
payout is worse than a missing one.

The static copy of the week inside `index.html` is the offline fallback for a
first-ever load with no network. It does not need updating every week; if you do
refresh it, bump `BAKED_WEEK` in the same file to match.
