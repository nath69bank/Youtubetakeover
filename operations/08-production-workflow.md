# 8. AI production workflow: 1 long video + 3 Shorts in under 5 hours

*Output of prompt #8.*

## The weekly rhythm

| Step | When | Time | Output |
|---|---|---|---|
| 1. Topic research | Mon | 20 min | Chosen topic + search phrase + angle |
| 2. Script | Mon | 45 min | Script in the [001 format](../content/scripts/001-ai-for-small-business.md) |
| 3. Record | Tue am (or batch 2 on one day) | 60 min | Face cam + screen recordings |
| 4. Edit long video | Tue | 75 min | Final cut + captions |
| 5. Thumbnail + title | Tue | 20 min | 2–3 thumbnail options |
| 6. Publish | Tue 12:00 | 15 min | Live with description, pinned comment, end screen |
| 7. Shorts ×3 | Wed | 30 min | 3 vertical cuts, scheduled Wed/Fri/Sun |
| 8. Repurpose | Thu | 15 min | LinkedIn post, FB group post, newsletter snippet |
| 9. Data review | Mon | 15 min | [Weekly review](../templates/weekly-review.md) filled in |
| **Total** | | **~4h 55m** | |

**Batching tip:** once comfortable, record 2 videos in one session every other week.
That cuts setup time and gets you ahead of schedule.

---

## Tools for each step (free or low cost)

| Step | Recommended | Free alternative | How AI helps |
|---|---|---|---|
| Topic research | YouTube search autocomplete, Google "People also ask", YouTube Studio *Research* tab | Google Trends (UK filter), AnswerThePublic free searches | Claude: "Give me 10 search phrases UK business owners type about [topic]" |
| Competitor check | vidIQ or TubeBuddy (free tiers) | Manual: sort a channel by *Popular* | Paste competitor titles into Claude, ask for the gap |
| Scripting | Claude (with the context block in [prompts/](../prompts/README.md)) | Any LLM | Prompt #5 drafts; **you** rewrite in your own words |
| Teleprompter | Phone teleprompter app (free tiers) | Bullet points on a sticky note | n/a |
| Recording: face | Phone on a tripod (rear camera), window light | Laptop webcam | n/a |
| Recording: audio | USB or clip-on lav mic (~£20–£60) | Phone wired earphones mic | Noise removal in the editor |
| Recording: screen | OBS Studio (free) | Built-in: Win+G / macOS Screenshot | n/a |
| Editing | Descript (edit by text, removes filler words) | DaVinci Resolve or CapCut desktop (free) | Auto-transcribe, cut "ums", auto-captions |
| Captions | Editor auto-captions | YouTube auto-captions (always review!) | n/a |
| Thumbnails | Canva (free tier is fine) | Photopea (free) | Background removal; generate 3 layout options |
| Titles & description | Claude + [description template](../funnel/description-template.md) | n/a | Generate 10 titles, pick and edit 1 |
| Shorts | CapCut (auto-reframe + captions) | YouTube's "Edit into a Short" in Studio | Auto-captions, reframing |
| Scheduling | YouTube Studio | n/a | n/a |
| Repurposing | LinkedIn/Facebook native upload | n/a | Claude: "Turn this transcript into a LinkedIn post in my voice" |
| Analytics | YouTube Studio + [tracker.csv](../templates/tracker.csv) in Google Sheets | n/a | Prompt #10 analysis |

---

## Templates

- **Video brief** (fill in Monday): [templates/video-brief.md](../templates/video-brief.md)
- **Script structure**: [content/scripts/001](../content/scripts/001-ai-for-small-business.md)
- **Description + pinned comment**: [funnel/description-template.md](../funnel/description-template.md)
- **CTA lines**: [funnel/cta-scripts.md](../funnel/cta-scripts.md)
- **Weekly review**: [templates/weekly-review.md](../templates/weekly-review.md)

### Repurpose prompt (Thursday)

```
Here's the transcript of this week's video: [paste].
Write: (1) a LinkedIn post (150–200 words, first line is a hook, no hashtag spam,
UK English, my voice: practical and a bit dry, ends with a question);
(2) a 3-sentence Facebook group post that offers help without selling;
(3) a 60-word newsletter snippet with the video link.
Don't invent any facts, numbers or client names that aren't in the transcript.
```

---

## Quality checklist (before every publish)

**Content**
- [ ] The video delivers exactly what the title promises
- [ ] Hook states the problem + payoff in the first 15 s (no logo intro)
- [ ] At least one real example, screen recording or demo
- [ ] Pattern interrupt roughly every 60–90 s
- [ ] All facts checked; any prices/laws/tool terms have a date or "check current"
- [ ] No client named or shown without written permission
- [ ] No personal data visible on screen (blur emails, names, phone numbers)
- [ ] Says honestly where AI *doesn't* fit (where relevant)

**Technical**
- [ ] Audio clear, no echo (audio matters more than video)
- [ ] Captions reviewed for errors (especially place names and tool names)
- [ ] Thumbnail readable at phone size, max 4 words
- [ ] Title includes the search phrase near the start

**Funnel**
- [ ] One CTA, said out loud, matching the topic
- [ ] Description line 1 = CTA link with UTM tag
- [ ] Pinned comment posted
- [ ] End screen → next video + subscribe
- [ ] Added to the right playlist
- [ ] Related video set on each Short
- [ ] Row added to the tracker

---

## The originality rule ("human first, AI second")

YouTube's monetisation policy on **inauthentic content** (previously "repetitious
content") excludes mass-produced or repetitive videos, e.g. templated videos with
only small differences, or AI voice over stock footage with no real value added.
YouTube also requires creators to **disclose realistic altered or synthetic content**.

Our rule. Every video must pass **all four**:

1. **Real person:** your real face and/or your real voice. No AI avatar, no AI
   voiceover as the main presenter.
2. **Real experience:** at least one thing only Wirral AI could say: a client
   lesson, a local example, a build we did, an honest opinion.
3. **Real screen:** at least one genuine demonstration (a real tool, real site,
   real profile), not just stock footage.
4. **Rewritten by a human:** AI drafts the script; you rewrite it out loud in your own
   words before recording. If a line sounds like a LinkedIn bot, cut it.

Plus:
- Rotate the 5 formats (how-to, Fix It Live, teardown, test, opinion), never 3 of
  the same format in a row.
- Never re-upload the same video with a new title. Make a new, better video instead.
- If any AI-generated visual could be mistaken for real footage, tick YouTube's
  "altered or synthetic content" disclosure.
