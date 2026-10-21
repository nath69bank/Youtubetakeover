# 10. Weekly and monthly review system

*Output of prompt #10.* Small weekly fixes add up. Repeat what wins and drop what doesn't.

- **Weekly (Monday, 15 min):** [templates/weekly-review.md](../templates/weekly-review.md)
- **Monthly (first Monday, 45 min):** [templates/monthly-review.md](../templates/monthly-review.md)
- **Data:** [templates/tracker.csv](../templates/tracker.csv), one row per video

Where to find the numbers: **YouTube Studio → Analytics → Advanced mode**, set the
date range to the last 7 or 28 days.

---

## What each number means (and what's good at our size)

Benchmarks are for a small, specialist B2B channel (under ~2,000 subscribers).
Compare against **your own last 5 videos** more than against these.

| Number | What it means | 🔴 Fix it | 🟡 OK | 🟢 Good |
|---|---|---|---|---|
| **Impressions** | Times your thumbnail was shown | Falling 3+ weeks | Flat | Rising |
| **Impressions CTR** | Did people click when they saw it? | < 3% | 3–6% | > 6% |
| **Average view duration** | How long people watch | < 25% of length | 25–40% | > 40% |
| **Retention at 30 s** | Did the intro keep them? | < 50% | 50–65% | > 65% |
| **Retention shape** | Where they leave | Steep drop early | Steady decline | Flat line or bumps (rewatches) |
| **Subscribers gained / 1,000 views** | Did they want more? | < 3 | 3–8 | > 8 |
| **Traffic source: Search** | Found through search | < 20% | 20–40% | > 40% (early on) |
| **Traffic source: Browse + Suggested** | YouTube recommending you | Near 0 after 2 months | Growing | > 40% |
| **Returning viewers** | Building an audience | < 10% | 10–25% | > 25% |
| **Engagement (likes + comments / views)** | Did it spark a reaction? | < 2% | 2–5% | > 5% |
| **Description link clicks / views** | Did the CTA land? | < 0.5% | 0.5–2% | > 2% |
| **Leads (downloads + WhatsApp + calls)** | **The point of the channel** | 0 for 4 weeks | 1–2/week | 3+/week |

### Which to fix first (always this order)

1. **CTR** (no clicks = nothing else matters) → titles & thumbnails
2. **Retention in the first 30 s** → hooks & intros
3. **Mid-video retention** → pacing, pattern interrupts, cut length
4. **Subscribers per view** → series, "why subscribe" line
5. **Lead conversion** → CTA wording, lead magnet match, landing page

---

## Retention graph: what the shapes mean

| Shape | Meaning | Fix |
|---|---|---|
| Cliff in first 10 s | Thumbnail/title promised something the intro didn't deliver | Open with the promised thing immediately |
| Steady slide | Normal, but long sections without change | More pattern interrupts, tighter edit |
| Sudden drop mid-video | A boring/confusing section, or viewers got what they came for | Cut that section; move the payoff later |
| Bump (line goes up) | People rewinding: something valuable or confusing | If valuable, make a Short of it. If confusing, explain better next time |
| Big drop at end-screen time | Normal | Start the end screen ~20 s before the end, keep talking over it |

---

## Finding patterns in your best videos (monthly)

Sort the tracker by **leads** first, then **views**. For the top 3, write down:

- Pillar · format · title pattern · thumbnail style · length · search vs browse share ·
  hook type · CTA used.

Look for what repeats. Examples of patterns to watch for:
- "Fix It Live" videos bring fewer views but more leads → do one every month.
- Titles starting with "Why your…" beat "How to…" on CTR → use more.
- Local place names in titles get more search traffic → add them.
- Website/SEO topics bring more WhatsApp chats than AI topics → shift the mix.

Then **make 2 more videos** in the winning pattern next month, and **drop** any
pattern that's been bottom-3 for 2 months running.

---

## Improving the 3 weakest videos (monthly)

Pick the 3 lowest by **CTR × retention** (ignore videos under 14 days old).

| Diagnosis | Fix | How |
|---|---|---|
| CTR < 3% | **New title + thumbnail** | Use *Test & Compare* with 2 new thumbnails. Rewrite title around a search phrase or a sharper outcome. Example: "Google Business Profile Tips" → "Why You're Not Showing Up on Google Maps" |
| Retention cliff in first 30 s | **New intro** | You can't re-edit a published video much, so: trim the start in YouTube Studio's editor (trim is allowed), or remake it as a new, better video and link the old one to it |
| Good retention, no leads | **New CTA** | Update description line 1 + pinned comment with a better-matched offer. Add a card at the moment the topic peaks |
| No impressions at all | **Retopic** | The topic has no demand in that wording. Add the video to a playlist with a stronger video; remake later with a searched phrase |

Log every change in the tracker's `notes` column with the date, so you can tell if it worked.

---

## Ready-to-paste analysis prompt

```
[Paste the context block from prompts/README.md]

Here are my YouTube numbers for [week/month]:
[paste tracker rows or Studio export]

1. Tell me in plain English what changed versus last period and why it likely happened.
2. Rate each video 🔴/🟡/🟢 on CTR, retention, subscribers per 1k views and leads,
   using the benchmarks in my review system.
3. Tell me the ONE thing to fix first this week.
4. Find patterns across my top 3 videos by leads.
5. For my 3 weakest videos, give me 3 new title options, 2 thumbnail concepts
   (max 4 words) and a rewritten 15-second hook each.
Don't invent numbers I haven't given you.
```
