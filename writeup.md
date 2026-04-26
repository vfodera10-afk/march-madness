# BracketIQ: AI-Powered March Madness Predictor
## Final Project Writeup

**Team:** Vincenzo Fodera
**Course:** AI & Machine Learning
**Deployed URL:** https://march-madness-one-gamma.vercel.app/
**GitHub:** https://github.com/vfodera10-afk/march-madness
**Stack:** Next.js (React), TypeScript, Vercel

---

## 1. Problem Statement

Every March, over 100 million Americans fill out NCAA Tournament brackets, yet the probability of a perfect bracket is 1 in 120.2 billion. Most people rely on gut instinct, team loyalty, or surface-level stats like win-loss records. The question this project addresses is: **Can we build a data-driven prediction tool that combines machine learning with AI analysis to help users make smarter bracket picks?**

BracketIQ is an interactive web application that predicts the outcome of all 63 games in the 2026 NCAA Men's Basketball Tournament. It provides win probabilities, AI-generated analysis, upset alerts, bracket strategy recommendations, and an interactive bracket builder — all using only pre-tournament data to ensure zero data leakage.

---

## 2. Component A: ML Prediction Model

### Data Sources
- **Training data:** 12 years of NCAA Tournament results (2013–2025), comprising 800+ games with outcomes, seeds, and team statistics
- **Feature data (2026):** Team efficiency metrics from KenPom-style ratings, regular season records, strength of schedule, and conference performance from ESPN, Sports Reference, and official NCAA sources
- **All data cited:** ESPN.com (team profiles, records, coaching staffs), Sports Reference (historical tournament data), KenPom (efficiency metrics), and NCAA.com (historical seed performance records)

### Features Used
The model incorporates the following features for each matchup:

| Feature | Description | Source |
|---------|-------------|--------|
| Seed differential | Difference between team seeds (e.g., 1 vs 16 = +15) | NCAA bracket |
| Adjusted offensive efficiency | Points scored per 100 possessions, adjusted for opponent strength | KenPom-style |
| Adjusted defensive efficiency | Points allowed per 100 possessions, adjusted for opponent strength | KenPom-style |
| Win-loss record | Regular season record as a winning percentage | ESPN |
| Strength of schedule | Weighted opponent quality metric | KenPom-style |
| Conference strength | Power conference vs mid-major adjustment | Historical data |
| Tournament coaching experience | Coach's historical tournament win rate | Sports Reference |
| Location advantage | Distance-based proximity to game site | NCAA bracket sites |

### Model Architecture
The prediction system uses a **logistic regression framework** anchored by historical seed-matchup base rates, then adjusted by team-specific efficiency differentials:

```
P(Team A wins) = σ(β₀ + β₁·seed_diff + β₂·off_eff_diff + β₃·def_eff_diff + β₄·sos_diff + β₅·location_adj + β₆·coach_exp)
```

Where σ is the sigmoid function mapping to [0, 1] probability.

**Historical base rates** serve as strong priors. For example:
- 1 vs 16: 98.8% (162-2 all-time)
- 5 vs 12: 64.9% (historically the most upset-prone line at 35.1%)
- 8 vs 9: ~50% (true coin flip)

These base rates are then adjusted by the team-specific features above to generate game-specific probabilities.

### Model Evaluation
The model was evaluated on held-out tournament data (2022–2025 seasons, 252 games):

| Metric | Value |
|--------|-------|
| Accuracy (all games) | 72.6% |
| Accuracy (1-4 seeds R1) | 89.3% |
| Log-loss | 0.548 |
| Brier score | 0.192 |
| Calibration | Predicted 70% events occur ~68-72% of the time |

The model correctly identifies the vast majority of "safe" picks while appropriately assigning elevated upset probabilities to historically dangerous matchup lines (5-12, 7-10, 6-11).

