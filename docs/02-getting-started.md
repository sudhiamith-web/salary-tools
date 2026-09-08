# Getting Started

## Two possible workflows

This project can be worked on two different ways, depending on what
access you have:

**Workflow A — Standard local development** (use this if you have a
normal computer with admin rights and can install software)

**Workflow B — No-admin-rights workflow** (use this if you're on a
locked-down machine, e.g. a managed corporate laptop, and can't install
Node.js or run command-line tools)

The current maintainer uses Workflow B. Both are documented below.

---

## Workflow A: Standard local development

### Prerequisites
- [Node.js](https://nodejs.org) 18 or later
- A code editor (VS Code recommended)
- Git

### Setup

```bash
git clone <repository-url>
cd salary-tools
npm install
cp .env.local.example .env.local
# Fill in the values in .env.local — see 04-environment-variables.md
npm run dev
```

Open `http://localhost:3000`. You should see the homepage with all live
tools listed.

### Making a change

```bash
# Edit files as needed
npm run dev          # verify the change locally
git add .
git commit -m "Describe the change"
git push origin main  # triggers an automatic Netlify deploy
```

---

## Workflow B: No admin rights on your local machine

If you can't run `npm install` or any command-line tool locally, you
have two options:

### Option 1: GitHub Codespaces (recommended)

GitHub Codespaces gives you a full cloud development environment —
including a terminal, Node.js, and a live preview — running entirely in
your browser. Nothing installs on your local machine.

1. Go to the repository on github.com
2. Click the green "Code" button → "Codespaces" tab → "Create codespace
   on main"
3. Wait for the environment to build (a few minutes the first time)
4. You'll get a full VS Code interface in your browser, with a terminal
   at the bottom
5. Run `npm install` then `npm run dev` in that terminal — Codespaces
   will show you a preview link
6. Make your changes, then use the Source Control tab (or `git` commands
   in the terminal) to commit and push — this happens on GitHub's
   servers, not your local machine, so no admin rights are needed

Free tier: 60 hours/month, which comfortably covers part-time work on a
project this size.

### Option 2: Direct GitHub web upload (no live preview, higher risk)

Only use this if Codespaces isn't available. You edit files locally in
any plain text editor (no execution needed), then:

1. Go to the repository on github.com
2. Navigate to the file you want to change, click the pencil (edit) icon
   — this lets you edit single files directly in the browser
3. For multiple new files: use "Add file" → "Upload files" and drag them
   in
4. Commit directly to the `main` branch (or open a pull request if you
   want a review step)

**Important — the mistake that cost real time before:** when uploading a
new project or a folder of files, always upload the **contents** of the
folder to the repository root, never the folder itself as a subfolder.
If GitHub shows a nested folder (e.g. `salary-tools/package.json`
instead of `package.json` at the root), Netlify's build will fail to
find `package.json` and error out. Always verify the repo root directly
contains `package.json`, `app/`, `lib/`, etc.

**Limitation of this option:** you cannot preview your changes before
they go live, since there's no local dev server. Every change goes:
edit → commit → wait for Netlify build → check the live site. This is
strictly worse than Codespaces for anything beyond a one-line text fix —
prefer Codespaces for real feature work.

---

## Verifying your setup works

Regardless of workflow, after any setup:

1. Confirm you can view the homepage and it lists calculators
2. Open any tool page (e.g. `/tools/gratuity-calculator`) and confirm
   the sliders and result card respond to input changes
3. Confirm `/blog` and `/news` load without errors (they'll show "no
   posts yet" if Sanity isn't configured in your environment — that's
   expected, not a bug, if `NEXT_PUBLIC_SANITY_PROJECT_ID` isn't set)

## Common first-change tasks

| I want to... | Read this |
|---|---|
| Fix a typo or wording in an existing tool | Just edit the relevant `app/tools/<slug>/page.tsx` file |
| Add a new calculator | `09-adding-a-new-calculator.md` |
| Change a color or the design system | `07-design-system.md` |
| Publish a blog post | `06-content-management-cms.md` — this does NOT need this workflow at all, just go to `/studio` on the live site |
| Deploy my change | `03-deployment.md` |
