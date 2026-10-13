# Instructions for AI agents

A public teaching site for the Pickett N909-ES slide rule, deployed on Netlify from `main`. Plain HTML, CSS and JavaScript; no build step and no frameworks unless a job says otherwise.

## Rules
- Never commit to `main`; work in a branch and open a pull request.
- Start every pull request description with `## For Tom`: two or three plain sentences on what changed and how to see it. Write "safe to merge" only if nothing needs Tom's decision; otherwise ask the question with options.
- **Never break the live site.** New work goes on new pages or behind a switch until Tom approves the swap.
- Include **screenshots** (desktop and phone width) of anything visual in the pull request.
- Math must be exact: scale positions come from formulas, and tests prove it. Don't eyeball.
- Keep Derek Ross's credit lines while his artwork is used.
- Small, finished steps beat one big rewrite. If a job is too big, finish a working part and say what's left.
- **Netlify credits:** every deploy of `main` costs credits. Bundle your work into one pull request per job; never push to `main` directly.
