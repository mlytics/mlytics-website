<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI work in this repo

- Before any UI change, read `DESIGN.md` in full. It is the single source of truth for tokens, components and page templates. Storybook (`npm run storybook`) only illustrates it.
- If `DESIGN.md` does not cover your case: stop and tell the user what is not covered, which existing page you plan to follow, and which values you will use. Start only after they confirm, and add the new rule to `DESIGN.md` when done.
- `/ai-mode-playground/` is an exception. Never copy its type sizes or spacing.
- A PR that changes the design system (`app/site-base.css`, `components/ui/`, `components/layout/`, a new shared component or token) must update `DESIGN.md` and Storybook in the same PR. When a fix ticket listed in `DESIGN.md` §10 is done, delete its row and remove it from the affected entries in `stories/_data/registry.ts`; when an entry has no tickets left, switch it to `rendered` and add its story.
- `npm test` runs a design guard (`__tests__/design-guard/`): no hard-coded colours, no transparency outside the two DESIGN.md bases and alpha ladder, no arbitrary values for spacing, type or colour. Fix the code when it fails. Never add entries to `pending/` for new code; when a fix ticket lands, delete its now-fixed entries (the test reports them as stale).
