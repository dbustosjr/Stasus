# Stasus — Product Requirements Document v1
### AI-powered vestibular symptom management, built software-first
**Status:** Ready for build
**Author:** Dave Bustos (@DaveBustosJr)
**Last updated:** July 2026

---

## 1. Mission & Problem Statement

Stasus helps people with vestibular symptoms — diagnosed with PPPD, BPPV, vestibular migraine, another condition, or undiagnosed and simply experiencing symptoms — reduce those symptoms and reclaim as much of a normal life as possible, whether that recovery ends up partial or complete.

**The problem:** vestibular disorders affect an estimated 33 million adults in the US, with PPPD alone accounting for roughly 15-20% of chronic dizziness cases — yet no dedicated software product exists that combines condition-specific rehab exercises, trigger tracking, and the psychological (hypervigilance/anxiety) component that keeps chronic dizziness self-perpetuating. Existing options are either generic gamified balance apps built for older adults with no anxiety component, or narrow clinic-only prescription products (Vertidisan) with no consumer on-ramp.

**Founder-market fit:** built by someone who has these symptoms, has already built and demoed a working visual-stimulation prototype, and is the target user, not a researcher studying one from outside.

---

## 2. Scope

### In scope for v1
- Evidence-based, condition-mapped vestibular rehab exercise library (habituation, gaze stabilization, balance training, BPPV canalith repositioning)
- Webcam-based exercise form tracking (MediaPipe, client-side)
- Symptom & trigger tracker (hybrid presets + custom, notes, severity/duration)
- Hypervigilance & anxiety reduction module (psychoeducation, CBT-style reframing, grounding tools)
- AI Assistant (Claude API) — weekly pattern insights, exercise recommendations, red-flag escalation
- Web app / PWA, light + dark mode, full Stasus brand system
- General-wellness positioning (no diagnostic or treatment claims)

### Explicitly out of scope for v1
- EEG/BCI hardware integration (Phase 2 — see Section 9)
- Native mobile app (Phase 2, driven by Web Bluetooth limitations, not by exercise needs)
- Clinic/Care Team multi-practitioner workspace (Phase 3 — post-traction)
- FDA 510(k) clinical-use version (Phase 3 — post-traction, post-outcome-data)
- Diagnosis, treatment planning, or medication guidance of any kind, at any phase, without a licensed clinical partner

---

## 3. Target Users

- **Primary:** adults 18-65 with vestibular symptoms, spanning diagnosed PPPD/BPPV/vestibular migraine patients, undiagnosed symptomatic users, and people managing lingering symptoms after an acute vestibular event (neuritis, concussion, BPPV episode).
- **Age distribution matters for content weighting, not gatekeeping:** PPPD and vestibular migraine cluster more in the 30-50 range; BPPV skews toward 40+; younger users (18-30) more often present with vestibular-migraine-adjacent or general dizziness symptoms without a clean diagnosis. The app serves all of them through the same symptom-first flow — content emphasis, not access, is what shifts by profile.
- **Secondary (Phase 3):** PTs and vestibular specialists using Stasus as a home-practice extension of in-clinic care.

---

## 4. Regulatory & Compliance Framing

Stasus operates today as a **general wellness product under the FDA's General Wellness Policy** — no diagnose/treat/cure/mitigate/prevent claims, no SaMD classification, no premarket clearance required to ship. This is a proven path, directly confirmed by Sync/Coglix Labs (Founders Inc-backed, same positioning, same regulatory stage).

**Staged regulatory roadmap:**
1. **Now:** general wellness tool, symptom-first, no diagnostic claims.
2. **Post-traction:** pursue FDA 510(k) clearance for a clinical-use version, once real usage and outcome data exist to support submission.
3. **Post-clearance:** Remote Therapeutic Monitoring (RTM) billing eligibility under CPT codes 98975, 98976, 98977, 98980, and 98981 — the concrete mechanism for clinics/insurers to pay for patient use of Stasus at home.

