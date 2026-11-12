# Stasus — Product Requirements Document v2

**Status:** Reframe specification — supersedes consumer wellness build (Aug 3, 2026 baseline)
**Author:** Dave Bustos, Founder
**Source:** `Stasus-PRD-v2.docx` — converted to Markdown so agents and the team can read it in the repo. Content is unchanged from the Word document.

---

**PRODUCT REQUIREMENTS DOCUMENT**

**Stasus**

*Objective Digital Biomarkers for Vestibular Dysfunction*

**Prepared by: **Dave Bustos, Founder

**Repository: **github.com/dbustosjr/Stasus

**Document status: **Reframe specification — supersedes consumer wellness build (Aug 3, 2026 baseline). This revision adds the competitive-differentiation analysis (Section 4.3) and the parallel computational/AI-discovery research track (Section 8), in place of treating that work as a deferred later phase (Sept 6, 2026 update).

**Classification: **Internal / partner-facing planning document

## 1. Executive Summary

Stasus is being rebuilt from a consumer vestibular-wellness app into a B2B research and diagnostics-data platform. The product's purpose changes from helping an individual patient cope with symptoms to producing objective, validated, camera- and sensor-based measurements of vestibular and oculomotor function that clinicians, academic researchers, and pharmaceutical companies can use to study, monitor, and eventually treat vestibular dysfunction more effectively.

This document specifies the reframed product: what is removed from the current build, what is kept and repositioned, the new test battery and its scientific basis, the competitive landscape and why the capture layer alone is not the differentiator, the system architecture and access model, the digital-twin and AI-discovery roadmap, and the phased roadmap from solo-founder validation work to a fundable, defensible data platform.

### 1.1 Why this reframe

- Vestibular dysfunction affects an estimated 33 million Americans and is chronically hard to diagnose because it spans the nervous system, visual system, and inner ear.

- The consumer wellness version of Stasus (symptom tracker, calm tools, AI-generated notes) does not produce objective, validated measurement — it is a self-report and coaching product, not a scientific instrument.

- The camera-based (MediaPipe) infrastructure already built is real, reusable technology once it is pointed at a validated test battery instead of unvalidated "exercises."

- Digital biomarkers are a real, fast-growing category with structural demand from pharma, driven by adoption of digital endpoints in decentralized clinical trials.

- Digitizing an established oculomotor battery via webcam is a real, useful capability — but it is not, on its own, a differentiated one. Comparable webcam-based oculomotor screening already exists commercially (Section 4.3). The defensible value has to come from a computational/AI layer built on top of the captured data, not from the capture method itself.

## 2. Product Vision & Mission

**Mission: **Build objective, validated digital biomarkers for vestibular dysfunction that give clinicians, researchers, and pharmaceutical companies the measurement tools they currently lack — enabling faster, more rigorous research into causes and treatments, and, as a parallel research objective, surface and validate candidate biomarkers beyond what published clinical literature already defines, rather than only digitizing existing tests.

**Who this is for: **Academic vestibular researchers, neurotology and audiology clinics, pharmaceutical and biotech companies running trials in vestibular/neurological conditions, and — later — device makers who license the underlying measurement technology.

**Who this is explicitly not for: **Individual consumers seeking self-guided symptom relief. Stasus is no longer a direct-to-consumer wellness product.

## 3. Problem Statement

