# Content Management (Blog & News)

This covers publishing and editing Blog and News content — a completely
separate workflow from editing calculator code. **No developer skills,
GitHub access, or deployment step is needed for anything in this
document.**

## The core idea

Blog and News posts are written and published through **Sanity Studio**,
a content editor embedded in the site itself at `salary-tools.com/studio`.
When you click "Publish" in Studio, the change appears live on the
public site within seconds — there is no build, no deploy, and no
developer involvement required.

## How to publish a post

1. Go to `salary-tools.com/studio` and sign in with the Sanity account
   (see `05-third-party-services.md` for account details)
2. Click "Post" in the left sidebar, then the "+" button to create a new
   one (or click an existing post to edit it)
3. Fill in the fields:
   - **Title** — the post's headline
   - **Slug** — the URL segment (e.g. a post titled "New Tax Slabs
     Explained" might have the slug `new-tax-slabs-explained`,
     appearing at `salary-tools.com/blog/new-tax-slabs-explained`).
     Click "Generate" to auto-create this from the title, or set it
     manually
   - **Category** — choose "Blog" or "News". This determines whether
     the post appears at `/blog` or `/news` — they're otherwise
     identical in structure
   - **Cover image** — optional, shown on listing cards and the post
     page
   - **Excerpt** — a short summary (max 200 characters), shown on
     listing cards and used as the page's SEO description
   - **Body** — the main content. Supports headings, bold/italic text,
     bullet and numbered lists, links, block quotes, and inline images
   - **Author name** — defaults to "Salary-Tools Team"; change if
     appropriate
   - **Published at** — defaults to now; can be backdated or scheduled
     to a future date if needed (note: a future date does NOT
     automatically delay visibility — see the caveat below)
4. Click **Publish** (not just "Save" — an unpublished draft won't
   appear on the live site)
5. Check `/blog` or `/news` on the live site within a few seconds to
   confirm it appears

## Caveat: "Published at" is a display date, not a release schedule

Setting a future "Published at" date does NOT hide the post until that
date — it only controls how the date is displayed and how posts are
sorted. If you want to hold a post back, don't click Publish until
you're ready to release it.

## Editing or unpublishing a post

- **Editing:** open the post in Studio, make changes, click Publish
  again. The live site updates within seconds.
- **Unpublishing:** Sanity Studio doesn't have a one-click
  "unpublish" — to remove a post from the live site, either delete it
  entirely (Studio's document menu → Delete) or change its Category to
  something that isn't displayed (not recommended, since there's
  currently no "draft"/"hidden" category built in). For a true draft
  workflow, ask a developer to add a "status" field to the schema (see
  `sanity/schemaTypes/post.ts`) — this doesn't exist today.

## Writing guidance for accuracy

Any post referencing tax rates, exemption limits, or other statutory
figures should be checked against a current, authoritative source before
publishing — Indian tax law changes at least annually with the Union
Budget. Do not copy figures from other websites without independent
verification; see `08-calculators-reference.md` for the verification
standard already applied to the calculators themselves, which should
extend to written content too.

## Technical reference (for developers)

- **Content model:** `sanity/schemaTypes/post.ts` — defines exactly what
  fields a post has. To add a new field (e.g. "tags"), edit this file
  and deploy — this is the one part of content management that DOES
  require a code change and deployment.
- **How pages fetch content:** `lib/sanity/queries.ts` contains the GROQ
  queries used by `/blog`, `/news`, and their `[slug]` detail pages.
- **How instant publishing works:** Sanity calls a webhook at
  `/api/revalidate` (see `app/api/revalidate/route.ts`) whenever a post
  is created, updated, or deleted. That endpoint tells Next.js to
  refresh only the specific pages affected — no full rebuild. See
  `04-environment-variables.md` for the webhook secret configuration
  this depends on.
- **If publishing stops working** (posts don't appear after clicking
  Publish): check Sanity dashboard → API → Webhooks → your webhook →
  delivery/attempt log for errors. A common cause is a mismatched
  `SANITY_REVALIDATE_SECRET` between Sanity's webhook config and
  Netlify's environment variables.