**Data privacy is not primarily a HIPAA question at this stage** (HIPAA governs covered entities and business associates; a standalone consumer app generally isn't one) — the real obligations are (a) FDA claims-language discipline, and (b) state health-privacy laws (Washington's My Health My Data Act, California's CMIA/CCPA sensitive-data provisions), which cover any health data collected, symptom logs included, regardless of diagnostic framing. **Design principle: handle all health data — symptom, trigger, or eventual diagnosis label — under one consistent privacy-by-design standard from day one**, not a tiered approach based on data type.

---

## 5. Brand & Design System

**Name:** Stasus. **Logo:** dual-teal "S" mark wrapping a soft aqua accent and warm gold center — reads as both wordmark initial and a stylized eye/balance symbol.

| Token | Hex | Primary use |
|---|---|---|
| Deep Teal | `#014152` | Headings, primary buttons, nav |
| Secondary Teal | `#056179` | Hover states, active tabs, chart lines |
| Soft Aqua | `#7FB8B1` | Progress indicators, calm states, completion |
| Warm Gold | `#E59B35` | Milestones only — never warnings |
| Mist White | `#FFFFFF` | Primary background (light mode) |
| Soft Surface | `#F6FAFA` | Cards, panels |
| Cool Border | `#DDEBEC` | Dividers, input outlines |

Dark mode: deep blue-green base (`#001219`/`#062A34`), not true black; aqua becomes the dominant accent (glows against dark background); gold stays sparing in both modes.

**Typography:** Manrope — 700 headings, 400-500 body, 600 buttons, 500 labels.

**Direction:** minimal, calm, rounded, spacious, low-motion, trust-building. This is a direct expression of the product's core clinical design principle, not a separate track — see Section 7's motion-safety requirement.

---

## 6. Core Features

### 6.1 Onboarding
Symptom-first, exploration-driven, no diagnosis required. Diagnosis sharing is fully optional and framed neutrally ("what are you experiencing" / "have you been told you have a specific condition, if you'd like to share") — captures personalization value without diagnostic-claim language. Onboarding routes users toward relevant exercise categories based on reported symptom pattern, not a required condition label.

### 6.2 Exercise library
Built on the real clinical VRT structure, not a single generic routine:

| Category | Indication | Delivery |
|---|---|---|
| Habituation | Motion- or visually-provoked dizziness (PPPD, general motion sensitivity) | Progressive visual-stimulation exposure, intensity increases over time |
| Gaze stabilization (VOR) | Gaze instability from reduced VOR gain (vestibular neuritis, hypofunction, post-concussion) | Webcam iris-tracking confirms correct eye-target tracking |
| Balance training | Postural control, fall-risk reduction, broad applicability | Progressive stance/surface difficulty |
| Canalith repositioning (BPPV) | BPPV specifically, ~80% cure rate as a maneuver, not ongoing exercise | **Separately flowed UX** — clearly labeled as a different intervention type than the other three, with guidance to confirm with a clinician |

PPPD-specific guidance combines education, habituation exercises, and the hypervigilance module below — matching current clinical practice guidance for the condition.

### 6.3 Symptom & trigger tracker
- **Preset trigger categories:** weather/temperature, specific foods, sedentary time, sleep quality, stress level, visually busy environments.
- **Custom trigger field** — user-defined, unlimited.
- **Free-text notes field** on every entry.
- **Severity + duration** per entry, feeding pattern analysis.
- **Phase 2 stretch:** automated weather-data correlation via API, replacing manual weather tagging.

### 6.4 Hypervigilance & anxiety reduction
Psychoeducation on the fear-avoidance cycle, breathing/grounding tools, CBT-style reframing targeted specifically at symptom-checking behavior — cross-linked to tracker spikes and exercise sessions, not a standalone content library.

### 6.5 AI Assistant
Reads tracker history, exercise adherence, and logged triggers to surface pattern-level insight and recommendations on a **weekly cadence, not reactive per-entry** — reactive feedback risks reinforcing the hypervigilance loop the product exists to reduce.

**Model architecture (Claude API), following the established 90/10 pattern:**
- **Claude Sonnet 5** — all user-facing natural-language output. Health-adjacent guidance to an anxious population requires judgment about tone and claims, not just speed.
- **Claude Haiku 4.5** — structured background work: trigger classification, statistical-significance checks on candidate patterns before Sonnet ever phrases them for a user.
- **Claude Opus** — reserved, post-revenue, not needed for v1.

**Non-negotiable safety boundaries:**
- No diagnosis, ever — pattern surfacing only, never condition confirmation.
- No medication or treatment-plan guidance.
- **Red-flag escalation:** symptom combinations suggestive of stroke (sudden severe vertigo with slurred speech, facial drooping, limb weakness, or sudden severe headache) trigger an immediate, hard-coded redirect to emergency care, overriding normal assistant behavior. Build and test this before any general recommendation logic ships.

### 6.6 Gamification & motivation
Progress-affirming, never punitive. Gentle trend visualization over streak-shaming or leaderboards; missed days are framed neutrally, not as failure. This is a standing design principle across the entire product, not a single feature.

---

## 7. System Architecture

### 7.1 Frontend
Next.js 14/15, TypeScript, Tailwind — hosted on **InsForge Sites**, not Vercel. InsForge covers frontend hosting, database, auth, realtime, storage, and functions as one platform; there's no separate deployment target to manage. Web app / PWA for v1 — no native app needed, since v1 requires no hardware pairing. **Motion-safety is a core, non-optional requirement:** no aggressive parallax, no autoplay motion backgrounds, reduced-motion as the default rather than opt-in, tested against the population's actual sensitivity from the first screen.

### 7.2 Computer vision pipeline
**MediaPipe** (Google, open-source, free), client-side via `@mediapipe/tasks-vision`:
- **Pose Landmarker** — 33-point full-body pose, for postural sway and head-movement tracking.
- **Face Landmarker (iris/blendshapes)** — 478 landmarks including 10 dedicated iris points, for gaze-stabilization exercise verification.
- Inference runs **entirely on-device** — camera feed never leaves the user's computer, only derived practice metadata (rep counts, scores, session timing) is stored, encrypted at rest. This is the direct architectural parallel to Sync/Coglix Labs' approach and is the foundation of the product's privacy posture.
- Iris-to-gaze-point mapping requires a short on-device calibration step (not built into MediaPipe by default) — budget real engineering time for this.
- **Confidence-threshold handling required:** no CV model has a zero error rate (published benchmarks land 83-95% depending on task). The system must flag low-confidence tracking rather than silently trusting it, and give clear in-app signals when the camera can't reliably see the user.

### 7.3 AI Assistant pipeline
- Weekly batch job (InsForge Edge Function + Cron) aggregates a user's tracker + exercise data → Haiku 4.5 performs structured pattern/significance analysis → Sonnet 5 generates the user-facing insight text → red-flag check runs against every incoming symptom log in real time, independent of the weekly cycle, with its own always-on escalation path.
- Both model calls go **directly to the Anthropic API** using your own API key — InsForge's Model Gateway is not used for this. InsForge remains the backend for database, auth, realtime, and functions; the AI layer is a separate, direct integration you control end to end.
- Data sent to the Anthropic API is encrypted in transit; only the minimum data needed for the specific insight is sent per call.
- **Forward-looking requirement, not a v1 blocker:** once PHI is handled in the Phase 3 clinical/Care Team channel, any health data sent to the Anthropic API will require a signed Business Associate Agreement with Anthropic directly, meaning an enterprise-tier API arrangement rather than standard consumer API access.

### 7.4 Backend & data

**InsForge** (YC-backed, agent-native BaaS) replaces Supabase, Axiom, and Upstash Redis entirely — one platform instead of three, chosen because it's a better fit here, not a downgrade:

- **Database** — portable Postgres. The schema in Section 8 is standard Postgres and needs no changes to run on InsForge instead of Supabase; this is a low-risk swap, not a redesign.
- **Authentication** — built-in user management with OAuth, replacing Supabase Auth directly.
- **Realtime** — replaces Supabase Realtime for tracker/dashboard live updates.
- **Storage** — available if any file/asset storage is needed later; not required for v1 given the CV pipeline never stores video.
- **Edge Functions** — backend logic (weekly AI insight batch job, red-flag check handler) deploys here instead of custom serverless functions.
- **Analytics** — built-in event/usage tracking replaces the general logging role Axiom would have played. For the specific safety-critical audit trail, the `red_flag_events` append-only Postgres table (Section 8) is the primary record — it doesn't depend on a separate logging vendor, which is a genuine advantage: the audit trail lives in the same portable database as everything else.
- **Model Gateway** — not used. AI model calls go directly to the Anthropic API with your own key (see Section 7.3); InsForge's role here is limited to database, auth, realtime, and functions.
- **Caching & rate-limiting** — see Section 7.6 for the full design; this is no longer a "nice to have" given expected AI Assistant usage at scale, not a handful of ad hoc lines.
- **Instant preview branches** — InsForge branches database/auth/functions changes for testing before a "push to prod" gate. This lines up directly with a real, previously-stated concern: an AI coding agent making an out-of-scope or untested change straight to production. Worth using deliberately as a guardrail, not just a feature.
- **Hosting is fully consolidated on InsForge** — InsForge Sites hosts the Next.js frontend directly alongside the backend. No Vercel, no separate deployment target, no cross-platform environment-variable duplication to keep in sync.
- **Build note:** InsForge publishes a setup skill (`insforge.dev/skill.md`) specifically meant to be read by AI coding agents before integration — have Claude Code fetch and follow it directly when wiring this up, rather than guessing at the CLI/API surface.

---

## 7.5 Security Architecture

Security is treated as a first-class requirement here, not a hardening pass at the end — this product handles real health data, and the bar is strict user isolation plus resistance to standard web attack patterns from day one.

### Row Level Security (RLS)

Every user-owned table gets RLS enabled with a policy restricting access to rows where `user_id` matches the authenticated session's user — enforced at the database layer, not just in application code, so a bug in a route handler can't leak another user's data. Concrete policies are in Section 8. `exercises` is the one exception — shared reference content, readable by any authenticated user, writable only via an admin/service-role path never exposed to the client.

**Non-negotiable:** no API route ever trusts a client-supplied `user_id`. Every read or write derives the user strictly from the authenticated session server-side, and RLS is the enforced backstop if that logic is ever wrong — defense in depth, not either/or.

### Authentication & brute-force resistance

- Authentication itself is handled by InsForge's built-in auth — verify during build exactly what login-attempt throttling and account-lockout behavior it provides out of the box; don't assume, confirm against their docs before launch.
- Session tokens: httpOnly, secure, sameSite cookies — never stored in localStorage, which is readable by any injected script.
- Any custom endpoint that touches authentication-adjacent data (e.g., updating a condition label) gets its own rate limit regardless of what InsForge provides at the login layer.
- OAuth preferred over password-based auth where practical, reducing the credential-stuffing/brute-force surface entirely for users who choose it.

### Injection resistance

- All database access goes through InsForge's client/query builder with parameterized queries — never raw string-concatenated SQL, anywhere, including in Edge Functions.
- Every API input validated against a strict schema (Zod) before it touches the database or is sent to the Anthropic API — this includes the symptom tracker's free-text notes field, which is the most obvious injection surface in this product and also the one most likely to be overlooked since it "just" feeds an AI prompt. Treat prompt-injection resistance on that field with the same seriousness as SQL-injection resistance: the notes field is user-controlled text being fed into a model call, and should be handled as untrusted input, not free-form context.

### OWASP Top 10:2025 mapping

The 2025 edition (the current one — released January 2026, first update since 2021) reshuffled several categories and added two new ones. Mapped to Stasus specifically:

| Category | Stasus mitigation |
|---|---|
| A01 Broken Access Control (now absorbs SSRF) | RLS on every table, server-derived user identity on every route, no direct object references without ownership checks (a symptom log or exercise session fetched by ID must verify it belongs to the requesting user) |
| A02 Security Misconfiguration | No debug endpoints or verbose errors in production, secrets never committed, security headers enforced in middleware, InsForge's preview-branch gate reviewed before every prod push |
| A03 Software Supply Chain Failures | Pin dependency versions, run `npm audit` before merging, review any new package before adding it — especially relevant given AI-agent-assisted development can suggest packages without verifying their legitimacy |
| A04 Cryptographic Failures | TLS everywhere, encryption at rest (InsForge-managed Postgres), no health data or API keys ever logged or placed in URLs |
| A05 Injection | Parameterized queries only, strict input validation on every route, prompt-injection handling on the notes field (see above) |
| A06 Insecure Design | Threat-model each feature before building it — e.g., could a user manipulate their own trigger data to see another user's insight; the red-flag check's deterministic (non-AI) design is itself a secure-by-design decision already made |
| A07 Authentication Failures | Handled primarily by InsForge auth (verify specifics), httpOnly session cookies, OAuth preferred, rate limiting on any custom auth-adjacent endpoint |
| A08 Software and Data Integrity Failures | AI-generated insight text is constrained by system-prompt boundaries before it's ever persisted or shown (Section 6.5); InsForge's preview-branch gate functions as CI/CD integrity control |
| A09 Security Logging & Alerting Failures | `red_flag_events` and `ai_call_log` provide the audit trail already scoped in Section 8 — but logging alone isn't enough: a red-flag event should trigger an actual alert (notification/email), not sit as a silent row nobody reviews |
| A10 Mishandling of Exceptional Conditions | Fail-safe, not fail-open, on the safety-critical path specifically: if the red-flag check itself errors, the app must default to the cautious "please seek care" response, never to "no red flag detected" — the failure mode of this one check must always bias toward caution |

---

## 7.6 Scalability, Caching, Rate Limiting & State Management

Given expected AI Assistant usage at real scale, this needs deliberate design, not ad hoc handling.

**Rate limiting (AI-specific):** the weekly insight cadence (Section 6.5) is itself a natural rate limit, but don't rely on feature design alone — enforce a hard per-user daily ceiling on Anthropic API calls at the code level, checked against the `ai_call_log` table (Section 8) before any call fires. This protects against both abuse and a bug that accidentally loops. Pair with a per-IP request limit on all API routes generally, not just AI ones.

**Caching:**
- AI insights are inherently cached by design — a weekly insight is generated once and stored in `ai_insights`; the insights page reads the existing row rather than regenerating on every view.
- Exercise library content is close to static — long cache lifetimes are safe, invalidated only on an admin content update.
- Client-side: use **TanStack Query** (or SWR) for server-state caching and stale-while-revalidate behavior on tracker/dashboard data, paired with InsForge Realtime for live updates rather than polling.

**State management:** TanStack Query handles server state (symptom logs, exercises, insights — anything that comes from InsForge). Client-only UI state (onboarding flow step, form inputs, theme toggle) stays in local component state or React Context — no Redux/Zustand-class global store unless real complexity emerges that justifies it. This is a deliberate choice to avoid over-engineering state management for a product whose actual complexity lives in the data layer and the AI pipeline, not in client-side UI state.

**Scalability:**
- Edge Functions stay stateless — no in-memory state that would break the moment there's more than one running instance.
- Database connection pooling — confirm InsForge's default behavior during build rather than assuming; this is a common scaling failure point if left unverified.
- Every list-returning endpoint (symptom log history, exercise sessions) is paginated — never an unbounded query. This is both a scalability measure and a DoS-resistance measure, and it's cheap to build correctly from the start versus retrofitted later.
- Indexes already present in Section 8's schema (e.g., `ai_call_log` on `user_id, called_at`) exist specifically to keep the rate-limit check itself fast as usage grows — a slow rate-limit check under load defeats its own purpose.

## 8. Database Schema (draft)

```sql
-- USERS
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  condition_label   TEXT,                 -- optional, user-supplied, never inferred/diagnosed by the app
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_row" ON users FOR ALL USING (id = auth_user_id()) WITH CHECK (id = auth_user_id());

-- SYMPTOM LOGS
CREATE TABLE symptom_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  severity      INTEGER CHECK (severity BETWEEN 1 AND 10),
  duration_minutes INTEGER,
  triggers      JSONB,                    -- preset + custom trigger tags
  notes         TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symptom_logs_own_rows" ON symptom_logs FOR ALL USING (user_id = auth_user_id()) WITH CHECK (user_id = auth_user_id());
CREATE INDEX idx_symptom_logs_user_time ON symptom_logs(user_id, logged_at DESC);

-- CUSTOM TRIGGERS (user-defined, beyond presets)
CREATE TABLE custom_triggers (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  label     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE custom_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "custom_triggers_own_rows" ON custom_triggers FOR ALL USING (user_id = auth_user_id()) WITH CHECK (user_id = auth_user_id());

-- EXERCISE LIBRARY — shared reference content, not user-owned.
-- Readable by any authenticated user; writable only via an admin/service-role
-- path that is never exposed to the client.
CREATE TABLE exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT CHECK (category IN (
                    'habituation','gaze_stabilization','balance_training','canalith_repositioning'
                  )) NOT NULL,
  condition_tags  JSONB,                  -- e.g. ["PPPD","vestibular_migraine"]
  title           TEXT NOT NULL,
  description     TEXT,
  instructions    JSONB,
  difficulty_level INTEGER,
  requires_cv_tracking BOOLEAN DEFAULT FALSE
);
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises_read_all_authenticated" ON exercises FOR SELECT USING (auth_user_id() IS NOT NULL);
-- No INSERT/UPDATE/DELETE policy for client roles — admin writes only, via service role.

-- EXERCISE SESSIONS (metadata only — no video ever stored)
CREATE TABLE exercise_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  exercise_id       UUID REFERENCES exercises(id),
  completed_at      TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds  INTEGER,
  rep_count         INTEGER,
  cv_confidence_avg NUMERIC(4,3)          -- average tracking confidence for the session
);
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercise_sessions_own_rows" ON exercise_sessions FOR ALL USING (user_id = auth_user_id()) WITH CHECK (user_id = auth_user_id());
CREATE INDEX idx_exercise_sessions_user_time ON exercise_sessions(user_id, completed_at DESC);

-- AI INSIGHTS
CREATE TABLE ai_insights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,
  insight_text  TEXT NOT NULL,
  model_used    TEXT NOT NULL,            -- 'claude-sonnet-5' | 'claude-haiku-4-5-20251001'
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_insights_own_rows" ON ai_insights FOR SELECT USING (user_id = auth_user_id());
-- INSERT happens only from the server-side weekly job (service role), never from the client directly.

-- RED-FLAG SAFETY EVENTS — append-only audit trail
CREATE TABLE red_flag_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  symptom_log_id  UUID REFERENCES symptom_logs(id),
  flagged_pattern TEXT NOT NULL,
  flagged_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE red_flag_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "red_flag_insert_only" ON red_flag_events FOR INSERT WITH CHECK (true);
-- Deliberately no client-facing SELECT policy — this table is an internal
-- safety/audit record, not a user-facing history feature. Reviewed via
-- admin/service-role access only.

-- Basic rate-limit table for the Anthropic API calls (replaces a Redis
-- layer — see Section 7.6). One row per call keeps the check simple and auditable.
CREATE TABLE ai_call_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  called_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ai_call_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_call_log_own_rows" ON ai_call_log FOR ALL USING (user_id = auth_user_id()) WITH CHECK (user_id = auth_user_id());
CREATE INDEX idx_ai_call_log_user_time ON ai_call_log(user_id, called_at DESC);
```

**Note on `auth_user_id()`:** this is a placeholder for whichever session-context function InsForge's Postgres integration actually exposes (Supabase calls its equivalent `auth.uid()`) — confirm the exact function name against InsForge's docs/skill file during build and swap it in; the policy structure itself doesn't change.

---

## 9. Phase 2 — BCI Layer (post-traction, not v1)

- Consumer EEG headset integration (NeuroSky MindWave Mobile 2, ~$100-130, as the realistic entry point) for real-time neurofeedback during exposure exercises — arousal/relaxation state surfaced via frontal alpha/theta activity, live, during habituation training. Nothing in the current vestibular-app landscape pairs EEG with exposure training this way.
- **Forces a native mobile transition**, at least on iOS — Web Bluetooth is unsupported in Safari, so Bluetooth headset pairing requires native SDKs. Plan the transition deliberately rather than treating it as a surprise.
- **Hardware decisions already made and logged:** NeuroFocus (neurofocus.dev) evaluated and ruled out — not shipped yet (Q4 2026 target), no visible developer SDK. The existing Raspberry Pi Pico is not usable for EEG as-is (no biosignal-sensing hardware; DIY analog front-end design carries real signal-quality and safety risk) — buy a ready-made, certified unit when Phase 2 arrives rather than building custom hardware.
- **Don't market this as a "BCI product" before it exists.** Lead with the PPPD/vestibular-specific habituation and hypervigilance work now; introduce BCI as a named, visible roadmap item once it's real.

---

## 10. Competitive Positioning

- **Sync by Coglix Labs** — closest structural comp (webcam-only, browser-based CV, general-wellness-to-510(k) staging, Founders Inc-backed), but serves stroke/speech/cognitive rehab, not vestibular. One-line positioning: *"Like Sync, but for the vestibular population they don't serve, with a PPPD-specific hypervigilance layer their focus doesn't need."*
- **Vertidisan (EU prescription DTx)** — clinically validated but clinic-channel-only and narrow; no consumer on-ramp, no hypervigilance component.
- **Academic gamified VRT prototypes** — built for general dizziness in older adults; no PPPD-specific content, no anxiety component, not production products.
- **No existing product does EEG/BCI-based neurofeedback for vestibular disorders** — the eventual Phase 2 differentiator remains genuinely open.

---

## 11. Build Phases

| Phase | Focus |
|---|---|
| Weeks 1-2 | Core exercise library — all four categories, condition-mapped, structured progression. Local-inference CV architecture established from the start if webcam tracking ships alongside. |
| Week 3 | Symptom & trigger tracker — hybrid presets + custom, notes, severity/duration, basic trend surfacing. |
| Week 4 | Hypervigilance/anxiety module — cross-linked to tracker and exercises. |
| Week 5 | AI Assistant — red-flag escalation built and tested first, then weekly pattern-insight generation (Haiku 4.5 + Sonnet 5). |
| Weeks 6-7 | Closed beta with real PPPD/vestibular patients, sourced from active online patient communities. Real usage and outcome data collected here becomes the traction story for YC, Rock Health, or Founders Inc. |
| Phase 2 (post-traction) | EEG/Muse integration, native mobile transition. |
| Phase 3 (post-traction) | FDA 510(k) pursuit, Care Team/clinic workspace, RTM billing eligibility. |

---

## 12. Success Metrics (beta)

- Weekly active usage / retention (the honest core test for a chronic-condition wellness app — flagged repeatedly throughout this process as the real risk, more than the technology).
- Self-reported symptom severity trend over the beta period (tracker data itself becomes the outcome measure).
- Exercise adherence rate by category.
- AI Assistant engagement with weekly insights (opened vs. ignored) as an early signal of perceived usefulness.
- Zero false-negative rate tolerance on red-flag escalation testing — this one has no acceptable failure margin before launch.

---

## 13. Honest Risks

- **Retention, not technology, is the real test.** Every design decision in this document (cross-linked features, weekly-not-reactive AI cadence, gentle gamification) is aimed at this risk directly.
- **Community trust matters more than usual** — this population has often been dismissed or misdiagnosed; credibility, including the founder's own story, carries real weight.
- **Don't over-promise the BCI layer before it exists** — lead with what v1 actually is.
- **CV model imperfection is real and must be designed around**, not assumed away — confidence thresholds and graceful fallback are first-class requirements, not polish.
