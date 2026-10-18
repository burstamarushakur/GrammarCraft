# English Quest RPG — SK Sungai Abong

**A brand new game, not a replacement for GrammarCraft.** Project root is `rpg/` inside the GrammarCraft GitHub repository. In Vercel select the `rpg` root directory, preset **Other**, and output directory `public`. Existing GrammarCraft app files and progress are untouched.

## Game

A real, keyboard-and-touch-controlled 24 × 16 tile top-down fantasy adventure world. Pupils pick class and their own name, select an avatar, walk around trees and a river, cross the bridge, speak to 8 NPCs, answer 5 English questions per quest and restore 8 crystals. Grade-specific banks provide **40 questions for each of Years 1–6** (240 original items), aligned with the chosen DSKP grammar themes. Quest rewards are one-time XP/coins; answers are checked server-side.

12 classrooms: 1K,1S,2B,2K,2S,3B,3K,4B,4K,5S,6B,6S. 1K belongs to Mohd. Sukhairi bin Osman for this game, has 37 current pupils on 18 October 2026 and follows Year 1 beginner difficulty. Other classroom allocations and difficulty categories follow the original GrammarCraft 2026 roster. Classes and current pupil names are loaded from the existing school's Supabase `classes`, `students`, and `student_enrolments` tables, **not** from an invented list. Game uses the 2026 academic session and current enrolments. The original GrammarCraft's 337 pupils are not modified.

## Teacher area

Sign in with the 12-digit IC recorded in school `teachers.identification_hash`. Each of the original five teachers sees only their authorised classes, with 1K newly assigned to Sukhairi within English RPG. Server verifies IC, rate-limits login and uses expiring random teacher-session tokens. View completion status, first-try correct, XP, wrong attempts, mission detail, refresh every 15 seconds, download safe CSV, and reset one pupil at a time. Teacher sessions stay in sessionStorage and IC numbers are never saved in the browser.

## Storage/security

The separate Supabase Edge Function is `english-rpg-api` and its independent schema is `server/migration.sql`. No changes to `grammarcraft_*` data or SPBT tables. Student progress is recorded server-side per answered question and guarded with optimistic revision checks; repeating a solved question never increases rewards; teacher reset revokes pupil sessions. Anonymous pupils may choose their names from the class list, matching GrammarCraft's non-password pupil flow. As with GrammarCraft, name selection is identification for practice rather than strong student authentication.

Internal question answers are stored in `server/bank.json` and deployed into the Edge Function, not in the publicly served Vercel `public` folder. The public app only receives options and feedback from the server.

## Project files

- `public/index.html` — accessible landing page
- `public/style.css` — mobile and desktop pixel-inspired RPG UI
- `public/app.js` — game world, movement, quests and teacher dashboard
- `server/bank.json` — curated question bank (8 × 5 questions × 6 years)
- `server/edge.ts` — authenticated Supabase backend
- `server/migration.sql` — additive backend migration
- `vercel.json` — static Vercel build target

© Cikgu Asraf – SK Sg Abong English Panel.