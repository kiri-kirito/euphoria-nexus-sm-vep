<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Strict Verification Protocol
You MUST follow this protocol for every task, without exception, to ensure alignment with project blueprints:

1. **Pre-Task Review**: Before starting any task (especially planning or execution), you MUST proactively find and read all relevant `.md` documentation files (e.g., `REQUIREMENTS_AND_PROCESS.md`, `PROJECT_UPDATE.md`, etc.) to ensure your actions align with the established architecture and requirements. Do not make assumptions.
2. **Post-Task Verification**: After completing the task, you MUST re-read the relevant documentation to confirm no edge cases or requirements were missed.
3. **Browser Testing**: You MUST use your browser subagent capabilities to physically verify that all UI features, buttons, and flows related to your changes work correctly in the browser. 
4. **Git Version Control**: After successfully verifying any code changes, you MUST automatically commit those changes to Git with a descriptive message. (If a remote branch is configured, push the changes as well).
5. **Reporting**: You must explicitly report the results of your browser testing and confirm the Git commit to the user when concluding your turn.