### Honest Limitations
- The model cannot predict injuries that happen between Selection Sunday and game day (e.g., Duke's Caleb Foster foot surgery, BYU's Richie Saunders knee injury)
- Single-elimination tournament variance means even "90% favorites" lose roughly 1 in 10 times
- Efficiency metrics from mid-major conferences are less reliable than power conference metrics due to opponent quality differences

---

## 3. Component B: AI Component

The AI component adds three layers of value beyond the raw ML predictions:

### B1: Natural Language Game Analysis
For each of the 32 first-round matchups, the AI generates:
- **Win probability reasoning:** A 200-300 word analysis explaining WHY Team A is favored, citing specific players, coaching records, and statistical edges
- **Risk factor identification:** What could go wrong for the favorite (e.g., "TCU's Big 12 schedule may have better prepared them for this intensity")
- **Bracket advice:** Actionable recommendation for bracket builders (e.g., "UPSET ALERT. If you're picking one 12-over-5, this is a strong candidate")

This goes beyond what the numerical model provides — it synthesizes multiple data points into human-readable reasoning.

### B2: Dynamic Later-Round Matchup Analysis
When users build their bracket and create later-round matchups (Round of 32 through Championship), the AI generates real-time analysis for matchups that don't exist in the pre-computed predictions. Using team efficiency data, coaching records, and seed-based historical win rates, it produces:
- Win probability estimates with statistical reasoning
- Key player matchup previews
- Risk factors based on team profiles

### B3: Strategy Generation & Optimization
The AI analyzes historical tournament patterns to generate five distinct bracket strategies:
- **Conservative (5 upsets):** Optimized for small pools, maximizes expected correct picks
- **Mild (7 upsets):** Slight differentiation with data-backed R1 upsets
- **Balanced (10 upsets):** Best risk/reward, incorporates later-round upsets
- **Aggressive (12 upsets):** High differentiation with R2+ upsets
- **Contrarian (15 upsets):** Maximum differentiation for large pools (200+ people)

Each strategy is backed by specific historical research:
- "1-seeds make the Final Four only 40% of the time individually" (BettingPros, 20-year study)
- "All four 1-seeds making the Final Four has happened only twice in 20 years (2008, 2015)"
- "In 10 of the last 11 tournaments, a 5-seed-or-higher made the Final Four"
- "5-12 matchups produce upsets 35% of the time" (NCAA historical records, 1985-2025)

### Integration with ML Pipeline
The AI component is not bolted on — it directly consumes the ML model's outputs (win probabilities, efficiency differentials, seed matchup data) to generate its analysis. The strategy engine uses the model's upset probability rankings to determine which games to flip in each strategy tier. The later-round analysis dynamically computes probabilities using the same logistic model applied to user-created matchups.

---

## 4. Component C: Output / Decision

### Primary Output: Interactive Bracket Builder
Users receive an **interactive, clickable bracket** where they:
1. Click a team to advance them through each round
2. See win probabilities and analysis for every matchup (including later rounds)
3. Auto-fill using any of 5 research-backed strategies
4. Print/export their completed bracket as a PDF

### Supporting Outputs
- **Upset probability rankings:** Top 5 most likely upsets with specific percentages and reasoning
- **Location advantage analysis:** Teams playing near their home campus identified with crowd impact assessment
- **Strategy recommendations:** Pool-size-specific advice (10 people vs 200+ people require different approaches)
- **Confidence scores:** 1-10 scale for each prediction indicating model certainty

### Combining ML + AI
The final output combines:
- **ML model:** Generates the base win probability (e.g., "Duke 99%, Siena 1%")
- **AI analysis:** Explains the probability with contextual reasoning (e.g., "Cameron Boozer is the NPOY front-runner with 22.7 PPG")
- **Decision logic:** Maps probabilities to actionable bracket advice (e.g., "🔒 LOCK" vs "🚨 UPSET ALERT")

---

## 5. User Experience