Vestibular disorders (BPPV, vestibular migraine, Persistent Postural-Perceptual Dizziness (PPPD), Meniere's disease, mal de debarquement syndrome, and others) are common, disabling, and difficult to diagnose objectively. Diagnosis today relies heavily on patient history and clinical criteria (e.g., the Barany Society consensus criteria for PPPD) rather than a single definitive test. Gold-standard objective testing (videonystagmography, rotary chair, posturography) exists but requires expensive equipment and in-clinic visits, limiting how much data researchers and clinicians can collect, especially longitudinally or remotely.

This creates a measurement gap: pharmaceutical trials for vestibular and related neurological conditions lack scalable, objective digital endpoints, and researchers lack an accessible way to collect standardized oculomotor data outside a specialty clinic.

## 4. Market Context

The following reflects published market research as of mid-2026 and should be treated as directional, not a guarantee of any specific company outcome.

| **Data point** | **Figure** | **Source basis** |
| --- | --- | --- |
| Digital biomarker market, 2026 | ~$6–7.4B (est. range across reports) | Multiple market research firms, 2026 reports |
| Projected CAGR | ~19% (several estimates 11–29%) | MarketsandMarkets, Coherent Market Insights, GMI |
| Largest end-user segment | Pharmaceutical & biotechnology companies | MarketsandMarkets, 2026 |
| Nervous system disease trials (global) | 22,885 trials (12.4% of total) | Digital Biomarkers Market press release, 2026 |
| Named active companies in category | IXICO, Empatica, Cumulus Neuroscience, Delve Health | MarketsandMarkets vendor landscape, 2026 |

### 4.1 Funding reality

In the adjacent biomarker-testing venture category, seed and Series A rounds captured only ~12.5% of disclosed capital over a recent 12-month period, while Series B and growth rounds captured ~87%. Capital concentrates after a company crosses a credibility threshold — typically clinical validation, demonstrated pharma utility, or a reimbursement pathway. Practical implication: the validation study (Section 11) is not just scientifically necessary — it is the specific event that unlocks realistic fundraising.

### 4.2 On exit/outcome potential

This document does not make a claim about any specific funding or exit outcome — that would be speculation, not planning. What is factually supported: the category has real, structural, growing demand from a well-capitalized buyer (pharma), and comparable companies exist and are funded. Outcome depends on execution, validation results, and timing, none of which can be forecast here.

### 4.3 Competitive Landscape and Differentiation

The webcam-based oculomotor capture layer of this product is not unique, and the Section 4 competitor table above understates this. ConductVision (a ConductScience product) already offers commercial webcam-based saccade latency/accuracy, smooth-pursuit gain, and nystagmus quantification, explicitly marketed for vestibular research, concussion/TBI oculomotor screening, and neurodegenerative-disease eye-movement studies — the same three markets Section 12 targets for Stasus's expansion. Tobii launched a software-based webcam eye-tracking product for research in June 2026, extending its Pro Lab ecosystem to work with any webcam. Neither fact invalidates this product; both clarify where the defensible value actually has to sit.

Implication: the capture-and-digitize layer (Sections 6 and 9) is necessary infrastructure and should still be built well — but it is not the moat, because it can be, and already has been, replicated. The differentiation strategy for Stasus is the computational/AI-discovery layer specified in Section 8, run as an active, parallel research track starting now — not deferred until after Tier 2 clinical validation exists, which is how the prior version of this document sequenced it. Section 4.1's fundability data point still holds (clinical validation unlocks capital), but validation on its own, without the discovery layer, produces a company competing on execution speed inside an already-funded field rather than one with an independent research contribution.

## 5. Scope: What Changes From the Current Build

### 5.1 Removed entirely

- Symptom & trigger tracker (free-text notes, trigger presets, severity trend UI)

- Calm / hypervigilance tools (breathing tool, fear-avoidance and grounding steppers)

- AI-generated daily / weekly / monthly wellness notes ("weekly letter")

- Exercise library as patient-facing coaching content (habituation, balance, canalith repositioning framed as self-directed practice)

- Consumer landing page copy and brand voice ("steadier days," "quiet place," wellness framing)

- Open, self-serve account signup

### 5.2 Kept and repositioned

- On-device MediaPipe camera pipeline and self-hosted WASM inference — infrastructure is reused; content built on top of it is replaced entirely

- Privacy and consent infrastructure, including research consent and revocation — directly reusable and a genuine asset for IRB and partner discussions

- Row-Level Security / per-user data isolation architecture — correct as-is regardless of product direction

- Longitudinal data tables (protocol_events, outcome_trends) — schema reusable, repurposed from "adherence tracking" to "test session history"

### 5.3 Net effect

The current build contains two real assets (camera inference infrastructure, privacy/consent architecture) and one layer of consumer-facing features that does not carry forward. The reframe is best understood as building a new product on the existing technical foundation, not adjusting the existing product's tone.

## 6. Objective Test Battery

All tests below are camera-based (webcam, phone, or tablet camera; seated, close-range) unless noted otherwise. Standing, lying-down, and full-body maneuvers (e.g., Dix-Hallpike, caloric testing) are explicitly excluded — camera field-of-view and depth accuracy cannot support them; these remain the domain of in-clinic gold-standard equipment.

| **#** | **Test** | **Clinical measures captured** | **Primary relevance** |
| --- | --- | --- | --- |
| 1 | Saccade test | Latency, accuracy, velocity | Core oculomotor battery; broad applicability |
| 2 | Smooth pursuit | Velocity gain, asymmetry, phase angle | Vestibular migraine (published case-control differences); general oculomotor battery |
| 3 | Gaze-evoked / fixation (gaze-hold) | Nystagmus during eccentric gaze holding | Standard VNG battery component |
| 4 | Optokinetic response | Symmetry of optokinetic nystagmus | Central vestibular system integrity (coarser signal; third-tier priority) |
| 5 | Convergence / near-point | Near point of convergence distance | Broader oculomotor picture; also used in VOMS concussion battery |
| 6 | Visual motion sensitivity / optic flow | Gaze stability (BCEA) before/during/after moving visual stimulus | Directly implicated in PPPD (published gaze-instability findings) |
| 7 | VOR during head movement | Gaze stability during active head rotation | Standard VOMS component; build after core battery is validated |

### 6.1 Build order

1. Saccade test — cleanest signal, discrete events, most tractable engineering

1. Smooth pursuit

1. Gaze-evoked / fixation

1. Convergence / near-point

1. Visual motion sensitivity / optic flow — PPPD-specific priority

1. Optokinetic response

1. VOR during head movement (requires head-pose tracking; higher build complexity)

### 6.2 Structured symptom rating

After each test, capture a structured 0–10 rating (headache, dizziness, nausea, fogginess), following the VOMS protocol convention. This replaces free-text journaling with a validated, low-effort structured input.

### 6.3 Standardized questionnaires

Delivered as distinct modules, separate from the test flow — fixed, published instruments, not custom-designed forms.

- Niigata PPPD Questionnaire (NPQ) — PPPD-specific severity scale

- Visual Vertigo Analog Scale (VVAS) — visual motion sensitivity; most associated measure with PPPD status in comparative research

- Dizziness Handicap Inventory (DHI) — general vestibular disability impact, 25 items

- Motion Sickness Susceptibility Questionnaire (MSSQ) — relevant to mal de debarquement syndrome

### 6.4 Explicit exclusions and why

- Caloric testing — requires physical ear canal irrigation; not reproducible via any camera/phone sensor

- Positional testing / Dix-Hallpike — lying-down maneuver; camera field-of-view cannot support it

- Rotary chair, video head impulse test (vHIT), VEMPs, computerized dynamic posturography — require dedicated clinical hardware; not approximated with consumer sensors

## 7. Scientific Claims Discipline

This section is a hard constraint on product copy, marketing, and UI language, not a stylistic preference.

- No test is described as diagnosing a specific condition (e.g., "this test detects PPPD"). Conditions such as PPPD, vestibular migraine, and mal de debarquement are diagnosed clinically, against consensus criteria — not by any single objective test.

- Objective measures are described as correlates or adjunct markers, with the specific supporting research cited, e.g.: gaze instability following visual motion exposure is elevated in PPPD patients in published comparative studies.

- Any neurodegenerative-disease-adjacent claim (Parkinson's, MS) is described the same way: oculomotor metrics are described in peer-reviewed literature as prognostic and correlated with disease state, not as standalone diagnostic tests.

- Regulatory posture: general-wellness FDA framing is dropped. Until the validation study exists, the platform is positioned as an investigational / research-use tool. A Software as a Medical Device (SaMD) pathway (510(k) or De Novo) is a later-phase goal, not a current claim.

- This discipline applies with equal force to the outputs of the computational/AI-discovery layer (Section 8): synthetic waveforms generated by the mechanistic model, and candidate signal patterns surfaced by the representation-learning layer, are described as candidate/correlational and validation-pending — never as a validated "biomarker," and never as diagnostic — until Tier 2 empirical validation (Section 11) confirms discriminative validity for a specific signal.

## 8. Digital Twin & AI-Discovery Roadmap

The prior version of this roadmap treated computational modeling and synthetic data as a single track, strictly sequential, and reachable only after real patient data exists. That sequencing is revised here. A mechanistic model of known vestibular physiology does not require patient data to exist — it requires published parameters. Built now, it becomes the research contribution that a pure capture-and-digitize product (Section 4.3) cannot easily replicate. The roadmap below separates two tracks that run in parallel with the data-collection tiers, rather than waiting behind them.

### 8.1 Track 0 — Mechanistic model (parallel, starts now)

A parameterized computational model of the vestibulo-ocular reflex (VOR) three-neuron arc, built from published gain, time-constant, and velocity-storage parameters in the vestibular neuroscience literature. Used to generate synthetic, labeled oculomotor waveforms corresponding to known pathology signatures (e.g., BPPV, vestibular migraine, PPPD) before real patient data exists.

Purpose: (a) stress-test and validate the signal-processing/feature-extraction pipeline (Section 9.2) against known ground truth ahead of Tier 1 volunteer data, which is currently healthy-skewed; (b) pre-specify what a pathological signature should look like so detection logic can be designed against it rather than discovered ad hoc once patients are enrolled.

Reality check: this requires computational-neuroscience depth beyond signal thresholding. It is not a weekend addition. It needs either a collaborator with that background or a sustained, structured personal study investment, and every parameter used must be sourced and cited from peer-reviewed literature — no invented physiological constants. Treat this as a genuine research workstream with its own timeline, run alongside — not instead of — the engineering roadmap in Section 13.

### 8.2 Data-collection tiers (revised numbering)

| **Tier** | **Description** | **Feasibility now** |
| --- | --- | --- |
| 1. Digital profile | Persistent, structured, multi-dimensional record of each individual's test results and questionnaire scores over time; not simulation | Buildable immediately — a natural extension of structured data already being collected |
| 2. Parametric model fitting | Fit a small-parameter model (e.g., personal gain, latency, phase lag) to each individual's repeat-session data | Buildable once repeat-session data exists per person; standard applied math, not full neural simulation |
| 3. Statistical synthetic data generation | Fit distributions to real population data (Tier 2 dataset) and sample synthetic patient profiles from them | Buildable once a real Tier 2 dataset exists; standard statistical/ML technique. Complements Track 0's earlier literature-based synthesis — the two are not duplicates: Track 0 encodes known physiology before data exists, Tier 3 encodes observed population statistics once data exists. |

### 8.3 Biomarker discovery layer (parallel track, activates as Tier 1 data accumulates)

The current test battery (Section 6) extracts a fixed set of clinically established features per test — latency, gain, accuracy, BCEA. Those are necessary and should not be removed; they are what a clinical partner and the Bland-Altman validation (Section 11) need. But relying only on them means the product's contribution is limited to replicating what is already published — the same limitation the capture-only competitors in Section 4.3 have.

The discovery layer runs a representation-learning model over the full raw landmark trajectories captured during each test (not just the derived clinical features) to surface candidate signal patterns that are not yet in the published literature. Candidates are then tested against real Tier 2 patient labels, once available, to determine which — if any — actually discriminate between patient groups or track symptom severity. This is a generate-then-filter-then-validate structure: propose broadly, filter computationally, confirm empirically — rather than starting from, and staying limited to, the fixed clinical feature set.

Output framing: a signal pattern that survives this process is reported as a candidate digital biomarker with the specific validation evidence behind it, per the claims discipline in Section 7 — never as a diagnostic finding, and never described as validated before Tier 2 confirmation exists.

***8.3.1 Public dataset pretraining sources***

OpenNeuro and DANDI (the general neuroimaging/electrophysiology archives referenced in early product research) were checked and do not appear to host directly comparable webcam-style saccade/smooth-pursuit datasets — they skew toward MRI, fMRI, and electrophysiology. Other public repositories do host relevant eye-movement data and are worth evaluating for licensing and access terms before use, as pretraining or sanity-check data ahead of Stasus's own data volume being sufficient:

- A saccade/smooth-pursuit eye-tracking dataset (Goettker, 2023, PsychArchives) covering eight experiments isolating and combining saccadic and pursuit performance.

- A 2026 Scientific Data eye-movement benchmark for smooth-pursuit classification, built specifically to improve automated fixation/pursuit classification algorithms.

- G-Node oculomotor recordings during saccade and pursuit paradigms — useful for pipeline sanity-checks even though the recording modality differs from webcam capture.

None of these are a guaranteed drop-in fit — verify license terms, subject population, and recording modality against Stasus's actual capture pipeline before committing engineering time to any of them.

## 9. System Architecture

### 9.1 High-level layers

- Public site — informational only; no self-serve signup; "Request access" contact path

- Auth layer — invite/provisioned access only, with roles: Partner Admin, Clinician, Patient, Founder Admin

- Portals — role-specific views (Section 10)

- Test engine — calibration → test administration → signal processing → feature extraction

- Data layer — per-user structured results with Row-Level Security; questionnaire scores; de-identified aggregate research layer

### 9.2 Test engine pipeline

1. Calibration (5-point gaze calibration, required before any test)

1. Stimulus presentation (target motion, moving pattern, or fixation points per test type)

1. Raw landmark / IMU capture (MediaPipe landmarks, or phone accelerometer/gyroscope for later IMU-based tests)

1. Signal processing (velocity thresholding, event detection/segmentation)

1. Feature extraction (latency, gain, accuracy, BCEA, etc., per test)

1. Structured symptom rating capture (0–10 scale)

1. Write to per-user data layer, versioned and timestamped

### 9.3 Data layer principles

- No raw video ever leaves the device or is persisted — only derived landmark features and computed results (consistent with the current build's approach, and with what the biomarker discovery layer in Section 8.3 operates on — landmark trajectories, not raw video)

- Every test session is structured, versioned, and timestamped, linked to the relevant questionnaire scores

- De-identification occurs before any data enters the aggregate research layer

- Consent is tracked per data-use purpose and is revocable

## 10. Access Model & User Portals

Open self-serve signup is removed. Access is provisioned, not requested by clicking a button — consistent with how research and clinical software is normally distributed.

| **User type** | **Primary use** | **Access model** |
| --- | --- | --- |
| Research / clinical partner (Partner Admin) | Administer tests to their subjects; view and export their own site's data | Invite-only, provisioned after a data use agreement / IRB reference is in place |
| Clinician | Assign tests, review individual patient trends | Provisioned by Partner Admin at their institution |
| Patient | Take assigned tests; view own results only | Account created by a clinician/partner, or a scoped study-specific invite link |
| Pharma / device company | Data licensing or custom integration | Direct business relationship, not a self-serve login tier |
| Founder / Admin | System-wide de-identified analytics, provisioning, data quality monitoring | Existing admin role, expanded |

### 10.1 Patient portal — visible content

- Own test history and digital profile (trend over time; no comparison to other users)

- Tests assigned by their clinician or study, completed at home or in-clinic

- Standardized questionnaires as structured forms

- Consent management, including revocation, scoped to the specific study/partner

- No community features, no coaching content, no wellness messaging

### 10.2 Clinician / Partner portal — visible content

- Their own patients'/subjects' results and questionnaire data only

- Ability to assign test batteries and review per-patient trends

- Study-level dashboards where applicable (session counts, protocol adherence — operational, not diagnostic interpretation)

- Export of their own site's data

- No visibility into other institutions' data

### 10.3 Founder / Admin portal — visible content

- De-identified aggregate analytics across all partner sites

- Data quality / engineering health monitoring (calibration failure rates, test reliability metrics)

- Partner and account provisioning

- Export tooling for internal R&D (Tier 2/3 dataset work, digital-profile model fitting, biomarker discovery layer training data)

### 10.4 Core flow — patient in a clinical/research context

1. Clinician or study coordinator creates the patient's account or sends a scoped invite link

1. Patient logs in and completes a study-specific consent screen (accept/decline per item)

1. Calibration flow (required before first test)

1. Assigned test battery administered one test at a time, with structured symptom rating after each

1. Questionnaires completed as separate modules

1. Patient sees only their own results and trend

## 11. Validation Study Plan

The validation study is the single highest-priority non-engineering workstream and the event that converts the platform from "an app" into a validated instrument credible to researchers, clinicians, and pharma.

### 11.1 Design

- Method-comparison study: each subject completes the same test(s) on both the Stasus platform and gold-standard clinical equipment (VNG), same session

- Statistical approach: Bland-Altman analysis, the standard method for comparing two measurement methods

- Subjects: mix of healthy controls and vestibular-diagnosed patients, recruited through the clinical/academic partner

### 11.2 Prerequisites

1. Signal processing pipeline built and passing internal reliability checks (test-retest consistency on founder/volunteer data)

1. Clinical or academic vestibular partner secured (neurotology, audiology, or vestibular PT research lab)

1. IRB approval obtained through that partner

### 11.3 Dataset tiers

| **Tier** | **Purpose** | **Population** | **Access needed** |
| --- | --- | --- | --- |
| 1 | Pipeline reliability (test-retest) | Founder + remote volunteers (online vestibular communities) | None — browser-based, remote-friendly |
| 2 | Clinical validation (paired comparison vs. VNG) | Healthy controls + vestibular patients | Clinical/academic partner, IRB approval |
| 3 | Supplementary pretraining / sanity-check | Existing public eye-tracking / physiological datasets (Section 8.3.1) | Public repositories; not a substitute for Tier 2 |

## 12. Expansion Paths Beyond Vestibular

The same oculomotor test battery has established relevance outside vestibular dysfunction, which allows financial diversification without leaving the core technology.

### 12.1 Concussion / mTBI — nearest-term expansion

The Vestibular/Ocular-Motor Screening (VOMS) protocol — smooth pursuit, saccades, near-point convergence, VOR, and visual motion sensitivity — is an established, clinically validated concussion screening tool with reported ~90% accuracy, already commercialized on smartphones by at least one company (Sway Medical), and adjacent to ConductVision's existing concussion/TBI product line (Section 4.3). This is a near-identical battery to what Stasus is building, making it the most natural adjacent market — and the one where the competitive pressure to differentiate through the discovery layer (Section 8.3), rather than the capture layer alone, is highest.

### 12.2 Neurodegenerative disease — verified, longer-term

- Parkinson's disease: peer-reviewed literature documents hypometric saccades, prolonged saccadic latency, increased anti-saccade errors, and vergence deficits, with several abnormalities detectable in early-stage disease before overt motor symptoms.

- Multiple sclerosis: oculomotor dysfunction is present in an estimated 90–95% of MS patients, linked to demyelination of the visual pathway.

- Broader review literature (covering MS, Parkinson's, Alzheimer's/dementia, and ALS) supports saccade, anti-saccade, fixation, and smooth pursuit metrics as prognostic of disease progression and useful for differentiating disease subtypes.

As with vestibular conditions, this is adjunct/correlational evidence, not standalone diagnostic capability, and must be represented that way in any claim (see Section 7).

## 13. Build Roadmap

### 13.1 Immediate (solo-founder phase)

1. Auth/role system and invite-based provisioning (foundation for everything else)

1. Saccade test built end-to-end through the new portal structure

1. Self/remote-volunteer reliability testing (Tier 1 dataset)

1. Standardized questionnaire modules (DHI, NPQ, VVAS, MSSQ)

1. Public site rebuilt as informational/B2B; signup replaced with "Request access"

1. Clinical/academic partner outreach — start in parallel with all of the above, longest lead time item

1. Begin literature review and parameter sourcing for the Track 0 mechanistic VOR model (Section 8.1), and identify a computational-neuroscience collaborator or allocate dedicated self-study time — run in parallel with items 1–6, not sequenced after them

1. Evaluate the public eye-movement datasets in Section 8.3.1 for licensing terms and suitability as pretraining/sanity-check data

### 13.2 Near term

- Remaining core tests added one at a time (pursuit, gaze-hold, convergence, optic-flow/gaze-stability, optokinetic)

- Digital profile (Tier 1 of the data-collection roadmap) built on top of structured test data

- IRB approval and Tier 2 paired validation study design finalized with clinical partner

- Initial representation-learning pipeline for the biomarker discovery layer (Section 8.3) stood up on Tier 1 data plus any usable public pretraining data

### 13.3 Mid term (post-validation)

- Bland-Altman validation results published/shared as the platform's first credible deliverable

- Non-dilutive funding applications (NIH SBIR/STTR) using validation data

- Parametric model fitting (Tier 2 of the data-collection roadmap) once repeat-session data exists

- Candidate signals surfaced by the discovery layer tested against Tier 2 labels; results on which, if any, show discriminative validity reported as the platform's second credible deliverable, alongside the Bland-Altman result

- Accelerator application (e.g., YC) once pilot reliability data and a named clinical advisor are in place

### 13.4 Later phase

- Concussion/mTBI expansion using the existing battery

- SaMD regulatory track (510(k) / De Novo) evaluation

- Statistical synthetic data generation (Tier 3 of the data-collection roadmap), calibrated against the by-then-larger Tier 2 dataset and cross-checked against the Track 0 mechanistic model's earlier literature-based synthetic waveforms

- Neurodegenerative-disease-adjacent research partnerships

## 14. Open Risks

| **Risk** | **Mitigation** |
| --- | --- |
| No dataset exists yet beyond the founder's own testing | Tier 1 remote-volunteer recruitment via online vestibular communities; does not require in-person/local access. Public dataset pretraining (Section 8.3.1) partially offsets this earlier. |
| No clinical credibility without a named partner | Clinical/academic partner outreach treated as the top-priority, longest-lead-time task, run in parallel with engineering |
| Overclaiming diagnostic capability | Hard claims-discipline constraint (Section 7) applied to all product copy and portal UI, explicitly including synthetic and AI-discovered outputs |
| Camera sensor cannot support standing/full-body assessment | Explicitly scoped out; standing/gait measurement deferred to phone-IMU-based tests as a separate, later workstream |
| Pre-validation fundability is limited | Sequence non-dilutive funding (grants) before equity fundraising; validation study is the fundraising unlock |
| The capture-and-digitize layer alone is not differentiated — ConductVision and Tobii already offer webcam-based oculomotor screening (Section 4.3) | Treat the computational/AI-discovery layer (Section 8) as the core research contribution and pursue it in parallel from the start, not as a later nice-to-have |
| The mechanistic model or discovery layer could be overclaimed as diagnostic, or reported as validated prematurely | Same claims-discipline constraint (Section 7) extended explicitly to synthetic and AI-discovered outputs; nothing is called a validated biomarker externally until Tier 2 empirical confirmation exists |
| Computational modeling work requires expertise beyond the current build | Parameters sourced and cited from peer-reviewed literature only; collaborator search treated as a parallel, long-lead-time task alongside clinical partner outreach |

End of document.
