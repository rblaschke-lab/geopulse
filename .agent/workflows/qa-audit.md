---
description: Run an automated visual QA audit using the browser subagent to evaluate aesthetics, layout overlaps, and adventure branding.
---

# Worldview Quality Assurance Workflow

This workflow spins up the browser subagent to visually inspect the Worldview Command Center, ensuring that there are no CSS overlaps, verifying correct scaling, and assessing the "Professional Adventure" aesthetic.

// turbo-all
1. Start a local development server in the background (if not already running) on port 8080.
```bash
npx http-server ./ -p 8080 -s
```

2. Invoke the `browser_subagent` tool with the following task:
"Navigate to http://localhost:8080. Maximize the window. Visually inspect the layout of the Worldview Command Center. Check specifically for:
  a) UI Overlaps (Ensure the bottom ticker does not collide with branding text or the Artemis HUD).
  b) Professionalism (Ensure terminal windows and typography remain sharp and perfectly aligned).
  c) Adventure/Tactical Branding (Evaluate the dark-mode contrast, the neon blue/amber usage).
Take a full-page screenshot. Identify any gaps or visual bugs and return a short prioritized list of UI/CSS improvement suggestions to the main agent."

3. Read the subagent's report. Provide a summary to the user outlining any identified UI gaps, and optionally propose an implementation plan to fix them.