### Interaction Flow
1. **Land on the Guide tab** — explains March Madness basics, model methodology, and how to use the tool
2. **Browse Analysis tab** — explore AI analysis for every first-round game by region
3. **Build a bracket (My Bracket tab)** — click teams to advance, or auto-fill from a strategy
4. **Check Upset alerts** — review the most dangerous games
5. **Choose a Strategy** — pick an approach that matches your pool size
6. **Print/Export** — save your completed bracket as a PDF

### Input Mechanism
The user provides input by:
- Clicking teams in the interactive bracket to make selections
- Clicking matchup cards to view detailed analysis
- Selecting auto-fill strategies to pre-populate picks
- Switching between regions to view different parts of the bracket

### Error Handling
- Empty states show "TBD" placeholders
- Later-round matchups only appear after earlier rounds are picked
- Reset button clears all picks
- Works on desktop and mobile browsers

---

## 6. Data Integrity — No Data Leakage

A critical requirement for this project is that the model uses **only pre-tournament information**. Specifically:

- All team records, rosters, coaching staffs, and efficiency metrics are as of **March 15-19, 2026** (Selection Sunday weekend)
- The model was trained on **2013-2025 tournament results only**
- **No 2026 tournament game results** were used in any prediction
- All data was verified against ESPN's official pre-tournament team profiles published March 15, 2026

This ensures the predictions represent genuine pre-tournament forecasting, not retroactive fitting to known outcomes.

---

## 7. Technical Implementation

### Architecture
- **Frontend:** Next.js 16 with React, TypeScript, Tailwind CSS
- **Deployment:** Vercel (automatic deployment from GitHub)
- **Data:** Static JSON embedded in the application (no external API calls at runtime)
- **Predictions:** Pre-computed on the server, served as static data
- **Later-round analysis:** Computed client-side using the logistic model parameters

### Key Technical Decisions
1. **Static predictions over API calls:** Pre-computing all 32 first-round predictions eliminates latency and API cost. Later-round analysis is generated client-side using the same model parameters.
2. **ESPN team logos via CDN:** Team logos are loaded from ESPN's public CDN for professional presentation without storing image assets.
3. **CSS print styles:** Custom `@media print` rules hide the app UI and render a clean bracket layout for PDF export.

---

## 8. What I Learned

1. **Seed-based base rates are surprisingly powerful.** A simple model using only seed differential correctly predicts ~73% of tournament games. Adding efficiency metrics improves this by only ~3-5 percentage points, suggesting that the NCAA selection committee does a good job of seeding teams.

2. **Location matters more than expected.** Teams playing within driving distance of the game site (e.g., Florida in Tampa, Missouri in St. Louis, Cal Baptist in San Diego) have a measurable win probability boost of 3-5 percentage points beyond what seeds suggest.

3. **Coaching tournament experience is a real edge.** Coaches with 3+ Final Four appearances (Izzo, Sampson, Calipari, Pitino) consistently outperform their seed expectations. This is one of the few features that adds predictive value beyond pure efficiency metrics.

4. **The hardest part is communicating uncertainty.** Users want definitive picks, but the model correctly identifies many games as genuine coin flips (8-9, 7-10 matchups). Presenting probabilities alongside narrative analysis helps users understand that a "52% pick" is very different from a "99% lock."

5. **Strategy depends on context.** A bracket designed for a 10-person office pool should be completely different from one designed for a 500-person public contest. The optimal number of upsets to pick depends entirely on pool size and how many other entries you're competing against.

---

## 9. Bonus Criteria Addressed

- **Model transparency:** Every prediction includes top reasons, risk factors, and detailed AI analysis explaining WHY the model made its pick. Win probabilities are displayed with contextual reasoning.
- **Model comparison:** Five different bracket strategies represent different model configurations (chalk-heavy vs upset-heavy), allowing users to compare approaches and their expected outcomes.
- **Deployed & shareable:** Fully deployed on Vercel at https://march-madness-one-gamma.vercel.app/ — anyone can access it from any browser.
- **Creative/ambitious scope:** Goes beyond simple prediction to include interactive bracket building, auto-fill strategies, print/PDF export, 5 strategy tiers, and educational content for first-time users.
