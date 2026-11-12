# Stasus PRD v3 — Holistic vestibular research and solutions platform


**Source:** `Stasus_PRD_v3___Holistic_vestibular_research_and_solutions_platform.docx` — converted to Markdown so agents and the team can read it in the repo. Content is unchanged from the Word document.

---

Oct 5, 2026 · @Dave

## Vision and problem

Stasus is a research and problem-solving platform that treats vestibular symptoms as a multi-system problem, giving patients, clinicians, and researchers one place to find sources, test ideas, and develop solutions.

The problem: dizziness, vertigo, and imbalance can come from the inner ear, the brain, vision, the autonomic nervous system, sleep, diet and gut, medications, head and neck injury, and the person's own stress response. Anxiety, stress, and anger can result from symptoms and then amplify them. Care is split across specialties, so no single tool shows how these factors interact in one person.

The need: treatment evidence is thin and outcomes vary widely by condition. [No FDA-approved medication exists for Ménière's disease](https://clinicaltrials.ucbraid.org/menieres-disease), and a [2023 network meta-analysis of vestibular migraine preventives](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10771287/) was limited by how few randomized trials exist, and a [Cochrane review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9997546/) found no placebo-controlled randomized trials of SSRIs or SNRIs for persistent postural-perceptual dizziness. A figure the founder recalls from an article is that most people recover within days to about two years, while 10 to 20 percent have persistent symptoms with little relief. That split matches one emergency department cohort but does not hold across conditions, so the next section reports sourced figures per condition.

The thesis is four capabilities in one platform:

1. A digital twin of the body that people click or tap to see the data behind any structure.

1. A cited evidence library with an AI assistant that answers only from sources.

1. A source-finding workflow that helps an individual and their clinician narrow down contributing factors.

1. A virtual workbench for developing and testing solutions, with safety guardrails.

Out of scope: Stasus does not diagnose, prescribe, or promise a cure. It supports decisions and research.

## Conditions in scope and what is known about them

Stasus covers vestibular dysfunction and vestibular symptoms broadly, and published outcomes differ widely by condition, population, and how recovery is defined, so Stasus reports them per condition and never as one overall figure.

| Condition | What published sources report | Limits of the evidence |
| --- | --- | --- |
| Acute vestibular syndrome (emergency department cohort) | In a review of 233 records, vertigo resolved in 81.1 percent and persisted at one year in 18.8 percent ([J Pers Med, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10059062/)) | Retrospective, one center, follow-up by telephone interview |
| Vestibular neuritis | Symptoms typically last days to weeks, yet up to about half of patients report long-term dizziness or unsteadiness ([Cousins et al.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4169430/)); other studies report 25 to 50 percent developing persistent postural-perceptual dizziness within 3 to 12 months ([Frontiers in Neurology, 2023](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2023.1243034/xml)) | Estimates vary with definitions and follow-up time |
| Persistent postural-perceptual dizziness (PPPD) | Chronic by definition, lasting at least three months; in prospective studies about 25 percent of patients had PPPD-like dizziness or persistent visual vertigo 3 to 12 months after an acute or episodic vestibular disorder ([Bárány Society consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9249299/)) | The consensus document derives incidence from other studies |
| Benign paroxysmal positional vertigo (BPPV) | Spontaneous resolution ranges from 27 to 50 percent, and recurrence after resolution is significant ([AAO-HNSF guideline, 2017](https://aao-hnsfjournals.onlinelibrary.wiley.com/doi/10.1177/0194599816689667)). In one prospective study, 91.3 percent had complete resolution after one or two repositioning sessions, with recurrence in 26.8 percent over a mean 26 months ([PubMed](https://pubmed.ncbi.nlm.nih.gov/10793340/)) | The prospective study is nonrandomized and from 2000 |
| Ménière's disease | In a 365-patient study, about 34 percent had spontaneous remission of episodic vertigo and 65.5 percent had persistent balance problems; other studies report different shares free of attacks, for example 29 percent after seven years ([Frontiers in Neurology, 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11581947/)) | Large differences between studies; hearing loss often persists or progresses |
| Mal de débarquement syndrome (MdDS) | Persistent MdDS means symptoms beyond one month, and the chance of spontaneous recovery falls steeply as duration grows ([Bárány Society consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9249277/)) | No overall recovery percentage found |
| Vestibular migraine | Affects an estimated 1.0 to 2.7 percent of the general population, and 65 to 85 percent of patients are female, per the background text of a [registered trial](https://clinicaltrials.gov/study/NCT06748664) | No pooled recovery figure found; evidence is scarce |

On the figures the founder recalled: the 80 to 90 percent recovery and 10 to 20 percent persistence split is close to the emergency department cohort in the first row, but it does not hold across conditions. No source was found for a general range of 3 days to 2 years. Conditions outside this table, such as concussion-related dizziness and bilateral vestibular hypofunction, enter through the evidence process.

## Principles and claims discipline

Every statement the platform shows carries a source and an evidence tier, and the platform never states more than its tier supports. This is the main difference between Stasus and a generic health portal.

| Tier | Meaning | Example | How it is shown |
| --- | --- | --- | --- |
| Established | Replicated, published, clinically used | Vestibulo-ocular reflex gain as a measure of vestibular function | Normal styling, citation |
| Plausible-emerging | Real literature, not yet proven for this use | Heart rate variability as an attack predictor | Amber badge, citation, caveat |
| Exploratory | Worth instrumenting, no claims | Gut inflammation markers as vestibular signals | Gray badge, hypothesis label |
| Model-generated | Output of a Stasus model | Twin simulation under a hypothetical | Model badge, validity range, fit quality |

Principles:

1. Sources first. No claim without a resolvable citation (DOI or PubMed ID). The AI assistant never writes a citation from memory.

1. Uncertainty is visible. Confidence intervals, data sparsity, and model validity ranges appear next to every value.

1. Decision support, not diagnosis. The platform shows evidence and criteria; clinicians decide.

1. Holistic but graded. Every factor domain is in scope, and each carries its own tier. A factor is a hypothesis until its tier says otherwise.

1. Safety over engagement. Red-flag symptoms route to urgent care guidance. Medication changes are never suggested to patients.

1. Approved language. Copy says reduce symptoms, support, and explore. It does not say cure, treat, or heal unless a regulator-cleared claim exists.

1. Open methods. Models carry a model card: data used, fit quality, held-out error, and known limits.

## Users and core use cases

Stasus serves five user groups, and each sees the same underlying data through a different view.

| User | What they need | What they use |
| --- | --- | --- |
| Patient | Understand their condition, see how factors connect, bring better questions to appointments | Patient view of the twin, symptom and trigger tracking, plain-language library, safe self-experiments |
| Clinician (neurotology, audiology, vestibular therapy, neurology, primary care) | Faster, more complete picture of one patient across systems | Clinician view of the twin, criteria checklists, trend and comparison views, evidence library |
| Academic researcher | Find gaps, build cohorts, run reproducible studies | Evidence-gap map, research workspace, study designer |
| Pharma and biotech | Objective endpoints, mechanism-based patient subgroups, smaller and faster trials | Endpoint library, cohort and twin tools, drug-hypothesis workbench |
| Institution (hospital, university) | Shared workspace, governance, integration with existing systems | Institutional workspace, consent and IRB tooling, FHIR export |

Core use cases:

1. A patient taps the inner ear on the twin and sees their latest balance measurements, what the numbers mean, and the sources behind them.

1. A clinician reviews a patient's factor map before a visit and sees which domains have data, which are missing, and which diagnostic criteria are met.

1. A patient and clinician design a low-risk n-of-1 experiment, such as consistent sleep timing, and track the outcome.

1. A researcher opens the evidence-gap map, finds a mechanism with contradictory studies, and builds a cohort to test it.

1. A pharma team selects an objective endpoint and simulates trial sample size using twin-based prognostic scores.

## Platform overview

platform overview · 6 capabilities, 1 foundation

The digital twin is the center of the platform; the library, source finding, workbench, research workspace, and pharma tools all read from the same data foundation and apply the same evidence tiers.

## The digital twin: model and viewer

The twin has two layers: a computational twin that models one person, and a visual twin that lets people explore it. The viewer is an interface to the model; it never shows more than the model has.

|  | Computational twin | Visual twin |
| --- | --- | --- |
| What it is | A mathematical model of one person, fitted to their own data | An interactive 3D body built with three.js |
| Core method | Mechanistic model (for example the vestibulo-ocular reflex as differential equations) with parameters fitted per person using least squares or Bayesian estimation | Anatomical meshes bound to data through anatomical IDs |
| Inputs | Oculomotor tests, wearable streams, questionnaires, history, clinical imports | Twin state, measurements, evidence tiers, library links |
| Outputs | Fitted parameters with confidence intervals, trajectories, what-if simulations | Tap or click a structure and see its key value, uncertainty, trend, source, and tier |
| Validated by | Held-out prediction error, calibration, comparison with clinical reference tests | Usability testing with patients and clinicians, accuracy of data binding |
| Not | A black-box AI | A diagnostic tool, or a photoreal rendering |

How the layers connect:

1. Data arrives from capture sources and is cleaned by signal processing.

1. The computational twin fits its parameters to the person and records fit quality.

1. The viewer reads twin state through an API and maps each value to an anatomical structure.

1. A value with sparse data or poor fit is rendered with lower visual confidence and a visible caveat.

Model scope grows by domain. Version 1 fits the vestibulo-ocular pathway from published parameters. Autonomic, sleep, and psychological domains enter as measured inputs first and become modeled components only after validation. Gut and metabolic signals stay exploratory until a validation study supports them. An electroencephalography channel for brain-computer interface work is added later as another input, not a rewrite.

## Visual twin build spec

The visual twin must let any patient or clinician tap or click a structure on a realistic, restrained 3D body and see the key data tied to it, on a phone, tablet, or desktop. The targets below are proposals to tune during the prototype.

### Look and feel

Serious and clinical, not stylized. Matte, desaturated tissue on a dark neutral background, similar to a radiology workstation. One accent color is reserved for data. Data is painted onto structures as outlines or heatmaps, with thin leader-line labels and units. No particles, glow, or decorative animation. Structures with sparse data render with lower opacity or hatching, so uncertainty is visible.

### Anatomy assets

| Option | License | Use |
| --- | --- | --- |
| [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html) | Its license page lists Creative Commons Attribution 4.0 (attribution required) | Base body, organs, skeleton, vessels, nerves for the prototype and, after legal review, production |
| [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) | CC BY-SA 4.0 for the project, with some components under non-commercial terms, including the inner ear model | Reference only. Avoid in a commercial build |
| Commissioned models | Contract, work-for-hire | Inner ear (three semicircular canals, cochlea, vestibular nerve), vestibular nuclei, and later a unified full-body set |

Before production use, counsel confirms the license terms and attribution wording. The pipeline: clean and decimate in Blender, export glTF with Draco or meshopt compression, and name every mesh node with its anatomical ID so data binds to the right structure.

### Rendering

- react-three-fiber with drei on top of three.js, matching the existing React portal.

- Physically based matte materials, layer visibility, and clipping planes for cross-sections.

- Level-of-detail meshes and progressive loading. Proposed targets: 60 frames per second on desktop, at least 30 on mid-range phones, and an initial load budget set after the first prototype.

- Camera focus animates to the selected structure.

### Interaction

- Tap or click selects a structure. Invisible, simplified picking proxies make small structures, such as the labyrinth, easy to tap.

- Touch gestures: one finger orbits, two fingers pan and pinch. No feature depends on hover.

- A layer panel toggles skin, muscle, skeleton, vessels, nerves, and organs. Search finds a structure by name.

- A structure tree provides a keyboard- and screen-reader-accessible alternative to the canvas.

### Data binding

Each mesh has an anatomical ID. A binding table maps IDs to measures. Selecting a structure opens a data panel with: current value, confidence interval, trend, source, evidence tier, last updated, and a link to the relevant library entry. Metrics can also be painted over the body as a heatmap.

### Views

| View | Shows |
| --- | --- |
| Patient | Plain-language labels, trends, what the measure means, safe next steps |
| Clinician | Parameters, confidence intervals, comparison with reference ranges, criteria status |
| Researcher | Cohort-level distributions only, never an identifiable individual |

Additional features: a timeline slider to replay twin state over time, side-by-side comparison of two dates or of a person against a cohort, clinician annotations, and shareable snapshots that include citations.

### Component architecture

TwinCanvas, AnatomyModel (glTF loader), Selectable (picking and highlight), DataOverlay (heatmaps and labels), LayerPanel, DataPanel, and a state store for selection and view. Data arrives through an API that returns FHIR-based resources.

### Acceptance criteria

1. Every selectable structure shows value, uncertainty, source, and tier, or an explicit "no data" state.

1. All features work by touch, mouse, and keyboard.

1. No value is displayed without a source.

1. Clinicians and patients rate the look as serious in usability testing, and a clinician can reach any structure's data in three taps or fewer.

## Holistic factor model

Stasus tracks thirteen domains that can contribute to vestibular symptoms. The default tiers below are starting points; the library review sets the final tier for each measure and each causal link, and a domain's presence here does not claim it causes symptoms in any individual.

| Domain | What is tracked | Main capture | Default tier |
| --- | --- | --- | --- |
| Inner ear and vestibular nerve | Reflex gain, asymmetry, hearing tests, positional testing results | Clinical import, camera estimates | Established as measures |
| Eye movement and vision | Saccades, pursuit, gaze stability, visual motion sensitivity, refractive and binocular findings | Camera battery, questionnaires, clinical import | Established as measures |
| Brain and central pathways | Migraine history, concussion history, imaging findings, optional EEG | Clinical import, history, research EEG | Established history, EEG exploratory |
| Autonomic and cardiovascular | Heart rate variability, resting heart rate, orthostatic blood pressure | Wearable, clinical import | Plausible-emerging |
| Psychological | Anxiety, stress, anger, low mood, threat appraisal, avoidance | Validated scales (for example GAD-7, DHI, VVAS) | Established as measures; links to symptoms are bidirectional and graded per condition |
| Sleep and fatigue | Duration, regularity, awakenings, daytime fatigue | Wearable, sleep log | Plausible-emerging |
| Diet, gut, and metabolism | Food and drink triggers, hydration, caffeine, alcohol, optional glucose and stool markers | Logs, optional labs or sensors | Exploratory |
| Medications and substances | Current drugs, recent changes, side effects, interactions | Medication list, drug labels | Established as safety data |
| Head, neck, and accidents | Concussion, whiplash, falls, collisions, neck function | History, clinical import | Established for concussion; neck-related dizziness is contested |
| Infection and inflammation | Recent viral or bacterial illness, post-infectious onset | History, labs | Plausible-emerging |
| Hormonal | Cycle-linked patterns, hormonal changes | Symptom log | Exploratory |
| Posture, gait, and falls | Sway, gait speed, fall history | Phone sensors, clinical tests | Established as measures |
| Environment and triggers | Visual motion, screens, noise, crowds, weather and pressure changes | Trigger log | Plausible-emerging |

Rules for the model:

1. Each measure links to library entries that justify its tier.

1. Missing data is shown as missing, never as normal.

1. Interactions between domains, such as sleep loss and stress, are logged as hypotheses and tested in the workbench before they appear as findings.

1. New domains are added through the evidence process, not by request.

## Finding the source for an individual

The source-finding workflow narrows down which factors may contribute to one person's symptoms and prepares a better conversation with a clinician. It produces hypotheses with evidence, not diagnoses.

1. Red-flag screen first. Sudden severe vertigo with weakness, speech or vision changes, severe headache, or chest pain triggers urgent-care guidance and stops the workflow.

1. Structured history. A timeline of onset and change events: infections, injuries, medication changes, major stress, sleep changes, pregnancy or hormonal changes. Patients can add events at any time.

1. Symptom and trigger diary. Short daily entries: symptom intensity, triggers, food and drink, sleep, stress, medication taken.

1. Measures. Camera tests, wearable data, validated questionnaires, and imported clinical results.

1. Factor map. For each of the thirteen domains, show what data exists, what is missing, and what is outside reference ranges.

1. Hypothesis list. Each hypothesis lists supporting data, conflicting data, missing data, and linked library evidence. Ranking is shown only where published likelihood data supports it; otherwise the list is an unranked checklist.

1. Output. A one-page summary with questions to bring to a clinician, plus tests that would reduce uncertainty.

Clinician mode adds a criteria view. For conditions with consensus criteria, such as the Bárány Society classification of vestibular disorders, the view shows each criterion as met, not met, or unknown, and lists the missing information. Criteria are encoded from the published text and checked by a clinical editor before release.

Guardrails: the workflow never states a diagnosis, never recommends starting or stopping a medication, and always shows how complete the data is.

## Virtual workbench

The workbench is where patients, clinicians, and researchers turn an observation into a tested solution, moving from hypothesis to protocol to result to evidence, with safety limits built in.

Components:

1. Hypothesis cards. A question, the data and library evidence behind it, and what would confirm or refute it.

1. Intervention library. Each intervention, such as vestibular rehabilitation exercises, psychological therapies, sleep changes, dietary changes, medications, and devices, lists its evidence tier, known risks, and who must supervise it. No drug dosing guidance is given to patients.

1. Protocol builder for n-of-1 experiments. Baseline period, intervention period, washout, pre-chosen outcome measures, and where feasible randomized or blinded ordering. Analysis templates produce a result with its uncertainty.

1. Twin sandbox. What-if simulation inside the model's validated range, always labeled model-generated.

1. Results and sharing. Results stay private by default. With explicit consent they can be contributed to a de-identified research cohort.

1. Concept sheets for innovators. A short template to describe a new idea (a method, an app feature, a device) with prior art from the library, the evidence it would need, and a test plan.

Safety tiers for experiments:

| Tier | Examples | Who can run it |
| --- | --- | --- |
| Self-directed | Tracking, consistent sleep timing, trigger logging, clinician-approved exercises | Patient |
| Clinician-supervised | Dietary elimination, exercise progression, new psychological therapy | Patient with clinician sign-off |
| Clinician-only | Any medication or supplement change, repositioning maneuvers, stimulation devices | Clinician, with ethics review where the work is research |

Researcher mode adds study design, power calculation, preregistration, and an ethics-board packet template. Every workbench object is versioned and keeps an audit trail.

## Evidence library and grounded assistant

The library is a curated, cited knowledge base, and the AI assistant answers only from it. Every entry resolves to a real record.

| Source type | Examples | Used for |
| --- | --- | --- |
| Biomedical literature | PubMed and PubMed Central, Europe PMC | Primary studies and reviews |
| Systematic reviews | Cochrane Library | Highest-tier evidence summaries |
| Trials and funding | ClinicalTrials.gov, NIH RePORTER | What is being tested and funded now |
| Guidelines and criteria | Bárány Society classification, specialty society clinical practice guidelines | Diagnostic criteria and recommended care |
| Drug information | FDA drug labels (DailyMed, openFDA) | Safety, interactions, approved uses |
| Integrity checks | Crossref, including retraction data | Resolving citations and flagging retractions |

Entry standard: citation with DOI or PubMed ID, study design, evidence tier, retraction status, retrieval date, and the license that governs what can be displayed. Summaries are written in two reading levels, patient and clinician, and reviewed by a clinical editor before publication.

Assistant rules:

1. Retrieval first. Answers are built from retrieved library passages and show the supporting passage.

1. Citations are verified. Every citation is resolved against PubMed or Crossref before display. The model never produces a reference from memory.

1. Abstain when unsupported. If the library lacks support, the assistant says so and suggests how to search further.

1. Show conflict. Contradictory studies appear side by side with their designs and sizes.

1. Scope limits. No diagnosis, no medication advice, red-flag routing to urgent-care guidance.

1. Export. Citations export as BibTeX or RIS.

Evidence-gap map: a grid of mechanisms by conditions, computed from the library, registered trials, and funded grants. Each cell shows study counts, highest evidence tier, and a contradiction flag. A gap is reported only when the counts support it, and the map shows the counts.

## Research workspace and pharma tools

Stasus supports drug development by supplying objective measurements, mechanism-based patient subgroups, and trial-design tools. It does not design new molecules.

Why the field fits this role: across vestibular disorders, drug options are few and mostly repurposed, natural recovery is common, and placebo responses are substantial. A [2026 narrative review](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2026.1866969/full) notes that the natural history of vestibular migraine and Ménière's disease includes spontaneous symptom resolution and that placebo responses in vestibular disorders are substantial, which is why trials need objective measures and well-defined subgroups.

Work under way includes registered rimegepant trials in vestibular migraine ([NCT06748664](https://clinicaltrials.gov/study/NCT06748664), [NCT06992674](https://clinicaltrials.gov/study/NCT06992674)), a [randomized trial of a migraine drug in Ménière's disease](https://ohns.ucsf.edu/balance-falls/research) reported by a UCSF lab, and an [open-label study of the investigational drug SPI-1005 (ebselen) in Ménière's disease](https://hifla.org/research/menieres-disease-drug-trial/) that closed enrollment in June 2026.

Where drug and trial work fits, by condition:

| Condition | Drug picture today | Where drug or trial work could matter | Basis |
| --- | --- | --- | --- |
| BPPV | Repositioning maneuvers are the recommended first-line treatment for posterior canal BPPV | Drug discovery is not the main lever; the value is in tracking recurrence and residual dizziness | [AAO-HNSF guideline](https://aao-hnsfjournals.onlinelibrary.wiley.com/doi/10.1177/0194599816689667) |
| Vestibular neuritis and acute vestibular syndrome | Corticosteroids enhance recovery of peripheral function but, per one study's background, do not improve long-term symptom recovery | Preventing progression to chronic dizziness and identifying at-risk patients early; reported risk factors include pre-existing anxiety and visual dependence | [Cousins et al.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4169430/) |
| PPPD | A Cochrane review found no placebo-controlled randomized trials of SSRIs or SNRIs; a meta-analysis found added benefit from cognitive behavioral therapy and called for more trials | Adequately powered randomized trials, objective endpoints, and subtype stratification | [Cochrane review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9997546/), [meta-analysis](https://pubmed.ncbi.nlm.nih.gov/38350404/) |
| Mal de débarquement syndrome | Common vestibular suppressants are reported as nearly always ineffective; optokinetic rehabilitation is the most studied treatment | Mechanism-based approaches and endpoints that track change over months | [Scoping review](https://www.researchgate.net/publication/368542277_Treatment_Options_in_Mal_de_Debarquement_Syndrome_A_Scoping_Review), [Vestibular Disorders Association](https://vestibular.org/article/diagnosis-treatment/types-of-vestibular-disorders/mal-de-debarquement/) |
| Ménière's disease | No approved causal pharmacotherapy; candidates include the antioxidant ebselen (SPI-1005) and migraine drugs | Objective endpoints and subgroups, such as patients whose disease overlaps with migraine | [2026 review](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2026.1866969/full), [UCSF](https://ohns.ucsf.edu/balance-falls/research) |
| Vestibular migraine | Evidence is scarce; CGRP-targeted drugs are under study | Subgroups and objective vestibular endpoints | [Network meta-analysis](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10771287/), [NCT06748664](https://clinicaltrials.gov/study/NCT06748664) |
| Vestibular hair-cell loss | Regeneration drugs restored vestibular function in mouse models ([JCI](https://www.jci.org/articles/view/181201)); clinical value is unknown given central compensation | Long-term; monitor the preclinical literature | [Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9124819/) |

Vestibular schwannoma and other structural causes follow oncology pathways and are outside near-term scope.

Research workspace:

1. Cohort builder with consent-aware filters and de-identification.

1. Versioned datasets and analysis notebooks with reproducible environments.

1. Preregistration and an audit trail for every analysis.

1. Data standards: FHIR for exchange with hospitals and OMOP for research analytics.

1. Study designer with power calculation and an ethics-board packet template.

Pharma and academic tools:

| Tool | What it does |
| --- | --- |
| Endpoint library | Objective measures with their validation status, test-retest reliability, and sources |
| Subgroup discovery | Groups patients by measured mechanism pattern instead of one broad diagnosis |
| Trial simulation | Uses per-person twin predictions as prognostic covariates to estimate sample size and power. Other companies apply the same idea in other diseases; precedent citations are to be added to the appendix |
| Eligibility matching | Matches consenting participants to registered trials through ClinicalTrials.gov |
| Drug-hypothesis workbench | Links a mechanism to targets and known compounds using open databases such as Open Targets, UniProt, and ChEMBL, and outputs labeled hypotheses with provenance |

Boundaries: the workbench produces hypotheses for scientists to test. It never states that a compound works. Partnerships with hospitals, universities, and pharma run through data-use agreements, ethics review, and participant consent.

## Drug development path

Stasus supports drug development in three stages: enable trials now, generate hypotheses with partners next, and consider an own pipeline only after a validated target exists.

Why not start with new molecules: discovery is a long, high-attrition path. Across 2011 to 2020, [7.9 percent of programs entering Phase I reached approval, 5.9 percent in neurology, Phase II was the largest hurdle, and Phase I to approval averaged 10.5 years](https://go.bio.org/rs/490-EHZ-999/images/ClinicalDevelopmentSuccessRates2011_2020.pdf). In vestibular disorders, targets are uncertain, as [no approved causal drug exists for Ménière's disease](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2026.1866969/full). The [blood-labyrinth barrier restricts entry of most blood-borne compounds into the inner ear](https://www.science.org/doi/10.1126/scitranslmed.aao0935), and [animal models can misrepresent how drugs distribute after local injection](https://pmc.ncbi.nlm.nih.gov/articles/PMC13496270/). Natural recovery and placebo responses add noise to trials.

| Stage | What Stasus does | What it needs | Gate to the next stage |
| --- | --- | --- | --- |
| 1. Enable | Provides endpoints, patient subgroups, natural-history baselines, and trial simulation | Validated measures, a consented cohort, an academic partner | Endpoint reliability and responsiveness shown in a validation study |
| 2. Hypothesize and partner | Produces target and repurposing hypotheses with provenance; partner labs test them | A pharmacology advisor, a bioinformatician, data-use and IP agreements, ethics approval | A hypothesis supported by independent data and a partner willing to test it |
| 3. Own pipeline | Chemistry, safety testing, regulatory filing, Phase I to III trials | Experienced drug-development leadership, major funding, a validated target and delivery route | Decided separately; not planned in this PRD |

Repurposing approved drugs is the shorter route and is what current vestibular trials do, such as the rimegepant studies in vestibular migraine and the UCSF migraine-drug trial in Ménière's disease.

Drug-hypothesis workbench, software only, built now:

1. Condition, mechanism, and target map from Open Targets, UniProt, ChEMBL, ClinicalTrials.gov, and FDA drug labels. Every link carries a source and an evidence tier. Each database's license is checked before use.

1. Repurposing shortlist of approved drugs with a plausible mechanism, showing label safety and interaction data, existing trials, and a flag for peripheral inner-ear targets (delivery barrier) versus central targets.

1. Patient subtyping from twin data to define candidate subgroups. In a large analysis, [trials that select patients by biomarkers had higher success probabilities, though biomarkers are rarely used outside oncology](https://dspace.mit.edu/bitstream/handle/1721.1/128480/kxx069.pdf?sequence=1). Subgroups are hypotheses until a trial tests them.

1. Endpoint validation per condition: test-retest reliability, smallest meaningful change, and responsiveness.

1. Natural-history and placebo baselines per condition, built from a consented longitudinal cohort.

1. Trial tools: sample-size simulation and eligibility matching.

Rules: outputs are hypotheses, and the workbench never states that a compound works. Each hypothesis lists evidence for, evidence against, and missing evidence, and partner scientists review it before any wet-lab work.

## Data, ML, and system architecture

system architecture · 5 layers, top to bottom

Classical signal processing and mechanistic modeling come first. Machine learning enters in two places: the grounded assistant, which retrieves from the library, and the discovery layer, which waits until enough labeled data exists.

Model lifecycle:

1. Every model has a version, a model card, held-out validation, and drift monitoring.

1. Synthetic data from the mechanistic model is used for testing and early development. It is always labeled synthetic.

1. Deep learning is introduced only after hundreds of labeled sessions exist; before that, simpler statistics avoid overfitting.

1. Standards: FHIR for clinical exchange, OMOP for research analytics, anatomical IDs for the viewer, and open formats for exports.

Brain-computer interface path: electroencephalography enters as another research input after the core twin is validated. Closed-loop stimulation is a separate regulated product line with its own plan and is not part of the first releases.

## Regulatory, privacy, and safety posture

Early phases are positioned as research tooling and clinician decision support, with no diagnostic or treatment claims. The exact regulatory classification of each feature must be confirmed with regulatory counsel before launch, because software that diagnoses or directs treatment can be regulated as a medical device, and any stimulation hardware is a separate device pathway.

| Area | Approach |
| --- | --- |
| Intended use | Written per feature and kept consistent with product copy. No cure or treatment claims |
| Medical device rules | Counsel reviews each release against current FDA software and clinical decision support guidance; stimulation hardware is gated behind its own regulatory plan |
| Privacy | HIPAA-aligned controls and business associate agreements where institutions share patient data; GDPR readiness for EU users; data minimization; explicit, revocable consent for research use |
| Research ethics | Ethics-board approval for any study; informed consent; registration of studies where required |
| Security | Encryption in transit and at rest, role-based access, audit logging, SOC 2 as a planned milestone |
| AI governance | Model cards, held-out validation, drift monitoring, human review of library content, no unverified citations |
| User safety | Red-flag screening, urgent-care guidance, no medication advice to patients, adult users only at launch |
| Fairness | Report camera-measurement performance across skin tones, eyewear, lighting, and devices before any clinical claim |
| Content liability | Library entries cite sources, show dates, and display retraction status |

## Roadmap, metrics, risks, and open questions

roadmap · 5 phases, 4 gates

Phases are sequenced by gates, not dates, because the build is solo and the gates depend on validation and partner access. The library, gap map, and viewer need no new hardware and come first; the brain-computer interface and stimulation work come last.

### Success metrics

| Metric | Target | Phase |
| --- | --- | --- |
| Library citations that resolve to a real record | 100 percent, checked automatically | 1 |
| Claims shown without a source | Zero | 1 |
| Viewer structures that show a value or an explicit no-data state | All selectable structures | 1 |
| Taps for a clinician to reach any structure's data | Three or fewer | 1 |
| Twin held-out prediction error | Threshold set from literature before the study | 2 and 3 |
| Academic partner and ethics approval in place | Signed before the validation study | 3 |

### Risks

| Risk | Mitigation |
| --- | --- |
| Scope too broad for a solo build | Phase gates; library and viewer first; domains enter only through the evidence process |
| Unsupported medical claims or invented citations | Verified citations, retrieval-only answers, clinical editor review, abstention |
| Regulatory classification of features | Counsel review per release; research and decision-support positioning; hardware kept separate |
| Anatomy asset licensing | BodyParts3D with attribution, no Z-Anatomy non-commercial parts, commissioned inner ear, legal review |
| Camera-measurement bias | Fairness testing across skin tones, eyewear, lighting, and devices before clinical claims |
| Institutional trust | Validation data, provenance, security controls, and clinical advisors |

### Open questions

1. Which per-condition figures need full-text checking before external use, and which article did the 80 to 90 percent figure come from?

1. Which conditions launch first, given the different evidence and data needs of BPPV, PPPD, Ménière's disease, vestibular migraine, mal de débarquement syndrome, and others?

1. Who are the first clinical advisors and the first academic partner?

1. Who acts as clinical editor for the evidence library?

1. Which precedent citations support twin-based trial design in other diseases?

1. What is the commissioning budget and timeline for the inner-ear and vestibular models?

## Sources

Cited above, as of 2026-10-05. Claims were drawn from search excerpts of these pages and must be checked against the full pages before external use. Not yet sourced: the precedent for twin-based trial design. Figures in the conditions table come from abstracts and excerpts, because the full text of several articles could not be opened, and need checking against the full papers.

- [Ménière's disease trials, UC Health](https://clinicaltrials.ucbraid.org/menieres-disease)

- [Prophylactic treatments for vestibular migraine: network meta-analysis, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10771287/)

- [NCT06748664: rimegepant in vestibular migraine](https://clinicaltrials.gov/study/NCT06748664)

- [NCT06992674: rimegepant in vestibular migraine](https://clinicaltrials.gov/study/NCT06992674)

- [UCSF balance and falls research](https://ohns.ucsf.edu/balance-falls/research)

- [SPI-1005 open-label study in Ménière's disease, HIFLA](https://hifla.org/research/menieres-disease-drug-trial/)

- [BodyParts3D license](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)

- [Z-Anatomy repository and license](https://github.com/Z-Anatomy/Models-of-human-anatomy)

- [Clinical evolution of acute vestibular syndrome, J Pers Med, 2023](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10059062/)

- [Visual dependency and dizziness after vestibular neuritis, Cousins et al.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4169430/)

- [Persistent dizziness after vestibular neuritis, Frontiers in Neurology, 2023](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2023.1243034/xml)

- [PPPD diagnostic criteria, Bárány Society consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9249299/)

- [MdDS diagnostic criteria, Bárány Society consensus](https://pmc.ncbi.nlm.nih.gov/articles/PMC9249277/)

- [BPPV clinical practice guideline update, AAO-HNSF, 2017](https://aao-hnsfjournals.onlinelibrary.wiley.com/doi/10.1177/0194599816689667)

- [Short- and long-term outcomes of canalith repositioning, PubMed](https://pubmed.ncbi.nlm.nih.gov/10793340/)

- [Changes in symptom pattern in Ménière's disease by duration, Frontiers in Neurology, 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11581947/)

- [Pharmacological interventions for PPPD, Cochrane review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9997546/)

- [Additional cognitive behavior therapy for PPPD: meta-analysis, PubMed](https://pubmed.ncbi.nlm.nih.gov/38350404/)

- [Innovations in therapy for Ménière's disease, Frontiers in Neurology, 2026](https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2026.1866969/full)

- [Treatment options in mal de débarquement syndrome: scoping review](https://www.researchgate.net/publication/368542277_Treatment_Options_in_Mal_de_Debarquement_Syndrome_A_Scoping_Review)

- [Mal de débarquement, Vestibular Disorders Association](https://vestibular.org/article/diagnosis-treatment/types-of-vestibular-disorders/mal-de-debarquement/)

- [Pharmacological regeneration of vestibular hair cells in mice, JCI](https://www.jci.org/articles/view/181201)

- [Hearing loss: the final frontier of pharmacology, review](https://pmc.ncbi.nlm.nih.gov/articles/PMC9124819/)

- [Clinical Development Success Rates and Contributing Factors 2011 to 2020, BIO](https://go.bio.org/rs/490-EHZ-999/images/ClinicalDevelopmentSuccessRates2011_2020.pdf)

- [Delivery of therapeutics to the inner ear: the blood-labyrinth barrier, Science Translational Medicine](https://www.science.org/doi/10.1126/scitranslmed.aao0935)

- [Biodistribution of intratympanically administered drugs, porcine ex vivo model](https://pmc.ncbi.nlm.nih.gov/articles/PMC13496270/)

- [Estimation of clinical trial success rates and related parameters, Wong et al., Biostatistics, 2019](https://dspace.mit.edu/bitstream/handle/1721.1/128480/kxx069.pdf?sequence=1)
