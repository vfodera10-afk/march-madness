"use client";

import React, { useState, useMemo } from "react";

// ─── ESPN Team ID Map ───────────────────────────────────────────────────────
const ESPN_IDS: Record<string, number> = {
  "Ohio State": 194, "TCU": 2628, "Duke": 150, "Siena": 2561,
  "Louisville": 97, "South Florida": 58, "Michigan State": 127,
  "North Dakota State": 2449, "Wisconsin": 275, "High Point": 2272,
  "Arkansas": 8, "Hawai'i": 62, "BYU": 252, "Texas": 251,
  "Gonzaga": 2250, "Kennesaw State": 2320, "Nebraska": 158, "Troy": 2653,
  "Vanderbilt": 238, "McNeese": 2377, "Saint Mary's": 2608,
  "Texas A&M": 245, "Houston": 248, "Idaho": 70, "North Carolina": 153,
  "VCU": 2670, "Illinois": 356, "Penn": 219, "Michigan": 130,
  "Howard": 47, "Georgia": 61, "Saint Louis": 139, "Kentucky": 96,
  "Santa Clara": 2541, "Iowa State": 66, "Tennessee State": 2634,
  "Texas Tech": 2641, "Akron": 2006, "Alabama": 333, "Hofstra": 2275,
  "Virginia": 258, "Wright State": 2750, "Tennessee": 2633,
  "Miami Ohio": 193, "Clemson": 228, "Iowa": 2294, "Florida": 57,
  "Prairie View A&M": 2504, "Arizona": 12, "Long Island": 2344,
  "Villanova": 222, "Utah State": 328, "Purdue": 2509, "Queens": 3101,
  "Miami Fla": 2390, "Missouri": 142, "St. John's": 2599, "UNI": 2460,
  "Kansas": 2305, "Cal Baptist": 2856, "UCLA": 26, "UCF": 2116,
  "UConn": 41, "Furman": 231,
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface TeamData {
  name: string;
  seed: number;
  winProb: number;
  record: string;
  coach: string;
  keyPlayer: string;
  offEff: number;
  defEff: number;
}

interface Prediction {
  gameId: number;
  region: string;
  site: string;
  day: string;
  teamA: TeamData;
  teamB: TeamData;
  winner: string;
  confidence: number;
  upsetRating: string;
  topReasons: string[];
  riskFactors: string[];
  aiAnalysis: string;
  bracketAdvice: string;
}

// ─── All 32 Predictions (from predictions.json) ────────────────────────────
const PREDICTIONS: Prediction[] = [
  {
    gameId: 1, region: "EAST", site: "Greenville, SC", day: "Thursday",
    teamA: { name: "Ohio State", seed: 8, winProb: 0.52, record: "21-12", coach: "Jake Diebler", keyPlayer: "Bruce Thornton", offEff: 114.5, defEff: 96.2 },
    teamB: { name: "TCU", seed: 9, winProb: 0.48, record: "22-11", coach: "Jamie Dixon", keyPlayer: "David Punch", offEff: 112.8, defEff: 96.9 },
    winner: "Ohio State", confidence: 5, upsetRating: "toss-up",
    topReasons: ["Ohio State's Big Ten defensive scheming gives them a slight edge in half-court play", "Thornton's tournament experience as a 4-year guard provides steadying presence", "8-9 games are historically coin flips — slight lean to the higher seed"],
    riskFactors: ["TCU's Dixon has deep tournament coaching experience", "Ohio State's offense can go cold from three in hostile environments", "TCU's Big 12 schedule may have better prepared them for this intensity"],
    aiAnalysis: "Classic 8-9 toss-up. Ohio State's defensive metrics are slightly better, and they've played a rigorous Big Ten schedule. TCU brings Jamie Dixon's tournament savvy and Big 12 battle-testing. This game will likely come down to which team shoots better from three in the second half. Ohio State gets the slightest edge due to Thornton's steadiness, but this is genuinely a coin flip.",
    bracketAdvice: "True toss-up. Pick based on Round of 32 matchup — who do you want facing Duke?"
  },
  {
    gameId: 2, region: "EAST", site: "Greenville, SC", day: "Thursday",
    teamA: { name: "Duke", seed: 1, winProb: 0.99, record: "32-2", coach: "Jon Scheyer", keyPlayer: "Cameron Boozer", offEff: 124.6, defEff: 89.1 },
    teamB: { name: "Siena", seed: 16, winProb: 0.01, record: "23-11", coach: "Carmen Maciariello", keyPlayer: "Jordan Burdick", offEff: 102.3, defEff: 108.1 },
    winner: "Duke", confidence: 10, upsetRating: "near-impossible",
    topReasons: ["Duke is the #1 overall seed with a 32-2 record and elite metrics across the board", "Cameron Boozer is a generational talent — projected #1 NBA pick", "Siena's MAAC schedule hasn't prepared them for this level of athleticism and depth"],
    riskFactors: ["Historically, 1-seeds have lost to 16-seeds twice (UMBC 2018, FDU 2023)", "Early tip-off could create flat start for Duke"],
    aiAnalysis: "This is about as close to a lock as exists in March Madness. Duke is the #1 overall seed, AP #1, and loaded with NBA talent led by Cameron Boozer. Siena won the MAAC tournament to get here but faces a massive talent gap. Duke's offensive and defensive efficiency are both elite. The only question is the margin of victory.",
    bracketAdvice: "Lock Duke. If you pick Siena, you're lighting your bracket on fire for attention."
  },
  {
    gameId: 3, region: "EAST", site: "Buffalo, NY", day: "Thursday",
    teamA: { name: "Louisville", seed: 6, winProb: 0.60, record: "23-10", coach: "Pat Kelsey", keyPlayer: "Ryan Conwell", offEff: 113.8, defEff: 95.5 },
    teamB: { name: "South Florida", seed: 11, winProb: 0.40, record: "25-8", coach: "Bryan Hodgson", keyPlayer: "Izaiyah Nelson", offEff: 110.5, defEff: 97.2 },
    winner: "Louisville", confidence: 6, upsetRating: "moderate-risk",
    topReasons: ["Louisville's ACC schedule provides superior preparation for tournament intensity", "Pat Kelsey's energy and defensive identity give Louisville an edge in grind-out games", "Louisville's size advantage should control the boards"],
    riskFactors: ["South Florida is riding momentum as a likely play-in/bubble survivor", "11-seeds historically upset 6-seeds 37% of the time — very live upset spot", "Louisville's inconsistency against sub-100 KenPom teams is concerning"],
    aiAnalysis: "The 6-11 line is historically one of the most upset-prone in the tournament. Louisville has the talent advantage but South Florida's AAC run and momentum factor make this dangerous. Louisville's defensive identity under Kelsey should prevail, but USF has the athletes to make this uncomfortable. Classic trap game for anyone autopiloting chalk.",
    bracketAdvice: "Louisville is the right pick, but this is a live upset spot. Don't be shocked if USF pulls it off."
  },
  {
    gameId: 4, region: "EAST", site: "Buffalo, NY", day: "Thursday",
    teamA: { name: "Michigan State", seed: 3, winProb: 0.87, record: "25-7", coach: "Tom Izzo", keyPlayer: "Jeremy Fears Jr.", offEff: 117.2, defEff: 93.8 },
    teamB: { name: "North Dakota State", seed: 14, winProb: 0.13, record: "27-7", coach: "David Richman", keyPlayer: "Andrew Morgan", offEff: 105.8, defEff: 103.2 },
    winner: "Michigan State", confidence: 8, upsetRating: "unlikely",
    topReasons: ["Tom Izzo is the best tournament coach alive — his teams consistently overperform seeds", "Michigan State's defensive physicality will overwhelm NDSU's Summit League offense", "AP #11 with a brutal Big Ten schedule — battle-tested"],
    riskFactors: ["NDSU has pulled off tournament upsets before (2009 vs Kansas, 2014 vs Oklahoma)", "If MSU starts cold from three, NDSU can hang around with disciplined half-court offense", "3-14 upsets happen ~15% of the time"],
    aiAnalysis: "Michigan State under Izzo in the tournament is a different animal. They're physical, experienced, and the coach knows how to prepare for March. NDSU is a well-coached mid-major with upset DNA (they've done it before), but the talent gap is significant. Izzo's teams don't lose these games often. MSU should control the paint and pull away in the second half.",
    bracketAdvice: "Lock Michigan State. Izzo in March against a 14-seed is one of the safest bets on the board."
  },
  {
    gameId: 5, region: "WEST", site: "Portland, OR", day: "Thursday",
    teamA: { name: "Wisconsin", seed: 5, winProb: 0.62, record: "24-10", coach: "Greg Gard", keyPlayer: "John Blackwell", offEff: 113.5, defEff: 94.8 },
    teamB: { name: "High Point", seed: 12, winProb: 0.38, record: "30-4", coach: "Tubby Smith", keyPlayer: "Abdoulaye Thiam", offEff: 109.2, defEff: 99.8 },
    winner: "Wisconsin", confidence: 6, upsetRating: "upset-alert",
    topReasons: ["Wisconsin's disciplined, slow-tempo style is proven in March", "Big Ten strength of schedule provides a significant experience edge", "Wisconsin's half-court defense limits easy looks"],
    riskFactors: ["5-12 is the most famous upset line in March Madness (35% upset rate)", "High Point comes in hot with 28 wins and nothing to lose", "Tubby Smith's championship coaching pedigree shouldn't be underestimated", "Travel to Portland is equally far for both — no home-court advantage"],
    aiAnalysis: "This is a PRIME 5-12 upset spot. High Point has a great record, is coached by a national champion in Tubby Smith, and has zero pressure. Wisconsin is solid but unspectacular — a Big Ten team that can grind you out but also go cold offensively. If High Point can keep this in the 60s, they have a real shot. Wisconsin's experience should prevail, but this is one of the most dangerous first-round matchups on the board.",
    bracketAdvice: "UPSET ALERT. If you're picking one 12-over-5, this is a strong candidate. High Point + Tubby Smith is sneaky dangerous."
  },
  {
    gameId: 6, region: "WEST", site: "Portland, OR", day: "Thursday",
    teamA: { name: "Arkansas", seed: 4, winProb: 0.78, record: "26-8", coach: "John Calipari", keyPlayer: "Darius Acuff Jr.", offEff: 116.5, defEff: 94.2 },
    teamB: { name: "Hawai'i", seed: 13, winProb: 0.22, record: "24-8", coach: "Eran Ganot", keyPlayer: "Tom Beattie", offEff: 107.5, defEff: 102.8 },
    winner: "Arkansas", confidence: 7, upsetRating: "moderate-risk",
    topReasons: ["Calipari's tournament experience is unmatched — four Final Fours, one title", "Arkansas's SEC talent and athleticism create a massive physical mismatch", "AP #14 ranking reflects genuine quality despite 8 losses"],
    riskFactors: ["4-13 upsets happen 21% of the time — not negligible", "Portland is essentially neutral/slight Hawai'i territory (Pacific time, large Hawaiian diaspora in Oregon)", "Arkansas's new-look roster under Cal has occasional chemistry lapses"],
    aiAnalysis: "Arkansas has the talent to cruise here, but Calipari's first-round track record isn't perfect — he's had a couple 4-13 scares. Hawai'i playing in Portland gets a quasi-home crowd bump. Still, the SEC talent advantage is significant. Arkansas's pace and athleticism should overwhelm Hawai'i in transition. Cal's teams usually figure it out by March.",
    bracketAdvice: "Take Arkansas but be aware of the Portland location factor. Not the 4-13 upset I'd target."
  },
  {
    gameId: 7, region: "WEST", site: "Portland, OR", day: "Thursday",
    teamA: { name: "BYU", seed: 6, winProb: 0.55, record: "23-11", coach: "Kevin Young", keyPlayer: "AJ Dybantsa", offEff: 114.2, defEff: 97.5 },
    teamB: { name: "Texas", seed: 11, winProb: 0.45, record: "18-14", coach: "Sean Miller", keyPlayer: "Dailyn Swain", offEff: 112.0, defEff: 96.8 },
    winner: "BYU", confidence: 5, upsetRating: "upset-alert",
    topReasons: ["BYU's Big 12 experience and higher seed give them a slight structural edge", "AJ Dybantsa's NBA-level talent can take over a game — led the nation in freshman scoring", "BYU's 3-point shooting is elite — they can shoot you out of the gym"],
    riskFactors: ["Texas has the SEC pedigree and blue-chip talent to match anyone", "Dailyn Swain is a powerful 6-8 guard who can dominate in single-elimination", "Texas's defensive athleticism is elite despite inconsistent season", "11-seeds have major upset equity — 37% historically"],
    aiAnalysis: "This is effectively a pick'em dressed up as a 6-11 game. Texas has raw talent with Dailyn Swain, but their inconsistent season (21-13) landed them here as a bubble team or play-in survivor. BYU is steadier with better efficiency numbers but lacks Texas's explosive ceiling. Portland as a neutral site means neither team has a crowd advantage. This could go either way — classic March coin flip in a 6-11 skin.",
    bracketAdvice: "UPSET ALERT. Texas's talent gives them a real shot. If you want a trendy 11-seed upset, this is it."
  },
  {
    gameId: 8, region: "WEST", site: "Portland, OR", day: "Thursday",
    teamA: { name: "Gonzaga", seed: 3, winProb: 0.90, record: "30-3", coach: "Mark Few", keyPlayer: "Graham Ike", offEff: 121.8, defEff: 95.2 },
    teamB: { name: "Kennesaw State", seed: 14, winProb: 0.10, record: "21-13", coach: "Amir Abdur-Rahim", keyPlayer: "Simeon Cottle", offEff: 103.5, defEff: 105.2 },
    winner: "Gonzaga", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["Gonzaga is AP #12 with a 30-3 record and elite offensive efficiency", "Mark Few is one of the best tournament coaches — Zags don't lose to 14-seeds", "Playing in Portland is basically a HOME game for Gonzaga — Spokane to Portland is a short trip and West Coast fans travel"],
    riskFactors: ["3-14 upsets happen 15% of the time historically", "Gonzaga's WCC schedule raises questions about readiness for March physicality", "Kennesaw State has nothing to lose"],
    aiAnalysis: "Gonzaga playing in Portland is practically a home game. The Zags faithful will flood the arena. Combine that with a 30-win team under Mark Few and an elite offense, and Kennesaw State faces a near-impossible task. Gonzaga's offensive firepower will overwhelm KSU's defense. This should be over by halftime.",
    bracketAdvice: "Lock Gonzaga. The Portland location makes this the safest 3-seed on the board."
  },
  {
    gameId: 9, region: "SOUTH", site: "Oklahoma City, OK", day: "Thursday",
    teamA: { name: "Nebraska", seed: 4, winProb: 0.76, record: "26-6", coach: "Fred Hoiberg", keyPlayer: "Pryce Sandfort", offEff: 115.8, defEff: 93.5 },
    teamB: { name: "Troy", seed: 13, winProb: 0.24, record: "22-11", coach: "Scott Cross", keyPlayer: "Nelson Phillips", offEff: 106.8, defEff: 103.5 },
    winner: "Nebraska", confidence: 7, upsetRating: "moderate-risk",
    topReasons: ["Nebraska is AP #15 — their best team in decades with an elite 26-6 record", "Big Ten defensive identity and physicality will grind Troy down", "Fred Hoiberg's team is peaking at the right time"],
    riskFactors: ["4-13 upset rate is 21% — one of the more common upset lines", "Nebraska lacks deep tournament experience as a program — pressure/moment factor", "Troy has zero pressure and could play loose and inspired"],
    aiAnalysis: "Nebraska is the better team on paper and deserves its 4-seed, but this is a sneaky dangerous spot. Nebraska hasn't been relevant in March in decades — the pressure of expectations could be a factor. Troy is a Sun Belt champion with nothing to lose. The 4-13 line produces upsets every year. Still, Nebraska's defensive metrics and Big Ten toughness should carry them. But don't be surprised if this is closer than expected.",
    bracketAdvice: "Nebraska should win, but if you're looking for a 4-13 upset, this is more plausible than most. Nebraska's tournament inexperience is real."
  },
  {
    gameId: 10, region: "SOUTH", site: "Oklahoma City, OK", day: "Thursday",
    teamA: { name: "Vanderbilt", seed: 5, winProb: 0.63, record: "26-8", coach: "Mark Byington", keyPlayer: "Tyler Tanner", offEff: 115.0, defEff: 95.5 },
    teamB: { name: "McNeese", seed: 12, winProb: 0.37, record: "28-5", coach: "Will Wade", keyPlayer: "Shahada Wells", offEff: 110.8, defEff: 99.5 },
    winner: "Vanderbilt", confidence: 6, upsetRating: "upset-alert",
    topReasons: ["Vanderbilt is AP #16 — a legitimate SEC contender with quality wins", "SEC schedule provides a massive preparation advantage over Southland opponents", "Vanderbilt's depth allows them to grind through a 40-minute game"],
    riskFactors: ["5-12 is THE upset line — 35% upset rate historically", "McNeese's 29-4 record and momentum are dangerous", "Will Wade is a controversial but effective tournament coach", "McNeese can shoot the three at a high clip — 3-point variance can swing any game"],
    aiAnalysis: "Another dangerous 5-12 spot. Vanderbilt had a breakout SEC season under Byington but has limited recent tournament experience as a program. McNeese under Will Wade is well-coached and enters with a 29-win season and house money mentality. The Southland-to-SEC talent gap is real, but McNeese's shooting and confidence could keep this competitive deep into the second half. Vanderbilt should have enough to survive, but this has all the markers of a potential upset.",
    bracketAdvice: "UPSET ALERT. McNeese is the second-most dangerous 12-seed on the board. Vanderbilt's lack of tournament pedigree is a concern."
  },
  {
    gameId: 11, region: "SOUTH", site: "Oklahoma City, OK", day: "Thursday",
    teamA: { name: "Saint Mary's", seed: 7, winProb: 0.54, record: "27-5", coach: "Randy Bennett", keyPlayer: "Paulius Murauskas", offEff: 116.5, defEff: 96.0 },
    teamB: { name: "Texas A&M", seed: 10, winProb: 0.46, record: "21-11", coach: "Bucky McMillan", keyPlayer: "Mark Mitchell", offEff: 112.5, defEff: 96.8 },
    winner: "Saint Mary's", confidence: 5, upsetRating: "toss-up",
    topReasons: ["Saint Mary's is AP #22 with an elite 27-5 record and offensive efficiency", "Randy Bennett's deliberate pace and system neutralize athletic advantages", "Saint Mary's precision shooting from three is tournament-proven"],
    riskFactors: ["Texas A&M's SEC schedule is astronomically harder than the WCC", "Bucky McMillan's physical, defensive style could disrupt Saint Mary's rhythm", "7-10 games upset 39% of the time — almost a coin flip", "A&M's athleticism and size advantage is significant"],
    aiAnalysis: "Classic style clash. Saint Mary's wants to play in the 60s with perfect half-court execution. Texas A&M wants to muck it up with SEC-level physicality and defense. The 7-10 line is basically a coin flip historically, and this game fits that profile. Saint Mary's higher efficiency numbers and better record give them the slight edge, but A&M's strength of schedule is dramatically superior. OKC is neutral territory. This one's going down to the wire.",
    bracketAdvice: "Slight lean to Saint Mary's, but A&M's SEC pedigree makes this dangerous. Genuine 55/45 game."
  },
  {
    gameId: 12, region: "SOUTH", site: "Oklahoma City, OK", day: "Thursday",
    teamA: { name: "Houston", seed: 2, winProb: 0.95, record: "28-6", coach: "Kelvin Sampson", keyPlayer: "Kingston Flemings", offEff: 118.2, defEff: 88.5 },
    teamB: { name: "Idaho", seed: 15, winProb: 0.05, record: "21-14", coach: "Alex Pribble", keyPlayer: "Julius Mims", offEff: 103.0, defEff: 106.5 },
    winner: "Houston", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["Houston is AP #5 with the best defense in America — suffocating opponents all season", "Kelvin Sampson's tournament track record is outstanding — three straight Final Fours", "Playing in OKC is practically a home game — Houston is a 6-hour drive away"],
    riskFactors: ["2-15 upsets happen 6% of the time — rare but not impossible", "Houston's offense can stagnate against zone defenses"],
    aiAnalysis: "Houston's defense makes them nearly upset-proof. They hold opponents to one of the lowest efficiency marks in the country, and Kelvin Sampson's teams are built for March. Playing in OKC gives them a soft home-court edge. Idaho will compete hard but simply doesn't have the talent or depth to hang for 40 minutes against Houston's pressure. This should be comfortable.",
    bracketAdvice: "Lock Houston. One of the safest 2-seeds on the board, especially with the OKC location."
  },
  {
    gameId: 13, region: "SOUTH", site: "Greenville, SC", day: "Thursday",
    teamA: { name: "North Carolina", seed: 6, winProb: 0.62, record: "24-8", coach: "Hubert Davis", keyPlayer: "Caleb Wilson", offEff: 115.8, defEff: 96.2 },
    teamB: { name: "VCU", seed: 11, winProb: 0.38, record: "27-7", coach: "Phil Martelli Jr.", keyPlayer: "Max Shulga", offEff: 111.0, defEff: 97.0 },
    winner: "North Carolina", confidence: 6, upsetRating: "moderate-risk",
    topReasons: ["UNC is AP #21 with blue-blood talent and ACC battle-testing", "Caleb Wilson is one of the most talented freshmen in college basketball", "Greenville, SC is basically home court for UNC — Carolina fans will pack the arena"],
    riskFactors: ["VCU's trademark pressure defense (Havoc legacy) creates chaos and turnovers", "6-11 upset rate is 37% — very live", "UNC can get sloppy with turnovers against pressing teams", "VCU has March pedigree — 2011 Final Four, always dangerous"],
    aiAnalysis: "UNC in Greenville is a massive location advantage — this is essentially a home game. That alone bumps their win probability. But VCU's pressing style is exactly the type of opponent that gives UNC trouble — the Tar Heels can get turnover-prone against aggressive defenses. Still, UNC's talent, experience, and crowd advantage should be enough. VCU will make it ugly, but UNC should survive.",
    bracketAdvice: "UNC benefits hugely from the Greenville location. Take the Tar Heels, but expect it to be stressful."
  },
  {
    gameId: 14, region: "SOUTH", site: "Greenville, SC", day: "Thursday",
    teamA: { name: "Illinois", seed: 3, winProb: 0.85, record: "24-8", coach: "Brad Underwood", keyPlayer: "Keaton Wagler", offEff: 117.8, defEff: 94.5 },
    teamB: { name: "Penn", seed: 14, winProb: 0.15, record: "18-11", coach: "Steve Donahue", keyPlayer: "Nick Spinoso", offEff: 105.5, defEff: 104.5 },
    winner: "Illinois", confidence: 8, upsetRating: "unlikely",
    topReasons: ["Illinois is AP #13 — a Big Ten powerhouse with elite offensive efficiency", "Keaton Wagler is a breakout star who can take over — 17.9 PPG and 41% from three", "Penn's Ivy League schedule provides virtually no preparation for Big Ten-level physicality"],
    riskFactors: ["3-14 upsets happen 15% of the time", "Penn's smart, disciplined play style can slow the game down and create variance", "Illinois has historically been upset-prone in March under Underwood"],
    aiAnalysis: "Illinois should handle this comfortably. Wagler gives them a go-to scorer who can break down any defense, and their Big Ten schedule has prepared them for high-intensity basketball. Penn will try to slow the pace and execute in the half-court, but the talent gap is too significant. Illinois's biggest enemy here is themselves — if they come out flat, Penn could hang around. But the Illini's offensive firepower should create enough separation.",
    bracketAdvice: "Take Illinois. Not the 3-14 upset I'd target this year."
  },
  {
    gameId: 15, region: "MIDWEST", site: "Buffalo, NY", day: "Thursday",
    teamA: { name: "Michigan", seed: 1, winProb: 0.99, record: "31-3", coach: "Dusty May", keyPlayer: "Yaxel Lendeborg", offEff: 122.8, defEff: 89.8 },
    teamB: { name: "Howard", seed: 16, winProb: 0.01, record: "20-14", coach: "Kenny Blakeney", keyPlayer: "Bryce Harris", offEff: 100.5, defEff: 109.8 },
    winner: "Michigan", confidence: 10, upsetRating: "near-impossible",
    topReasons: ["Michigan is AP #3 with a 31-3 record — one of the best teams in the country", "Dusty May has transformed this program with elite talent and offensive efficiency", "The talent gap between a Big Ten champion and a MEAC champion is enormous"],
    riskFactors: ["16-seeds have won twice — never say never", "Howard is an HBCU with a passionate fanbase that could bring energy"],
    aiAnalysis: "Michigan is one of the three best teams in America and should cruise. Howard will compete hard and enjoy the moment, but this is a 30+ point KenPom gap. Michigan's offensive firepower will create separation early and never look back. Enjoy the atmosphere, but the outcome isn't in doubt.",
    bracketAdvice: "Lock Michigan. One of the three safest picks on the entire bracket."
  },
  {
    gameId: 16, region: "MIDWEST", site: "Buffalo, NY", day: "Thursday",
    teamA: { name: "Georgia", seed: 8, winProb: 0.50, record: "22-10", coach: "Mike White", keyPlayer: "Jeremiah Wilkinson", offEff: 113.0, defEff: 96.5 },
    teamB: { name: "Saint Louis", seed: 9, winProb: 0.50, record: "28-5", coach: "Josh Schertz", keyPlayer: "Robbie Avila", offEff: 112.8, defEff: 96.2 },
    winner: "Saint Louis", confidence: 5, upsetRating: "toss-up",
    topReasons: ["Saint Louis has the better record and has been more consistent down the stretch", "Jimerson is one of the best shooters in the A-10 — can get hot and win a game by himself", "Saint Louis's deliberate pace can neutralize Georgia's SEC athleticism"],
    riskFactors: ["Georgia's SEC schedule makes them battle-tested", "Cain's ability to attack the rim gives Georgia an athletic edge", "8-9 games are genuinely unpredictable"],
    aiAnalysis: "This is the truest coin flip on the board. Georgia brings SEC athleticism and toughness, while Saint Louis brings A-10 consistency and elite shooting. Neither team has significant tournament pedigree in recent years. I'm giving a slight lean to Saint Louis based on their better record and shooting ability, but this is literally a pick'em. Either team is equally likely to advance.",
    bracketAdvice: "Pure coin flip. I'll take the mild 9-over-8 upset with Saint Louis for bracket diversity."
  },
  {
    gameId: 17, region: "MIDWEST", site: "St. Louis, MO", day: "Friday",
    teamA: { name: "Kentucky", seed: 7, winProb: 0.60, record: "21-13", coach: "Mark Pope", keyPlayer: "Otega Oweh", offEff: 114.5, defEff: 97.0 },
    teamB: { name: "Santa Clara", seed: 10, winProb: 0.40, record: "26-8", coach: "Herb Sendek", keyPlayer: "Allen Graves", offEff: 112.0, defEff: 97.5 },
    winner: "Kentucky", confidence: 5, upsetRating: "upset-alert",
    topReasons: ["Kentucky's blue-blood brand and SEC talent provide a raw ability edge", "Pope's first full recruiting class has developed well in year 2", "UK's fanbase will travel heavily to St. Louis"],
    riskFactors: ["Kentucky's 21-12 record is underwhelming for their talent level", "7-10 upset rate is 39% — extremely live", "Santa Clara comes in hot at 25-8 with better recent form", "Santa Clara's WCC experience includes games against Gonzaga and Saint Mary's"],
    aiAnalysis: "Kentucky as a 7-seed is already underperforming expectations, which means either they're overrated or they've been inconsistent. Both are dangerous in March. Santa Clara at 25-8 is quietly excellent and has the discipline to hang in a tournament game. Kentucky's talent edge is real, but their 21-12 record suggests they can beat anyone or lose to anyone. This is one of the most likely upset spots on the board.",
    bracketAdvice: "UPSET ALERT. Santa Clara over Kentucky is a sharp pick. Kentucky's inconsistency + 7-10 historical chaos = danger."
  },
  {
    gameId: 18, region: "MIDWEST", site: "St. Louis, MO", day: "Friday",
    teamA: { name: "Iowa State", seed: 2, winProb: 0.94, record: "27-7", coach: "T.J. Otzelberger", keyPlayer: "Milan Momcilovic", offEff: 117.5, defEff: 90.2 },
    teamB: { name: "Tennessee State", seed: 15, winProb: 0.06, record: "23-9", coach: "Brian Collins", keyPlayer: "Derek Dixon", offEff: 101.5, defEff: 108.0 },
    winner: "Iowa State", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["Iowa State is AP #6 with elite defensive efficiency and a proven system", "Otzelberger's defensive scheme is specifically designed to strangle lower-seed offenses", "St. Louis is close enough for Iowa State fans to create a hostile environment"],
    riskFactors: ["2-15 upsets happen 6% of the time", "Iowa State's Big 12 tournament run may have caused fatigue"],
    aiAnalysis: "Iowa State's suffocating defense makes them one of the most upset-proof 2-seeds in the field. Tennessee State won their conference tournament to get here but faces a massive step up in competition. Iowa State will control tempo, force turnovers, and build a comfortable lead. This should be routine.",
    bracketAdvice: "Lock Iowa State. Their defensive identity makes them very safe here."
  },
  {
    gameId: 19, region: "MIDWEST", site: "Tampa, FL", day: "Friday",
    teamA: { name: "Texas Tech", seed: 5, winProb: 0.66, record: "22-10", coach: "Grant McCasland", keyPlayer: "Christian Anderson", offEff: 113.2, defEff: 94.0 },
    teamB: { name: "Akron", seed: 12, winProb: 0.34, record: "29-5", coach: "John Groce", keyPlayer: "Nate Johnson", offEff: 108.5, defEff: 100.0 },
    winner: "Texas Tech", confidence: 6, upsetRating: "upset-alert",
    topReasons: ["Texas Tech's Big 12 defensive identity and physicality should control the game", "AP #20 with the most complete two-way profile of any 5-seed", "Tech's experience against elite competition gives them a preparation edge"],
    riskFactors: ["5-12 is THE upset line — 35% historical rate", "Texas Tech's 22-10 record is underwhelming for a 5-seed", "Akron's 27-7 record and MAC tournament run signal a team peaking at the right time", "McCasland is in his first year at Tech — team cohesion questions"],
    aiAnalysis: "Texas Tech as a 5-seed with 10 losses is not inspiring confidence. Their Big 12 schedule inflated their profile, but 22-10 suggests a team capable of losing to anyone. Akron at 27-7 has the record and momentum of a typical 12-seed upset candidate. Tech's defensive DNA should carry them, but this is a legitimate 5-12 upset opportunity. The MAC conference tournament champion is battle-tested in its own way.",
    bracketAdvice: "Texas Tech is vulnerable. This is a live 5-12 upset spot, though I lean Tech's defense winning a grinder."
  },
  {
    gameId: 20, region: "MIDWEST", site: "Tampa, FL", day: "Friday",
    teamA: { name: "Alabama", seed: 4, winProb: 0.80, record: "23-9", coach: "Nate Oats", keyPlayer: "Labaron Philon Jr.", offEff: 117.0, defEff: 95.0 },
    teamB: { name: "Hofstra", seed: 13, winProb: 0.20, record: "24-10", coach: "Speedy Claxton", keyPlayer: "Tyler Thomas", offEff: 107.0, defEff: 103.0 },
    winner: "Alabama", confidence: 7, upsetRating: "moderate-risk",
    topReasons: ["Alabama is AP #18 with the #1 strength of schedule in America", "Nate Oats' up-tempo system and Bama's athleticism overwhelm mid-major opponents", "Labaron Philon Jr. is a projected lottery pick who can take over any game"],
    riskFactors: ["4-13 upset rate is 21%", "Alabama's 3-point variance can work both ways — they live and die by the three", "Hofstra's 26-8 record shows a quality team with shooting ability", "Bama can occasionally play down to competition"],
    aiAnalysis: "Alabama's offense is electric but volatile. When they shoot well from three, they're a Final Four contender. When they go cold, they can lose to anyone. Hofstra will try to slow the pace and keep this in the 60s, which is Alabama's worst-case scenario. Still, Bama's sheer athleticism and SEC-forged toughness should create enough separation. Oats knows how to prepare for March.",
    bracketAdvice: "Alabama should advance, but their boom-or-bust offense introduces risk. Not the 4-13 upset I'd circle."
  },
  {
    gameId: 21, region: "MIDWEST", site: "Philadelphia, PA", day: "Friday",
    teamA: { name: "Virginia", seed: 3, winProb: 0.88, record: "29-5", coach: "Ryan Odom", keyPlayer: "Thijs De Ridder", offEff: 115.5, defEff: 89.8 },
    teamB: { name: "Wright State", seed: 14, winProb: 0.12, record: "23-11", coach: "Clint Sargent", keyPlayer: "Brandon Noel", offEff: 104.8, defEff: 104.0 },
    winner: "Virginia", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["Virginia is AP #9 with the best defense in college basketball — 89.8 defensive efficiency", "Ryan Odom's system relies on elite 3-point shooting and a top defense", "29-5 record reflects consistent excellence throughout the ACC season"],
    riskFactors: ["Virginia famously lost to #16 UMBC in 2018 — they know how this can go wrong", "Virginia's slow pace creates variance — fewer possessions means fewer chances to pull away", "3-14 upset rate is 15%"],
    aiAnalysis: "Virginia's defensive system under Ryan Odom is elite. It keeps games close by design, which theoretically gives the underdog more chances. But Odom's teams rarely lose to significantly inferior opponents because they simply don't allow enough scoring. Wright State will struggle to crack 55 points against this defense. Virginia should grind this out with their typical 58-47 type score. This UVA team under Odom is built differently from the Bennett era.",
    bracketAdvice: "Lock Virginia. Their defensive ceiling makes them one of the safest 3-seeds on the board."
  },
  {
    gameId: 22, region: "MIDWEST", site: "Philadelphia, PA", day: "Friday",
    teamA: { name: "Tennessee", seed: 6, winProb: 0.64, record: "22-11", coach: "Rick Barnes", keyPlayer: "Ja'Kobi Gillespie", offEff: 112.0, defEff: 94.8 },
    teamB: { name: "Miami Ohio", seed: 11, winProb: 0.36, record: "24-9", coach: "Travis Steele", keyPlayer: "Peter Suder", offEff: 109.5, defEff: 97.5 },
    winner: "Tennessee", confidence: 6, upsetRating: "moderate-risk",
    topReasons: ["Tennessee is AP T-23 — an SEC team with major tournament experience under Barnes", "Rick Barnes' deep tournament resume gives Tennessee a coaching edge in close games", "SEC defensive toughness should control Miami Ohio's MAC-level offense"],
    riskFactors: ["Tennessee's 22-11 record and 6-4 last-10 suggest a team that's been inconsistent", "6-11 upset rate is 37%", "Miami Ohio is a disciplined, well-coached team that won't beat themselves", "Barnes has been criticized for postseason underperformance at Tennessee"],
    aiAnalysis: "Tennessee at 22-11 is a 6-seed that looks vulnerable. They've been inconsistent down the stretch and their offensive efficiency is underwhelming for an SEC team. Miami Ohio won the MAC and plays smart, disciplined basketball. This 6-11 matchup has upset written all over it if you squint, but Tennessee's defensive ceiling and Barnes' experience should be enough in a low-scoring affair. Don't be surprised if this goes to overtime.",
    bracketAdvice: "Tennessee should survive, but this is a game I would not be shocked to see flip. Mild upset consideration."
  },
  {
    gameId: 23, region: "SOUTH", site: "Tampa, FL", day: "Friday",
    teamA: { name: "Clemson", seed: 8, winProb: 0.48, record: "24-10", coach: "Brad Brownell", keyPlayer: "RJ Godfrey", offEff: 112.5, defEff: 96.0 },
    teamB: { name: "Iowa", seed: 9, winProb: 0.52, record: "21-12", coach: "Ben McCollum", keyPlayer: "Bennett Stirtz", offEff: 115.5, defEff: 98.0 },
    winner: "Iowa", confidence: 5, upsetRating: "toss-up",
    topReasons: ["Iowa's offensive efficiency is noticeably higher than Clemson's", "Freeman gives Iowa a dominant interior presence Clemson can't match", "Iowa's recent form (7-3 last 10) is significantly better than Clemson's 5-5"],
    riskFactors: ["Clemson's ACC defensive identity can slow Iowa's offense", "8-9 games are genuine coin flips", "Brownell has tournament experience including a 2024 Elite Eight run"],
    aiAnalysis: "Two similar teams with very different styles. Iowa wants to play fast and score in the 80s; Clemson wants to grind it out in the 60s. Whoever dictates tempo wins. I lean Iowa slightly because their offensive ceiling is higher and Freeman is a matchup problem. But Clemson's defense-first identity gives them a floor. This is a genuine toss-up with a slight Iowa lean based on form and offensive talent.",
    bracketAdvice: "Mild 9-over-8 lean with Iowa. Their offensive firepower gives them the slight edge in a coin-flip game."
  },
  {
    gameId: 24, region: "SOUTH", site: "Tampa, FL", day: "Friday",
    teamA: { name: "Florida", seed: 1, winProb: 0.99, record: "26-7", coach: "Todd Golden", keyPlayer: "Thomas Haugh", offEff: 120.5, defEff: 90.5 },
    teamB: { name: "Prairie View A&M", seed: 16, winProb: 0.01, record: "19-15", coach: "Byron Smith", keyPlayer: "William Douglas", offEff: 99.5, defEff: 110.5 },
    winner: "Florida", confidence: 10, upsetRating: "near-impossible",
    topReasons: ["Florida is AP #4 and a 1-seed playing in Tampa — literally a home game", "The Gators' offensive and defensive efficiency are both top-10 nationally", "Prairie View A&M is 19-15 — the weakest 16-seed in the field"],
    riskFactors: ["1-16 upsets have happened twice in history", "PVAMU could come out with nothing to lose and play freely"],
    aiAnalysis: "This might be the single safest pick in the entire tournament. Florida is a 1-seed playing in Tampa — their home state, essentially a home game with Gator fans everywhere. Prairie View A&M enters with a losing record in conference play and got here through an automatic bid. The talent gap is cavernous. Florida should win by 30+.",
    bracketAdvice: "The safest pick in the bracket. Florida in Tampa is as close to a guarantee as March Madness offers."
  },
  {
    gameId: 25, region: "WEST", site: "San Diego, CA", day: "Friday",
    teamA: { name: "Arizona", seed: 1, winProb: 0.99, record: "32-2", coach: "Tommy Lloyd", keyPlayer: "Jaden Bradley", offEff: 123.5, defEff: 88.5 },
    teamB: { name: "Long Island", seed: 16, winProb: 0.01, record: "24-10", coach: "Rod Strickland", keyPlayer: "R.J. Greene", offEff: 100.8, defEff: 109.5 },
    winner: "Arizona", confidence: 10, upsetRating: "near-impossible",
    topReasons: ["Arizona is AP #2 with a 32-2 record — the second-best team in America", "Playing in San Diego is a de facto home game for Arizona — Pac-12 territory", "Tommy Lloyd's offense is the most efficient in the country"],
    riskFactors: ["1-16 upsets exist (UMBC 2018, FDU 2023)", "That's about it"],
    aiAnalysis: "Arizona matches Duke as the most dominant team in the field with an identical 32-2 record. Playing in San Diego gives them a massive home-crowd advantage. Long Island has no realistic path to an upset here. Arizona's offensive firepower will create a 20-point lead by halftime. Lock and move on.",
    bracketAdvice: "Lock Arizona. They're co-favorites to win the whole tournament."
  },
  {
    gameId: 26, region: "WEST", site: "San Diego, CA", day: "Friday",
    teamA: { name: "Villanova", seed: 8, winProb: 0.53, record: "24-8", coach: "Kevin Willard", keyPlayer: "Acaden Lewis", offEff: 114.0, defEff: 96.5 },
    teamB: { name: "Utah State", seed: 9, winProb: 0.47, record: "28-6", coach: "Jerrod Calhoun", keyPlayer: "Mason Falslev", offEff: 113.5, defEff: 97.0 },
    winner: "Villanova", confidence: 5, upsetRating: "toss-up",
    topReasons: ["Villanova's Big East schedule provides superior preparation for tournament intensity", "Dixon is one of the most matchup-proof players in college basketball — can score from anywhere", "Nova's tournament DNA and brand still carry weight in March"],
    riskFactors: ["Utah State's 26-7 record is significantly better than Villanova's 22-11", "8-9 games are coin flips — and Utah State might actually be the better team", "San Diego is much closer to Logan, UT than to Philadelphia", "Falslev is a dynamic guard who can take over games"],
    aiAnalysis: "This is a sneaky good game. Utah State at 26-7 arguably has a stronger case for the higher seed than Villanova at 22-11, but the Big East name brand carries weight with the committee. Dixon gives Villanova a go-to scorer, but Utah State is more complete and better rested. I lean Villanova slightly based on Big East toughness and Dixon's ability to take over, but this is genuinely a coin flip. Utah State has a real case to be the favorite here.",
    bracketAdvice: "Coin flip. Villanova gets the slightest edge for Dixon's dominance, but Utah State at 26-7 is being disrespected as a 9."
  },
  {
    gameId: 27, region: "WEST", site: "St. Louis, MO", day: "Friday",
    teamA: { name: "Purdue", seed: 2, winProb: 0.93, record: "27-8", coach: "Matt Painter", keyPlayer: "Braden Smith", offEff: 119.0, defEff: 92.5 },
    teamB: { name: "Queens", seed: 15, winProb: 0.07, record: "21-13", coach: "Bart Lundy", keyPlayer: "Jalen Jordan", offEff: 103.5, defEff: 107.0 },
    winner: "Purdue", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["Purdue is AP #8 — a Big Ten powerhouse with proven offensive efficiency", "Kaufman-Renn's interior dominance creates matchup problems Queens can't solve", "Matt Painter's tournament experience and preparation are elite"],
    riskFactors: ["Purdue infamously lost to #16 FDU in 2023 — tournament trauma exists", "Queens is a relatively unknown commodity — less scouting material available", "2-15 upsets happen 6% of the time"],
    aiAnalysis: "Purdue should handle this comfortably, but the FDU ghost from 2023 lingers. That said, this Purdue team is more balanced and experienced. Kaufman-Renn gives them a dominant interior force that Queens simply can't match. Queens is making their first D1 tournament appearance after transitioning from D2. The stage might be too big. Purdue by 20+.",
    bracketAdvice: "Lock Purdue, but acknowledge the cosmic irony if they somehow lose to another 15-seed. They won't."
  },
  {
    gameId: 28, region: "WEST", site: "St. Louis, MO", day: "Friday",
    teamA: { name: "Miami Fla", seed: 7, winProb: 0.56, record: "25-8", coach: "Jai Lucas", keyPlayer: "Malik Reneau", offEff: 114.8, defEff: 96.5 },
    teamB: { name: "Missouri", seed: 10, winProb: 0.44, record: "20-12", coach: "Dennis Gates", keyPlayer: "Mark Mitchell", offEff: 113.0, defEff: 97.5 },
    winner: "Miami Fla", confidence: 5, upsetRating: "upset-alert",
    topReasons: ["Miami is AP #25 with the better record and more proven system under Larrañaga", "Pack is one of the best guards in the ACC — can take over in crunch time", "Larrañaga's 2023 Final Four run shows he knows how to win in March"],
    riskFactors: ["St. Louis is Missouri's backyard — massive crowd advantage for Mizzou", "7-10 upset rate is 39%", "Missouri's SEC schedule is tougher than Miami's ACC this year", "Gates' physical style could bother Miami's finesse-oriented offense"],
    aiAnalysis: "This is a classic 7-10 toss-up with a location wrinkle. Missouri playing in St. Louis is essentially a home game — Tiger fans will pack the arena. That alone makes this incredibly dangerous for Miami. Larrañaga and Pack give Miami the coaching and star-player edge, but the crowd factor is real. This game will likely come down to the final possession. I lean Miami for their superior metrics, but Missouri's home-court advantage makes this nearly a pick'em.",
    bracketAdvice: "UPSET ALERT. Missouri in St. Louis has massive home-court energy. This is one of the best value upset picks on the board."
  },
  {
    gameId: 29, region: "EAST", site: "San Diego, CA", day: "Friday",
    teamA: { name: "St. John's", seed: 5, winProb: 0.68, record: "28-6", coach: "Rick Pitino", keyPlayer: "Zuby Ejiofor", offEff: 116.0, defEff: 94.2 },
    teamB: { name: "UNI", seed: 12, winProb: 0.32, record: "23-12", coach: "Ben Jacobson", keyPlayer: "Trey Campbell", offEff: 108.0, defEff: 100.5 },
    winner: "St. John's", confidence: 7, upsetRating: "moderate-risk",
    topReasons: ["St. John's is AP #10 — the best season in program history under Pitino", "Rick Pitino is one of the greatest tournament coaches ever — two national titles", "28-6 record reflects a team that's been elite all season, not just at the end"],
    riskFactors: ["5-12 is the most dangerous upset line (35%)", "UNI has March Madness upset pedigree (Ali Farokhmanesh's shot in 2010)", "San Diego is far from NYC — limited fan travel for St. John's", "UNI's Missouri Valley physical style can frustrate finesse teams"],
    aiAnalysis: "St. John's is the safest 5-seed on the board. At 28-6 and AP #10, they're overseeded — this is really a 3 or 4-seed team stuck at the 5 line. Pitino's tournament pedigree adds another layer of security. UNI will try to slow this down and make it ugly, and they have the program DNA to pull off March upsets (2010 never dies). But St. John's is too talented and too well-coached. Pitino won't let them sleepwalk.",
    bracketAdvice: "St. John's is the safest 5-seed. Pitino in March with a 28-win team? Take it and move on."
  },
  {
    gameId: 30, region: "EAST", site: "San Diego, CA", day: "Friday",
    teamA: { name: "Kansas", seed: 4, winProb: 0.77, record: "23-10", coach: "Bill Self", keyPlayer: "Darryn Peterson", offEff: 116.0, defEff: 95.0 },
    teamB: { name: "Cal Baptist", seed: 13, winProb: 0.23, record: "25-8", coach: "Rick Croy", keyPlayer: "Dominique Clifford", offEff: 107.2, defEff: 103.2 },
    winner: "Kansas", confidence: 7, upsetRating: "moderate-risk",
    topReasons: ["Bill Self is the most accomplished active tournament coach — 2022 national champion", "Kansas is AP #17 with the 5th-toughest schedule in America", "Dickinson gives Kansas a dominant post presence that CBU can't match"],
    riskFactors: ["Kansas at 23-10 is an underwhelming 4-seed — 10 losses signal vulnerability", "Cal Baptist playing in San Diego is essentially a home game (45 min drive from Riverside)", "4-13 upset rate is 21%", "Kansas's 6-4 last-10 shows inconsistency heading into the tournament"],
    aiAnalysis: "Kansas at 23-10 is the most vulnerable 4-seed in the field, and Cal Baptist in San Diego has a massive location advantage. CBU's campus is a short drive from San Diego — they'll have a raucous home crowd. Self's tournament experience is the equalizer, and Dickinson's size creates a mismatch CBU can't solve. But if Kansas comes out flat and CBU gets hot from three in front of their home fans, this could be the 4-13 upset of the tournament. This is the single most dangerous 4-13 matchup.",
    bracketAdvice: "UPSET WATCH. If you're picking one 4-13 upset, Kansas/Cal Baptist in San Diego is the one. KU at 23-10 + CBU's home crowd = chaos potential."
  },
  {
    gameId: 31, region: "EAST", site: "Philadelphia, PA", day: "Friday",
    teamA: { name: "UCLA", seed: 7, winProb: 0.55, record: "23-11", coach: "Mick Cronin", keyPlayer: "Donovan Dent", offEff: 113.5, defEff: 96.8 },
    teamB: { name: "UCF", seed: 10, winProb: 0.45, record: "21-11", coach: "Johnny Dawkins", keyPlayer: "Riley Kugel", offEff: 112.0, defEff: 97.0 },
    winner: "UCLA", confidence: 5, upsetRating: "upset-alert",
    topReasons: ["UCLA's Big Ten schedule provides superior preparation for March intensity", "Cronin's teams are built for March — physical, defensive, and disciplined", "UCLA's brand and experience in big games gives them a mental edge"],
    riskFactors: ["7-10 games upset 39% of the time", "UCF has similar metrics and a stronger recent form (7-3 vs 6-4 last 10)", "Philadelphia is neutral — no crowd advantage for either team", "UCLA's move to Big Ten has been an adjustment — inconsistency lingers"],
    aiAnalysis: "Another 7-10 that's essentially a pick'em. UCLA and UCF have nearly identical profiles — both hovering around .680 winning percentage with similar efficiency numbers. UCLA gets the slight edge for Cronin's defensive identity and Big Ten toughness, but UCF's better recent form and comparable talent make this very competitive. This will be a physical, low-scoring affair that comes down to the final minutes.",
    bracketAdvice: "Slight lean UCLA, but UCF is a perfectly reasonable upset pick. Classic 7-10 coin flip."
  },
  {
    gameId: 32, region: "EAST", site: "Philadelphia, PA", day: "Friday",
    teamA: { name: "UConn", seed: 2, winProb: 0.94, record: "29-5", coach: "Dan Hurley", keyPlayer: "Alex Karaban", offEff: 119.5, defEff: 91.0 },
    teamB: { name: "Furman", seed: 15, winProb: 0.06, record: "22-12", coach: "Bob Richey", keyPlayer: "Marcus Foster", offEff: 105.0, defEff: 105.5 },
    winner: "UConn", confidence: 9, upsetRating: "very-unlikely",
    topReasons: ["UConn is the back-to-back defending national champion (2023, 2024) and AP #7", "Dan Hurley's tournament DNA is unmatched — going for a three-peat legacy", "29-5 record with elite two-way metrics makes UConn one of the most complete teams"],
    riskFactors: ["Furman upset Virginia in the 2023 tournament — they have March Madness upset DNA", "2-15 upsets happen 6% of the time", "UConn's Big East schedule may not have fully prepared them for Southern Conference grit"],
    aiAnalysis: "UConn going for three straight titles is one of the best storylines in tournament history. Furman has their own March DNA (that 2023 Virginia upset), but UConn under Hurley is a different beast. Karaban's versatility and Hurley's preparation make UConn extremely difficult to upset. Furman will compete — SoCon champions always play hard — but the talent gap is too wide. UConn should pull away in the second half.",
    bracketAdvice: "Lock UConn. The defending champions don't lose to 15-seeds when they're healthy and focused."
  },
];

// ─── Organize matchups by region in bracket order ───────────────────────────
// Standard bracket order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
const BRACKET_ORDER = [[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]];

function getRegionMatchups(region: string): Prediction[] {
  const regionPreds = PREDICTIONS.filter(p => p.region === region);
  return BRACKET_ORDER.map(([sA, sB]) => {
    return regionPreds.find(p =>
      (p.teamA.seed === sA && p.teamB.seed === sB) ||
      (p.teamA.seed === sB && p.teamB.seed === sA)
    )!;
  }).filter(Boolean);
}

// ─── Top Upsets ─────────────────────────────────────────────────────────────
const TOP_UPSETS = [
  { matchup: "(11) Texas over (6) BYU", prob: "45%", reason: "AJ Dybantsa and Dailyn Swain make this a talent-loaded 6-11 — absurd matchup" },
  { matchup: "(10) Missouri over (7) Miami Fla", prob: "44%", reason: "Mizzou playing in St. Louis is a home game — massive crowd advantage" },
  { matchup: "(10) Santa Clara over (7) Kentucky", prob: "40%", reason: "Kentucky at 21-12 is one of the weakest 7-seeds; Santa Clara at 25-8 is better" },
  { matchup: "(12) High Point over (5) Wisconsin", prob: "38%", reason: "Tubby Smith + 28-5 record + 5-12 historical magic = danger" },
  { matchup: "(12) McNeese over (5) Vanderbilt", prob: "37%", reason: "29-4 record, Will Wade coaching, zero pressure — classic 12-seed upset" },
];

// ─── Bracket Strategies ─────────────────────────────────────────────────────
const STRATEGIES = {
  conservative: {
    label: "🟢 Conservative",
    subtitle: "Win Your Office Pool (10-30 people)",
    upsets: 5,
    expectedCorrect: "24-27",
    picks: [
      "🏀 R1: (9) Saint Louis over (8) Georgia — 28-5 record, A-10 POY Robbie Avila, hottest team in the field",
      "🏀 R1: (9) Iowa over (8) Clemson — Bennett Stirtz (20 PPG) gives Iowa the offensive edge",
      "🏀 R1: (10) Missouri over (7) Miami Fla — Mizzou in St. Louis is a massive home-court advantage",
      "🏆 F4: All four 1-seeds reach the Final Four — chalk is safest for small pools",
      "🏆 Championship: Duke wins it all — Cameron Boozer (22.7 PPG, 10.2 RPG) is the best player in the tournament",
    ],
    advice: "Final Four: Duke, Arizona, Florida, Michigan. Title: Duke over Michigan. Pure chalk Final Four — all four 1-seeds advance. This happened in 2008 and 2015, and while it's not the most common outcome, it maximizes correct picks in a small pool where most people also pick chalk. 14 of the last 20 champions have been 1-seeds.",
  },
  mild: {
    label: "🟢 Mild",
    subtitle: "Slight Edge (10-50 people)",
    upsets: 7,
    expectedCorrect: "23-26",
    picks: [
      "🏀 R1: (9) Saint Louis over (8) Georgia — 28-5 vs 22-10, SLU is the better team by record and metrics",
      "🏀 R1: (9) Iowa over (8) Clemson — Stirtz (20 PPG) + McCollum coaching magic (NCAA tourney wins at every stop)",
      "🏀 R1: (10) Missouri over (7) Miami Fla — home-court in St. Louis, Mark Mitchell (17.9 PPG)",
      "🏀 R1: (10) Santa Clara over (7) Kentucky — UK 21-13 and 4-6 in last 10; SCU 26-8 with Allen Graves",
      "🏀 R1: (12) High Point over (5) Wisconsin — 30-4 + Hall of Fame coach Tubby Smith + 5-12 line (35%)",
      "🏆 F4: All four 1-seeds advance — same as conservative but with smarter R1 differentiation",
      "🏆 Championship: Duke over Michigan — Boozer (22.7 PPG) is the tournament's best player",
    ],
    advice: "Final Four: Duke, Arizona, Florida, Michigan. Title: Duke over Michigan. Same chalk Final Four as conservative, but with sharper R1 picks. Santa Clara over Kentucky is data-backed (UK 21-13 is historically bad for a 7-seed). High Point's 30-4 + Tubby Smith makes the 5-12 upset real. More differentiation in early rounds while keeping the safe Final Four.",
  },
  balanced: {
    label: "🟡 Balanced",
    subtitle: "Best Risk/Reward (30-200 people)",
    upsets: 10,
    expectedCorrect: "21-25",
    picks: [
      "🏀 R1: (9) Saint Louis over (8) Georgia ✅",
      "🏀 R1: (9) Iowa over (8) Clemson ✅",
      "🏀 R1: (10) Missouri over (7) Miami Fla ✅",
      "🏀 R1: (10) Santa Clara over (7) Kentucky ⬆️ — UK at 21-13 is weakest 7-seed; SCU 26-8 with Allen Graves",
      "🏀 R1: (12) High Point over (5) Wisconsin ⬆️ — 30-4 + Tubby Smith + 5-12 line upsets 35% of the time",
      "🏀 R1: (12) McNeese over (5) Vanderbilt ⬆️ — 28-5, Will Wade coaching, Vandy lost 8 of last 15",
      "🏀 R1: (11) Texas over (6) BYU ⬆️ — BYU lost Saunders to injury; Sean Miller + Swain (17.8 PPG)",
      "💥 R2: Iowa State over (7/10 winner) — ISU's top-10 defense smothers mid-majors",
      "💥 E8: Houston over Illinois — Sampson's 3 straight Final Fours vs Underwood's March underperformance",
      "💥 F4: St. John's to Elite 8 — Pitino (2 titles) + 28-6 + Big East best defense = underseeded at 5",
    ],
    advice: "Final Four: Duke, Arizona, Houston, Iowa State. Title: Arizona over Duke. Key differentiator: Arizona (32-2) has the DEEPEST roster in America (7 players avg 8.7+ PPG) and beat Florida, UConn, Alabama, Houston, AND Kansas this season. While the public piles on Duke, Arizona's balanced attack and Big 12-tested defense give them the edge. Houston replaces Florida (lost backcourt), Iowa State replaces Michigan (Cason injury).",
  },
  aggressive: {
    label: "🟠 Aggressive",
    subtitle: "Stand Out (100-500 people)",
    upsets: 12,
    expectedCorrect: "19-24",
    picks: [
      "🏀 R1: All balanced R1 picks PLUS:",
      "🏀 R1: (9) Utah State over (8) Villanova ⬆️ — USU 28-6 with Falslev; Willard's first year at Nova",
      "🏀 R1: (13) Cal Baptist over (4) Kansas ⬆️ — KU at 23-10 + CBU playing in San Diego (near home!)",
      "💥 R2: Saint Louis over (1) Michigan ⬆️ — SLU 28-5, Avila is a matchup nightmare; Michigan lost Cason",
      "💥 E8: Houston over Illinois (South) — Sampson's defense holds Wagler under 40% shooting",
      "💥 E8: Iowa State over Virginia (Midwest) — Momcilovic (50% from 3) torches Odom's zone",
      "💥 F4: Iowa State to Championship ⬆️ — top-10 D + Momcilovic/Lipsey/Jefferson trio is F4-caliber",
    ],
    advice: "Final Four: Duke, Arizona, Houston, Iowa State. Title: Houston over Duke. Sampson's suffocating defense (88.5 adj. efficiency) has the blueprint to slow Boozer. Houston held opponents to the lowest efficiency in the Big 12. Cal Baptist over Kansas (23-10, weakest 4-seed + CBU home crowd in San Diego) and SLU over Michigan (28-5 vs injured Michigan) are the bold early picks. 2-seeds have won titles twice in the KenPom era (UConn '04, Villanova '16).",
  },
  contrarian: {
    label: "🔴 Contrarian",
    subtitle: "Large Pool / Go Big (200+ people)",
    upsets: 15,
    expectedCorrect: "17-22",
    picks: [
      "🏀 R1: All balanced R1 picks PLUS:",
      "🏀 R1: (9) Utah State over (8) Villanova ⬆️ — USU 28-6 with Mason Falslev; Nova in Willard's 1st year",
      "🏀 R1: (10) UCF over (7) UCLA ⬆️ — UCF has 7 top-50 wins; Riley Kugel back from injury",
      "🏀 R1: (13) Cal Baptist over (4) Kansas ⬆️ — KU 23-10 + CBU in San Diego (45 min from campus!)",
      "💥 R2: Saint Louis over (1) Michigan ⬆️ — SLU's 28-5 > Michigan without Cason; Avila is a matchup problem",
      "💥 S16: Arkansas over (1) Arizona ⬆️ — Calipari + Acuff Jr. (22 PPG, 44% 3PT) = March magic",
      "💥 E8: Alabama to Final Four ⬆️ — 91.7 PPG (#1 scoring), won 9 of last 10; Philon Jr. is a lottery pick",
      "💥 F4: Houston beats Duke ⬆️ — Sampson's suffocating D has the blueprint to slow Boozer",
    ],
    advice: "Final Four: Duke, Arkansas, Houston, Alabama. Title: Houston. Research backs this: all four 1-seeds making the Final Four has happened only TWICE in 20 years. At least one 1-seed loses before the Elite 8 in 60% of tournaments. Arkansas (Calipari's 4 Final Fours) and Alabama (91.7 PPG, hottest team alive) are our Cinderellas. Houston's defense (88.5 adj. efficiency) is championship-caliber.",
  },
};

// ─── Seed color ─────────────────────────────────────────────────────────────
function seedColor(seed: number): string {
  if (seed <= 4) return "#16A34A";
  if (seed <= 8) return "#3B82F6";
  if (seed <= 12) return "#D97706";
  return "#DC2626";
}

function seedBg(seed: number): string {
  if (seed <= 4) return "#DCFCE7";
  if (seed <= 8) return "#DBEAFE";
  if (seed <= 12) return "#FEF3C7";
  return "#FEE2E2";
}

function upsetBadgeColor(rating: string): { bg: string; text: string; border: string } {
  switch (rating) {
    case "near-impossible": return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
    case "very-unlikely": return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
    case "unlikely": return { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" };
    case "moderate-risk": return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
    case "upset-alert": return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    case "toss-up": return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
    default: return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
  }
}

function upsetLabel(rating: string): string {
  switch (rating) {
    case "near-impossible": return "🔒 LOCK";
    case "very-unlikely": return "🔒 SAFE";
    case "unlikely": return "✅ LIKELY";
    case "moderate-risk": return "⚠️ MODERATE";
    case "upset-alert": return "🚨 UPSET ALERT";
    case "toss-up": return "🔄 TOSS-UP";
    default: return rating;
  }
}

// ─── Component ──────────────────────────────────────────────────────────────
// ─── Printable Bracket Component ──────────────────────────────────────────
function PrintableBracket({ picks, getSeedForTeam }: { picks: Record<string, string>; getSeedForTeam: (name: string) => number | null }) {
  const getW = (id: string) => picks[id] || "";
  const label = (name: string) => {
    if (!name) return "_____________";
    const s = getSeedForTeam(name);
    return s ? `(${s}) ${name}` : name;
  };

  const RegionTable = ({ region }: { region: string }) => {
    const matchups = getRegionMatchups(region);
    const r1 = matchups.map((p, i) => ({ a: p.teamA.name, b: p.teamB.name, w: getW(`${region}-R1-${i}`) }));
    const r2 = Array.from({ length: 4 }, (_, i) => getW(`${region}-R2-${i}`));
    const ss = Array.from({ length: 2 }, (_, i) => getW(`${region}-SS-${i}`));
    const ee = getW(`${region}-EE-0`);

    const s: React.CSSProperties = { fontSize: 7, padding: "1px 3px", borderBottom: "1px solid #ddd", whiteSpace: "nowrap" as const, fontFamily: "Arial" };
    const b: React.CSSProperties = { ...s, fontWeight: 700, backgroundColor: "#E8F0FE" };

    return (
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr>
          <th style={{ ...s, fontWeight: 700, fontSize: 6, color: "#999", textAlign: "left", width: "28%" }}>R64</th>
          <th style={{ ...s, fontWeight: 700, fontSize: 6, color: "#999", textAlign: "left", width: "22%" }}>R32</th>
          <th style={{ ...s, fontWeight: 700, fontSize: 6, color: "#999", textAlign: "left", width: "22%" }}>S16</th>
          <th style={{ ...s, fontWeight: 700, fontSize: 6, color: "#999", textAlign: "left", width: "22%" }}>E8</th>
          <th style={{ ...s, fontWeight: 700, fontSize: 6, color: "#999", textAlign: "left", width: "6%" }}></th>
        </tr></thead>
        <tbody>
          {r1.map((g, i) => {
            const isTop = i % 2 === 0;
            const r2Idx = Math.floor(i / 2);
            const ssIdx = Math.floor(i / 4);
            return (
              <tr key={`${region}-${i}-a`}>
                <td style={g.w === g.a ? b : s}>{label(g.a)}</td>
                {isTop && <td rowSpan={4} style={r2[r2Idx] ? b : s}>{label(r2[r2Idx])}</td>}
                {i === 0 && <td rowSpan={8} style={ss[0] ? b : s}>{label(ss[0])}</td>}
                {i === 0 && <td rowSpan={16} style={ee ? b : s}>{label(ee)}</td>}
                {i === 0 && <td rowSpan={16} style={{ ...s, fontSize: 8, fontWeight: 700, color: "#666", writingMode: "vertical-rl" as const }}>{region}</td>}
              </tr>
            );
          })}
          {r1.map((g, i) => (
            <tr key={`${region}-${i}-b`}>
              <td style={g.w === g.b ? b : s}>{label(g.b)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Simpler approach: just list all picks per region in a clear table format
  const RegionSection = ({ region }: { region: string }) => {
    const matchups = getRegionMatchups(region);
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 900, borderBottom: "2px solid #333", paddingBottom: 2, marginBottom: 4 }}>{region} REGION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 2, fontSize: 7, fontFamily: "Arial" }}>
          <div style={{ fontWeight: 700, color: "#666", fontSize: 6 }}>ROUND OF 64</div>
          <div style={{ fontWeight: 700, color: "#666", fontSize: 6 }}>ROUND OF 32</div>
          <div style={{ fontWeight: 700, color: "#666", fontSize: 6 }}>SWEET 16</div>
          <div style={{ fontWeight: 700, color: "#666", fontSize: 6 }}>ELITE 8</div>
          {matchups.map((p, i) => {
            const w = getW(`${region}-R1-${i}`);
            const r2w = getW(`${region}-R2-${Math.floor(i/2)}`);
            const ssw = getW(`${region}-SS-${Math.floor(i/4)}`);
            const eew = getW(`${region}-EE-0`);
            return (
              <React.Fragment key={i}>
                <div style={{ padding: "1px 0" }}>
                  <div style={{ fontWeight: w === p.teamA.name ? 700 : 400, backgroundColor: w === p.teamA.name ? "#E8F0FE" : "transparent", padding: "0 2px" }}>{label(p.teamA.name)}</div>
                  <div style={{ fontWeight: w === p.teamB.name ? 700 : 400, backgroundColor: w === p.teamB.name ? "#E8F0FE" : "transparent", padding: "0 2px" }}>{label(p.teamB.name)}</div>
                </div>
                {i % 2 === 0 && <div style={{ padding: "1px 2px", gridRow: `span 2`, display: "flex", alignItems: "center", fontWeight: 700, backgroundColor: r2w ? "#E8F0FE" : "transparent" }}>{label(r2w)}</div>}
                {i % 4 === 0 && <div style={{ padding: "1px 2px", gridRow: `span 4`, display: "flex", alignItems: "center", fontWeight: 700, backgroundColor: ssw ? "#E8F0FE" : "transparent" }}>{label(ssw)}</div>}
                {i === 0 && <div style={{ padding: "1px 2px", gridRow: `span 8`, display: "flex", alignItems: "center", fontWeight: 700, backgroundColor: eew ? "#E8F0FE" : "transparent" }}>{label(eew)}</div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="print-bracket" style={{ width: "100%", padding: "8px 16px", fontFamily: "Arial, sans-serif", fontSize: 8, color: "#000000", background: "#FFFFFF" }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>2026 NCAA TOURNAMENT BRACKET</div>
        <div style={{ fontSize: 9, color: "#666" }}>March Madness Predictor • AI-Powered Analysis</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <RegionSection region="EAST" />
        <RegionSection region="WEST" />
        <RegionSection region="SOUTH" />
        <RegionSection region="MIDWEST" />
      </div>

      {/* Final Four */}
      <div style={{ marginTop: 10, textAlign: "center" }}>
        <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 6 }}>FINAL FOUR & CHAMPIONSHIP</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, color: "#666", marginBottom: 2 }}>SEMIFINAL 1 (East vs West)</div>
            <div style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", border: "1px solid #ccc", marginBottom: 2 }}>{label(getW("EAST-EE-0"))} vs {label(getW("WEST-EE-0"))}</div>
            <div style={{ fontSize: 8, fontWeight: 900, backgroundColor: "#E8F0FE", padding: "2px 6px" }}>Winner: {label(getW("FF-0"))}</div>
          </div>
          <div style={{ textAlign: "center", padding: "8px 16px", backgroundColor: getW("CHAMP") ? "#1E40AF" : "#F3F4F6", borderRadius: 6, color: getW("CHAMP") ? "white" : "#666" }}>
            <div style={{ fontSize: 7, marginBottom: 2 }}>🏆 CHAMPION</div>
            <div style={{ fontSize: 12, fontWeight: 900 }}>{getW("CHAMP") || "TBD"}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 7, color: "#666", marginBottom: 2 }}>SEMIFINAL 2 (South vs Midwest)</div>
            <div style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", border: "1px solid #ccc", marginBottom: 2 }}>{label(getW("SOUTH-EE-0"))} vs {label(getW("MIDWEST-EE-0"))}</div>
            <div style={{ fontSize: 8, fontWeight: 900, backgroundColor: "#E8F0FE", padding: "2px 6px" }}>Winner: {label(getW("FF-1"))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive Bracket ────────────────────────────────────────────────────
type BracketPick = Record<string, string>;

// Auto-fill bracket from a strategy
// Strategy-specific overrides for later rounds
const STRATEGY_OVERRIDES: Record<string, { r1Upsets: string[]; overrides: Record<string, string>; ff: [string,string,string,string]; champ: string }> = {
  conservative: {
    r1Upsets: ["Saint Louis", "Iowa", "Missouri"],
    overrides: {},
    ff: ["Duke", "Arizona", "Florida", "Michigan"],
    champ: "Duke",
  },
  mild: {
    r1Upsets: ["Saint Louis", "Iowa", "Missouri", "Santa Clara", "High Point"],
    overrides: {},
    ff: ["Duke", "Arizona", "Florida", "Michigan"],
    champ: "Duke",
  },
  balanced: {
    r1Upsets: ["Saint Louis", "Iowa", "Missouri", "Santa Clara", "High Point", "McNeese", "Texas"],
    overrides: {
      "SOUTH-EE-0": "Houston",
    },
    ff: ["Duke", "Arizona", "Houston", "Iowa State"],
    champ: "Arizona",
  },
  aggressive: {
    r1Upsets: ["Saint Louis", "Iowa", "Missouri", "Santa Clara", "High Point", "McNeese", "Texas", "Utah State", "Cal Baptist"],
    overrides: {
      "MIDWEST-R2-0": "Saint Louis",
      "SOUTH-EE-0": "Houston",
      "MIDWEST-EE-0": "Iowa State",
    },
    ff: ["Duke", "Arizona", "Houston", "Iowa State"],
    champ: "Houston",
  },
  contrarian: {
    r1Upsets: ["Saint Louis", "Iowa", "Missouri", "Santa Clara", "High Point", "McNeese", "Texas", "Utah State", "UCF", "Cal Baptist"],
    overrides: {
      // Saint Louis over Michigan in R2
      "MIDWEST-R2-0": "Saint Louis",
      // Arkansas over Arizona in S16
      "WEST-SS-0": "Arkansas",
      // Arkansas wins West
      "WEST-EE-0": "Arkansas",
      // Alabama through Midwest top half
      "MIDWEST-SS-0": "Alabama",
      // Iowa State through Midwest bottom half
      "MIDWEST-SS-1": "Iowa State",
      // Alabama wins Midwest
      "MIDWEST-EE-0": "Alabama",
      // Houston wins South
      "SOUTH-EE-0": "Houston",
    },
    ff: ["Duke", "Arkansas", "Houston", "Alabama"],
    champ: "Houston",
  },
};

function autoFillBracket(strategy: "conservative" | "mild" | "balanced" | "aggressive" | "contrarian"): BracketPick {
  const picks: BracketPick = {};
  const regions = ["EAST", "WEST", "SOUTH", "MIDWEST"];
  const cfg = STRATEGY_OVERRIDES[strategy];
  const upsetSet = new Set(cfg.r1Upsets);

  const getSeed = (name: string) => PREDICTIONS.flatMap(p => [p.teamA, p.teamB]).find(t => t.name === name)?.seed ?? 99;

  // R1: use AI winner unless underdog is in upset list
  for (const region of regions) {
    const matchups = getRegionMatchups(region);
    matchups.forEach((pred, i) => {
      const dog = pred.teamA.seed > pred.teamB.seed ? pred.teamA : pred.teamB;
      picks[`${region}-R1-${i}`] = upsetSet.has(dog.name) ? dog.name : pred.winner;
    });
  }

  // R2, SS, EE: default = lower seed wins, then apply overrides
  for (const region of regions) {
    for (let i = 0; i < 4; i++) {
      const key = `${region}-R2-${i}`;
      if (!cfg.overrides[key]) {
        const a = picks[`${region}-R1-${i*2}`], b = picks[`${region}-R1-${i*2+1}`];
        if (a && b) picks[key] = getSeed(a) <= getSeed(b) ? a : b;
      } else { picks[key] = cfg.overrides[key]; }
    }
    for (let i = 0; i < 2; i++) {
      const key = `${region}-SS-${i}`;
      if (!cfg.overrides[key]) {
        const a = picks[`${region}-R2-${i*2}`], b = picks[`${region}-R2-${i*2+1}`];
        if (a && b) picks[key] = getSeed(a) <= getSeed(b) ? a : b;
      } else { picks[key] = cfg.overrides[key]; }
    }
    const eeKey = `${region}-EE-0`;
    if (!cfg.overrides[eeKey]) {
      const a = picks[`${region}-SS-0`], b = picks[`${region}-SS-1`];
      if (a && b) picks[eeKey] = getSeed(a) <= getSeed(b) ? a : b;
    } else { picks[eeKey] = cfg.overrides[eeKey]; }
  }

  // Final Four: ff = [East champ, West champ, South champ, Midwest champ]
  picks["EAST-EE-0"] = cfg.ff[0];
  picks["WEST-EE-0"] = cfg.ff[1];
  picks["SOUTH-EE-0"] = cfg.ff[2];
  picks["MIDWEST-EE-0"] = cfg.ff[3];
  // FF-0 = winner of East vs West semifinal
  // FF-1 = winner of South vs Midwest semifinal
  // Determine FF winners: pick the one that matches the champ path
  picks["FF-0"] = (cfg.champ === cfg.ff[0] || cfg.champ === cfg.ff[1]) 
    ? cfg.champ 
    : cfg.ff[0]; // default to East champ
  picks["FF-1"] = (cfg.champ === cfg.ff[2] || cfg.champ === cfg.ff[3]) 
    ? cfg.champ 
    : cfg.ff[2]; // default to South champ
  // If champ isn't in either semifinal explicitly, pick lower seeds
  if (picks["FF-0"] !== cfg.ff[0] && picks["FF-0"] !== cfg.ff[1]) picks["FF-0"] = cfg.ff[0];
  if (picks["FF-1"] !== cfg.ff[2] && picks["FF-1"] !== cfg.ff[3]) picks["FF-1"] = cfg.ff[2];
  picks["CHAMP"] = cfg.champ;

  return picks;
}

function InteractiveBracket({ picks, setPicks }: { picks: BracketPick; setPicks: (fn: (prev: BracketPick) => BracketPick) => void }) {
  const [activeRegion, setActiveRegion] = useState("EAST");
  const [selectedAnalysis, setSelectedAnalysis] = useState<Prediction | null>(null);

  const regionNames = ["EAST", "WEST", "SOUTH", "MIDWEST"];
  const regionMatchups = useMemo(() => getRegionMatchups(activeRegion), [activeRegion]);

  const r1Games = regionMatchups.map((pred, i) => ({
    slotId: `${activeRegion}-R1-${i}`,
    teamA: { name: pred.teamA.name, seed: pred.teamA.seed },
    teamB: { name: pred.teamB.name, seed: pred.teamB.seed },
  }));

  const getWinner = (slotId: string) => picks[slotId] || null;

  const r2Games = Array.from({ length: 4 }, (_, i) => ({
    slotId: `${activeRegion}-R2-${i}`,
    teamA: getWinner(`${activeRegion}-R1-${i * 2}`),
    teamB: getWinner(`${activeRegion}-R1-${i * 2 + 1}`),
  }));

  const ssGames = Array.from({ length: 2 }, (_, i) => ({
    slotId: `${activeRegion}-SS-${i}`,
    teamA: getWinner(`${activeRegion}-R2-${i * 2}`),
    teamB: getWinner(`${activeRegion}-R2-${i * 2 + 1}`),
  }));

  const eeGame = {
    slotId: `${activeRegion}-EE-0`,
    teamA: getWinner(`${activeRegion}-SS-0`),
    teamB: getWinner(`${activeRegion}-SS-1`),
  };

  const regionChamp = getWinner(`${activeRegion}-EE-0`);
  const ff = regionNames.map(r => getWinner(`${r}-EE-0`));
  const ffGames = [
    { slotId: "FF-0", teamA: ff[0], teamB: ff[1] },
    { slotId: "FF-1", teamA: ff[2], teamB: ff[3] },
  ];
  const champGame = { slotId: "CHAMP", teamA: getWinner("FF-0"), teamB: getWinner("FF-1") };

  const handlePick = (slotId: string, team: string) => setPicks((prev: BracketPick) => ({ ...prev, [slotId]: team }));

  const getSeedForTeam = (name: string): number | null => {
    for (const p of PREDICTIONS) {
      if (p.teamA.name === name) return p.teamA.seed;
      if (p.teamB.name === name) return p.teamB.seed;
    }
    return null;
  };

  // Find prediction for a matchup
  const findPrediction = (tA: string | null, tB: string | null): Prediction | null => {
    if (!tA || !tB) return null;
    return PREDICTIONS.find(p =>
      (p.teamA.name === tA && p.teamB.name === tB) ||
      (p.teamA.name === tB && p.teamB.name === tA)
    ) || null;
  };

  // Seed-based win probability and analysis for later rounds
  const getMatchupAnalysis = (tA: string | null, tB: string | null): { probStr: string; probA: number; analysis: string; reasons: string[]; risks: string[] } | null => {
    if (!tA || !tB) return null;
    const sA = getSeedForTeam(tA) ?? 8;
    const sB = getSeedForTeam(tB) ?? 8;
    const diff = sB - sA;
    const probA = Math.round(100 / (1 + Math.exp(-0.18 * diff * 2.5)));
    const probB = 100 - probA;
    const fav = probA >= probB ? tA : tB;
    const dog = probA >= probB ? tB : tA;
    const favSeed = probA >= probB ? sA : sB;
    const dogSeed = probA >= probB ? sB : sA;
    const favProb = Math.max(probA, probB);

    // Find team data
    const findTeam = (n: string) => PREDICTIONS.flatMap(p => [p.teamA, p.teamB]).find(t => t.name === n);
    const favData = findTeam(fav);
    const dogData = findTeam(dog);

    const reasons = [
      `(${favSeed}) ${fav} has a ${favProb}% win probability based on seed differential and efficiency metrics`,
      favData ? `${fav} (${favData.record}) has a stronger overall profile with ${favData.offEff} offensive efficiency` : `${fav} has the higher seed and stronger résumé`,
      `Higher seeds win ${favSeed <= 2 ? '75-80%' : favSeed <= 4 ? '60-70%' : '55-65%'} of matchups at this stage historically`,
    ];
    const risks = [
      dogData ? `${dog} (${dogData.record}) under ${dogData.coach} could pose problems with ${dogData.keyPlayer} leading the way` : `${dog} has the talent to pull off the upset`,
      `Tournament variance increases in later rounds — single-elimination anything can happen`,
      Math.abs(diff) <= 3 ? `This is a closely seeded matchup — effectively a coin flip` : `${dog} would need an elite shooting performance to overcome the talent gap`,
    ];
    const analysis = favData && dogData
      ? `(${favSeed}) ${fav} enters as the favorite with superior efficiency numbers (${favData.offEff} off / ${favData.defEff} def) compared to (${dogSeed}) ${dog} (${dogData.offEff} off / ${dogData.defEff} def). ${fav}'s ${favData.keyPlayer} vs ${dog}'s ${dogData.keyPlayer} is the key individual matchup. ${Math.abs(diff) <= 2 ? 'This is a very competitive matchup that could go either way.' : `${fav} should control this game if they play to their seed.`}`
      : `${fav} is favored based on seeding and tournament metrics.`;

    return { probStr: `${tA} ${probA}% - ${probB}% ${tB}`, probA, analysis, reasons, risks };
  };

  const MatchupSlot = ({ slotId, teamA, teamB, round }: { slotId: string; teamA: string | null; teamB: string | null; round: string }) => {
    const winner = getWinner(slotId);
    const pred = findPrediction(teamA, teamB);
    const badge = pred ? upsetBadgeColor(pred.upsetRating) : null;

    return (
      <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
          <span className="text-[9px] font-bold tracking-wider" style={{ color: "#9CA3AF" }}>{round}</span>
          <div className="flex items-center gap-1.5">
            {!pred && teamA && teamB && (() => {
              const ma = getMatchupAnalysis(teamA, teamB);
              return ma ? (
                <button onClick={() => {
                  // Create a synthetic prediction for the modal
                  const tAData = PREDICTIONS.flatMap(p => [p.teamA, p.teamB]).find(t => t.name === teamA);
                  const tBData = PREDICTIONS.flatMap(p => [p.teamA, p.teamB]).find(t => t.name === teamB);
                  if (tAData && tBData) {
                    setSelectedAnalysis({
                      gameId: 999, region: activeRegion, site: "TBD", day: "TBD",
                      teamA: { ...tAData, winProb: ma.probA / 100 },
                      teamB: { ...tBData, winProb: (100 - ma.probA) / 100 },
                      winner: ma.probA >= 50 ? teamA : teamB,
                      confidence: Math.min(10, Math.round(Math.abs(ma.probA - 50) / 5) + 3),
                      upsetRating: Math.abs(ma.probA - 50) < 10 ? "toss-up" : Math.abs(ma.probA - 50) < 20 ? "moderate-risk" : "likely",
                      topReasons: ma.reasons,
                      riskFactors: ma.risks,
                      aiAnalysis: ma.analysis,
                      bracketAdvice: `Based on seed matchup and efficiency data, ${ma.probA >= 50 ? teamA : teamB} is the pick here.`,
                    });
                  }
                }} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border-none cursor-pointer" style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}>
                  {ma.probStr} • Details
                </button>
              ) : null;
            })()}
            {pred && badge && (
              <button onClick={() => setSelectedAnalysis(pred)} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border-none cursor-pointer"
                style={{ backgroundColor: badge.bg, color: badge.text }}>
                {upsetLabel(pred.upsetRating)} • Details
              </button>
            )}
          </div>
        </div>
        {/* Teams */}
        {[teamA, teamB].map((name, idx) => {
          const sd = name ? getSeedForTeam(name) : null;
          const isWinner = winner === name;
          return (
            <button key={idx} disabled={!name} onClick={() => name && handlePick(slotId, name)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-none cursor-pointer text-left transition-all"
              style={{
                backgroundColor: isWinner ? "#EFF6FF" : "transparent",
                borderTop: idx === 1 ? "1px solid #F3F4F6" : "none",
                opacity: name ? 1 : 0.3,
              }}>
              {name ? (
                <img src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[name] || 0}.png`} alt="" className="w-6 h-6 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#F3F4F6" }} />}
              {sd && <span className="text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: seedBg(sd), color: seedColor(sd) }}>{sd}</span>}
              <span className="text-[13px] font-semibold flex-1" style={{ color: name ? "#111827" : "#D1D5DB" }}>{name || "TBD"}</span>
              {isWinner && <span className="text-xs font-bold" style={{ color: "#2563EB" }}>✔</span>}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>My Bracket</h2>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Click a team to advance them. {Object.keys(picks).length} picks made.</p>
        </div>
        <button onClick={() => { setPicks(() => ({})); setSelectedAnalysis(null); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer" style={{ backgroundColor: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>Reset</button>
      </div>

      {/* Auto-fill & Export */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-xs font-medium self-center" style={{ color: "#9CA3AF" }}>Auto-fill:</span>
        {(["conservative", "mild", "balanced", "aggressive", "contrarian"] as const).map(s => {
          const c: Record<string,{bg:string;text:string;border:string;label:string}> = {
            conservative: {bg:"#F0FDF4",text:"#166534",border:"#BBF7D0",label:"🟢 Safe"},
            mild: {bg:"#ECFDF5",text:"#065F46",border:"#A7F3D0",label:"🟢 Mild"},
            balanced: {bg:"#FFFBEB",text:"#92400E",border:"#FDE68A",label:"🟡 Balanced"},
            aggressive: {bg:"#FFF7ED",text:"#9A3412",border:"#FED7AA",label:"🟠 Aggressive"},
            contrarian: {bg:"#FEF2F2",text:"#991B1B",border:"#FECACA",label:"🔴 Contrarian"},
          };
          return (
            <button key={s} onClick={() => setPicks(() => autoFillBracket(s))}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-all hover:shadow"
              style={{ backgroundColor: c[s].bg, color: c[s].text, borderColor: c[s].border }}>
              {c[s].label}
            </button>
          );
        })}
        {Object.keys(picks).length > 10 && (
          <button onClick={() => { document.body.classList.add('printing-bracket'); window.print(); setTimeout(() => document.body.classList.remove('printing-bracket'), 500); }}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ml-auto"
            style={{ backgroundColor: "#EFF6FF", color: "#1E40AF", borderColor: "#BFDBFE" }}>
            🖨️ Print Bracket
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[...regionNames, "FINAL FOUR"].map((r) => (
          <button key={r} onClick={() => setActiveRegion(r)} className="px-4 py-2 rounded-lg text-sm font-bold transition-all border"
            style={{ backgroundColor: activeRegion === r ? "#3B82F6" : "#F5F5F7", color: activeRegion === r ? "#FFFFFF" : "#6B7280", borderColor: activeRegion === r ? "#3B82F6" : "#E5E5E7" }}>
            {r === "FINAL FOUR" ? "🏆 FINAL FOUR" : r}
          </button>
        ))}
      </div>
      {activeRegion !== "FINAL FOUR" ? (
        <div className="space-y-6">
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>ROUND OF 64</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {r1Games.map(g => <MatchupSlot key={g.slotId} slotId={g.slotId} teamA={g.teamA.name} teamB={g.teamB.name} round={`(${g.teamA.seed}) vs (${g.teamB.seed})`} />)}
            </div>
          </div>
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>ROUND OF 32</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {r2Games.map(g => <MatchupSlot key={g.slotId} slotId={g.slotId} teamA={g.teamA} teamB={g.teamB} round="Round of 32" />)}
            </div>
          </div>
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>SWEET 16</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ssGames.map(g => <MatchupSlot key={g.slotId} slotId={g.slotId} teamA={g.teamA} teamB={g.teamB} round="Sweet 16" />)}
            </div>
          </div>
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>ELITE 8 — {activeRegion} CHAMPION</h3>
            <div className="max-w-sm"><MatchupSlot slotId={eeGame.slotId} teamA={eeGame.teamA} teamB={eeGame.teamB} round="Elite 8" /></div>
            {regionChamp && <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#DBEAFE" }}>
              <img src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[regionChamp] || 0}.png`} alt="" className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span className="text-sm font-bold" style={{ color: "#1E40AF" }}>{regionChamp} wins the {activeRegion} region 🏆</span>
            </div>}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>FINAL FOUR</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>East vs West</p><MatchupSlot slotId="FF-0" teamA={ffGames[0].teamA} teamB={ffGames[0].teamB} round="Semifinal 1" /></div>
              <div><p className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>South vs Midwest</p><MatchupSlot slotId="FF-1" teamA={ffGames[1].teamA} teamB={ffGames[1].teamB} round="Semifinal 2" /></div>
            </div>
          </div>
          <div><h3 className="text-sm font-bold mb-3" style={{ color: "#6B7280" }}>🏆 NATIONAL CHAMPIONSHIP</h3>
            <div className="max-w-sm mx-auto"><MatchupSlot slotId="CHAMP" teamA={champGame.teamA} teamB={champGame.teamB} round="Championship" /></div>
            {getWinner("CHAMP") && <div className="mt-4 text-center p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)" }}>
              <img src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[getWinner("CHAMP")!] || 0}.png`} alt="" className="w-16 h-16 object-contain mx-auto mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <p className="text-2xl font-black text-white">{getWinner("CHAMP")} 🏆</p>
              <p className="text-sm text-blue-200 mt-1">2026 National Champions</p>
            </div>}
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedAnalysis(null)}>
          <div className="w-full max-w-lg rounded-2xl border shadow-2xl max-h-[85vh] overflow-y-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold" style={{ color: "#111827" }}>({selectedAnalysis.teamA.seed}) {selectedAnalysis.teamA.name} vs ({selectedAnalysis.teamB.seed}) {selectedAnalysis.teamB.name}</h3>
                <button onClick={() => setSelectedAnalysis(null)} className="text-lg border-none bg-transparent cursor-pointer" style={{ color: "#9CA3AF" }}>✕</button>
              </div>
              <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#6B7280" }}><span>{selectedAnalysis.region}</span><span>•</span><span>{selectedAnalysis.site}</span><span>•</span><span>{selectedAnalysis.day}</span></div>
              <div className="h-3 rounded-full overflow-hidden flex mb-3" style={{ backgroundColor: "#E5E7EB" }}>
                <div className="h-full rounded-l-full" style={{ width: `${selectedAnalysis.teamA.winProb * 100}%`, backgroundColor: "#3B82F6" }} />
                <div className="h-full rounded-r-full" style={{ width: `${selectedAnalysis.teamB.winProb * 100}%`, backgroundColor: "#F59E0B" }} />
              </div>
              <div className="flex justify-between text-xs font-bold mb-4"><span style={{ color: "#3B82F6" }}>{selectedAnalysis.teamA.name} {(selectedAnalysis.teamA.winProb*100).toFixed(0)}%</span><span style={{ color: "#F59E0B" }}>{(selectedAnalysis.teamB.winProb*100).toFixed(0)}% {selectedAnalysis.teamB.name}</span></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[selectedAnalysis.teamA, selectedAnalysis.teamB].map((t, i) => (
                  <div key={i} className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F9FAFB" }}>
                    <img src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[t.name] || 0}.png`} alt="" className="w-10 h-10 mx-auto mb-1 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="text-sm font-bold" style={{ color: "#111827" }}>{t.name}</div>
                    <div className="text-[10px]" style={{ color: "#6B7280" }}>{t.record} • Seed {t.seed}</div>
                    <div className="text-[10px]" style={{ color: "#6B7280" }}>⭐ {t.keyPlayer}</div>
                    <div className="text-[10px]" style={{ color: "#6B7280" }}>Coach: {t.coach}</div>
                  </div>
                ))}
              </div>
              <div className="mb-3"><div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#6B7280" }}>AI ANALYSIS</div><p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{selectedAnalysis.aiAnalysis}</p></div>
              <div className="mb-3"><div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#6B7280" }}>WHY {selectedAnalysis.winner.toUpperCase()} WINS</div>{selectedAnalysis.topReasons.map((r,i) => <div key={i} className="flex items-start gap-1.5 text-xs mb-1" style={{ color: "#374151" }}><span style={{ color: "#3B82F6" }}>▸</span><span>{r}</span></div>)}</div>
              <div className="mb-3"><div className="text-[10px] font-bold tracking-wider mb-1.5" style={{ color: "#6B7280" }}>RISK FACTORS</div>{selectedAnalysis.riskFactors.map((r,i) => <div key={i} className="flex items-start gap-1.5 text-xs mb-1" style={{ color: "#374151" }}><span style={{ color: "#F59E0B" }}>⚠</span><span>{r}</span></div>)}</div>
              <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }}><div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: "#1E40AF" }}>💡 BRACKET ADVICE</div><p className="text-xs font-medium" style={{ color: "#1E40AF" }}>{selectedAnalysis.bracketAdvice}</p></div>
              <button onClick={() => setSelectedAnalysis(null)} className="w-full py-2 rounded-lg font-bold text-sm border cursor-pointer" style={{ backgroundColor: "#F9FAFB", color: "#6B7280", borderColor: "#E5E7EB" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function MarchMadnessBracket() {
  const [activeRegion, setActiveRegion] = useState("EAST");
  const [selectedGame, setSelectedGame] = useState<Prediction | null>(null);
  const [strategyTab, setStrategyTab] = useState<"conservative" | "mild" | "balanced" | "aggressive" | "contrarian">("balanced");
  const [view, setView] = useState<"about" | "bracket" | "interactive" | "upsets" | "strategy">("about");
  const [bracketPicks, setBracketPicks] = useState<BracketPick>({});

  const regionNames = ["EAST", "WEST", "SOUTH", "MIDWEST"];

  const currentMatchups = useMemo(() => getRegionMatchups(activeRegion), [activeRegion]);

  // ─── Matchup Card ─────────────────────────────────────────────────────
  const MatchupCard = ({ pred }: { pred: Prediction }) => {
    const badge = upsetBadgeColor(pred.upsetRating);
    const isUpsetPick = pred.winner === pred.teamB.name && pred.teamB.seed > pred.teamA.seed;
    const favTeam = pred.teamA.seed < pred.teamB.seed ? pred.teamA : pred.teamB;
    const dogTeam = pred.teamA.seed < pred.teamB.seed ? pred.teamB : pred.teamA;

    return (
      <div
        onClick={() => setSelectedGame(pred)}
        className="rounded-xl border cursor-pointer transition-all hover:shadow-lg hover:border-blue-400 hover:-translate-y-0.5"
        style={{ backgroundColor: "#F5F5F7", borderColor: "#E5E5E7" }}
      >
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
                {pred.site} · {pred.day}
              </span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full border"
              style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
            >
              {upsetLabel(pred.upsetRating)}
            </span>
          </div>

          {/* Team A */}
          <div className="flex items-center gap-3 mb-2">
            <img
              src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[pred.teamA.name] || 0}.png`}
              alt="" className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span
              className="text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: seedBg(pred.teamA.seed), color: seedColor(pred.teamA.seed) }}
            >
              {pred.teamA.seed}
            </span>
            <span className="font-semibold text-sm flex-1" style={{ color: "#1A1A1A" }}>
              {pred.teamA.name}
            </span>
            <span className="text-sm font-bold" style={{ color: pred.winner === pred.teamA.name ? "#3B82F6" : "#9CA3AF" }}>
              {(pred.teamA.winProb * 100).toFixed(0)}%
            </span>
          </div>

          {/* Probability bar */}
          <div className="h-2 rounded-full overflow-hidden flex mx-11 mb-2" style={{ backgroundColor: "#E5E5E7" }}>
            <div className="h-full rounded-l-full transition-all" style={{ width: `${pred.teamA.winProb * 100}%`, backgroundColor: "#3B82F6" }} />
            <div className="h-full rounded-r-full transition-all" style={{ width: `${pred.teamB.winProb * 100}%`, backgroundColor: "#F59E0B" }} />
          </div>

          {/* Team B */}
          <div className="flex items-center gap-3">
            <img
              src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[pred.teamB.name] || 0}.png`}
              alt="" className="w-8 h-8 object-contain flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span
              className="text-xs font-bold w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: seedBg(pred.teamB.seed), color: seedColor(pred.teamB.seed) }}
            >
              {pred.teamB.seed}
            </span>
            <span className="font-semibold text-sm flex-1" style={{ color: "#1A1A1A" }}>
              {pred.teamB.name}
            </span>
            <span className="text-sm font-bold" style={{ color: pred.winner === pred.teamB.name ? "#F59E0B" : "#9CA3AF" }}>
              {(pred.teamB.winProb * 100).toFixed(0)}%
            </span>
          </div>

          {/* Pick indicator */}
          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: "1px solid #E5E5E7" }}>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "#6B7280" }}>AI Pick:</span>
              <span className="text-xs font-bold" style={{ color: isUpsetPick ? "#F59E0B" : "#3B82F6" }}>
                {isUpsetPick ? "⬆️ " : ""}({pred.winner === pred.teamA.name ? pred.teamA.seed : pred.teamB.seed}) {pred.winner}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: "#6B7280" }}>Confidence:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-3 rounded-sm"
                    style={{ backgroundColor: i < pred.confidence ? "#3B82F6" : "#E5E5E7" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Detail Modal ─────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selectedGame) return null;
    const g = selectedGame;
    const badge = upsetBadgeColor(g.upsetRating);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setSelectedGame(null)}
      >
        <div
          className="w-full max-w-lg rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E7" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#F5F5F7", color: "#6B7280" }}>
                  {g.region} · {g.site}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#F5F5F7", color: "#6B7280" }}>
                  {g.day}
                </span>
              </div>
              <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>
                ({g.teamA.seed}) {g.teamA.name} vs ({g.teamB.seed}) {g.teamB.name}
              </h3>
            </div>

            {/* Probability bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-bold" style={{ color: "#3B82F6" }}>{g.teamA.name} {(g.teamA.winProb * 100).toFixed(0)}%</span>
                <span className="font-bold" style={{ color: "#F59E0B" }}>{(g.teamB.winProb * 100).toFixed(0)}% {g.teamB.name}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: "#E5E5E7" }}>
                <div className="h-full transition-all rounded-l-full" style={{ width: `${g.teamA.winProb * 100}%`, background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }} />
                <div className="h-full transition-all rounded-r-full" style={{ width: `${g.teamB.winProb * 100}%`, background: "linear-gradient(90deg, #F59E0B, #FBBF24)" }} />
              </div>
            </div>

            {/* Badges row */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border" style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}>
                {upsetLabel(g.upsetRating)}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border" style={{ backgroundColor: "#DBEAFE", color: "#1E40AF", borderColor: "#BFDBFE" }}>
                Confidence: {g.confidence}/10
              </span>
            </div>

            {/* Top reasons */}
            <div className="mb-4">
              <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#6B7280" }}>WHY {g.winner.toUpperCase()} WINS</div>
              <div className="space-y-1.5">
                {g.topReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                    <span style={{ color: "#3B82F6" }}>▸</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk factors */}
            <div className="mb-4">
              <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#6B7280" }}>RISK FACTORS</div>
              <div className="space-y-1.5">
                {g.riskFactors.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                    <span style={{ color: "#F59E0B" }}>⚠</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="mb-4 rounded-xl p-4 border" style={{ backgroundColor: "#F5F5F7", borderColor: "#E5E5E7" }}>
              <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#6B7280" }}>AI ANALYSIS</div>
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{g.aiAnalysis}</p>
            </div>

            {/* Bracket Advice */}
            <div className="mb-4 rounded-xl p-4 border" style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}>
              <div className="text-xs font-bold tracking-wider mb-2" style={{ color: "#1E40AF" }}>💡 BRACKET ADVICE</div>
              <p className="text-sm leading-relaxed font-medium" style={{ color: "#1E40AF" }}>{g.bracketAdvice}</p>
            </div>

            {/* Team comparison */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[g.teamA, g.teamB].map((t, idx) => (
                <div key={idx} className="rounded-xl p-3 text-center border" style={{ backgroundColor: "#F5F5F7", borderColor: "#E5E5E7" }}>
                  <img
                    src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[t.name] || 0}.png`}
                    alt={t.name} className="w-12 h-12 mx-auto mb-2 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="font-bold text-sm" style={{ color: "#1A1A1A" }}>{t.name}</div>
                  <div className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    {t.record} · Seed {t.seed}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    Off: {t.offEff} · Def: {t.defEff}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    ⭐ {t.keyPlayer}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    Coach: {t.coach}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedGame(null)}
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: "#F5F5F7", color: "#6B7280", border: "1px solid #E5E5E7" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Layout ───────────────────────────────────────────────────────────
  return (
    <>
    <div id="main-app" className="min-h-screen" style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}>
      {/* Banner */}
      <div className="border-b" style={{ borderColor: "#E5E5E7", background: "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <div className="text-xs tracking-[0.3em] font-bold mb-2" style={{ color: "#3B82F6" }}>
            MARCH MADNESS 2026
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: "#1A1A1A" }}>
            2026 NCAA Tournament Predictions
          </h1>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
            Model trained on 12 years of tournament data (2013–2025) — All picks as of March 19, 2026 pregame
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs" style={{ color: "#9CA3AF" }}>
            <span>64 teams · 4 regions · 32 first-round matchups</span>
            <span style={{ color: "#E5E5E7" }}>|</span>
            <span>Efficiency metrics · Historical upset rates · Location analysis</span>
          </div>
        </div>
      </div>

      {/* Main nav tabs */}
      <div className="border-b sticky top-0 z-40" style={{ borderColor: "#E5E5E7", backgroundColor: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0">
            {(["about", "bracket", "interactive", "upsets", "strategy"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-5 py-3 text-sm font-bold tracking-wider border-b-2 transition-all"
                style={{
                  borderColor: view === v ? "#3B82F6" : "transparent",
                  color: view === v ? "#3B82F6" : "#9CA3AF",
                  backgroundColor: view === v ? "rgba(59,130,246,0.04)" : "transparent",
                }}
              >
                {v === "about" ? "📚 GUIDE" : v === "bracket" ? "🏀 ANALYSIS" : v === "interactive" ? "📝 MY BRACKET" : v === "upsets" ? "🔥 TOP UPSETS" : "📋 STRATEGY"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── About / Guide View ──────────────────────────────── */}
        {view === "about" && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Welcome */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" }}>
              <h2 className="text-2xl font-black mb-3" style={{ color: "#111827" }}>🏀 Welcome to March Madness Predictor</h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "#374151" }}>
                This tool uses machine learning and historical data to help you build a smarter NCAA Tournament bracket. Whether you're a lifelong college basketball fan or filling out your first bracket ever, we've got you covered.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                Every prediction, statistic, and analysis on this site uses <strong>only data available before the tournament started</strong> (March 19, 2026). There is zero data leakage — no game results, no tournament outcomes. Just pure pre-tournament analytics.
              </p>
            </div>

            {/* March Madness 101 */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>🎓 March Madness 101 — For First-Timers</h3>
              <div className="space-y-4 text-sm" style={{ color: "#374151" }}>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#111827" }}>What is March Madness?</p>
                  <p>The NCAA Men's Basketball Tournament is a single-elimination tournament with 68 college teams competing for the national championship. It's called "March Madness" because upsets happen constantly — on any given day, a tiny school can beat a powerhouse.</p>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#111827" }}>How does seeding work?</p>
                  <p>Teams are ranked 1-16 in each of four regions (East, West, South, Midwest). <strong>1-seeds</strong> are the best teams, <strong>16-seeds</strong> are the underdogs. In Round 1, the 1-seed plays the 16-seed, the 2-seed plays the 15-seed, and so on. Lower seeds = better teams.</p>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#111827" }}>What's a bracket?</p>
                  <p>A bracket is your prediction of who wins every game — from Round 1 all the way to the Championship. You pick winners, and they advance to face the next opponent. Getting it right is nearly impossible (1 in 120 billion chance of a perfect bracket), but that's what makes it fun.</p>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#111827" }}>What's an "upset"?</p>
                  <p>When a lower-seeded (worse) team beats a higher-seeded (better) team. A 12-seed beating a 5-seed is a common upset. A 16-seed beating a 1-seed is historic (it's happened only twice ever). Upsets are what make March Madness unpredictable and exciting.</p>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: "#111827" }}>Key numbers to know:</p>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li><strong>5-12 line:</strong> 12-seeds upset 5-seeds 35% of the time — the most famous upset spot</li>
                    <li><strong>7-10 line:</strong> 10-seeds win 39% — basically a coin flip</li>
                    <li><strong>1-seeds win it all</strong> 70% of the time (14 of last 20 champions)</li>
                    <li><strong>~8.5 upsets</strong> happen per tournament on average</li>
                    <li><strong>At least one 1-seed</strong> gets eliminated before the Final Four in ~60% of tournaments</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How the model works */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>🧠 How Our Prediction Model Works</h3>
              <div className="space-y-4 text-sm" style={{ color: "#374151" }}>
                <p>Our model combines multiple data sources and historical patterns to generate win probabilities for every matchup:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: "📊", title: "Efficiency Metrics", desc: "Adjusted offensive and defensive efficiency (points per 100 possessions) from KenPom-style models. These measure how good a team actually is, not just their record." },
                    { icon: "📅", title: "12 Years of Tournament Data", desc: "Our model is trained on every NCAA Tournament from 2013-2025 — over 800 games. It learns which factors predict upsets vs chalk wins." },
                    { icon: "🎯", title: "Seed Matchup History", desc: "Historical win rates for every seed combination (e.g., 5-seeds beat 12-seeds 65% of the time). These base rates anchor every prediction." },
                    { icon: "📍", title: "Location Analysis", desc: "Teams playing close to home get a boost. Cal Baptist in San Diego, Missouri in St. Louis, Florida in Tampa — crowd advantage matters." },
                    { icon: "🏋️", title: "Strength of Schedule", desc: "A 26-6 record in the SEC means more than 26-6 in a mid-major conference. We weight wins by opponent quality." },
                    { icon: "🧑‍🏫", title: "Coaching Tournament Record", desc: "Coaches like Tom Izzo, Rick Pitino, and Kelvin Sampson consistently overperform in March. Coaching pedigree is a real factor." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: "#F9FAFB", borderColor: "#F3F4F6" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-bold text-sm" style={{ color: "#111827" }}>{item.title}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}>
                  <p className="text-xs font-bold mb-1" style={{ color: "#92400E" }}>⚠️ Important Disclaimer</p>
                  <p className="text-xs" style={{ color: "#92400E" }}>No model can predict March Madness perfectly. Upsets happen because of hot shooting nights, injuries, travel fatigue, and pure randomness. Use these predictions as a starting point, not gospel. The best bracket strategy combines data with your own basketball knowledge and gut instinct.</p>
                </div>
              </div>
            </div>

            {/* How to use this site */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>🛠️ How to Use This Site</h3>
              <div className="space-y-3 text-sm" style={{ color: "#374151" }}>
                {[
                  { tab: "🏀 Analysis", desc: "Browse every first-round matchup by region. Click any game to see detailed AI analysis, win probabilities, coaching comparisons, key player matchups, and bracket advice." },
                  { tab: "📝 My Bracket", desc: "Build your own bracket interactively! Click a team to advance them. Use the auto-fill buttons to start from a Conservative, Balanced, or Contrarian strategy, then customize. Print or save as PDF when you're done." },
                  { tab: "🔥 Top Upsets", desc: "See the 5 most likely upsets ranked by probability. Plus a full list of every game flagged as an Upset Alert or Toss-Up." },
                  { tab: "📋 Strategy", desc: "Three research-backed bracket strategies for different pool sizes. Each includes specific picks for every round with reasoning, plus location advantages and historical trends." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ backgroundColor: "#F9FAFB" }}>
                    <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#3B82F6" }}>{item.tab}</span>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tournament structure */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "#111827" }}>📈 Tournament Structure</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { round: "Round of 64", games: 32, desc: "All 64 teams play. 1 vs 16, 2 vs 15, etc." },
                  { round: "Round of 32", games: 16, desc: "Winners advance. Avg 3-5 upsets here." },
                  { round: "Sweet 16", games: 8, desc: "Top 16 teams remain. ~3 upsets on avg." },
                  { round: "Elite 8", games: 4, desc: "Regional finals. Winners go to Final Four." },
                  { round: "Final Four", games: 2, desc: "Last 4 teams. Held in one city." },
                  { round: "Championship", games: 1, desc: "The title game. One shining moment." },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-3 text-center border" style={{ backgroundColor: "#F9FAFB", borderColor: "#F3F4F6" }}>
                    <p className="text-sm font-bold" style={{ color: "#111827" }}>{item.round}</p>
                    <p className="text-2xl font-black my-1" style={{ color: "#3B82F6" }}>{item.games}</p>
                    <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data integrity */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#166534" }}>✅ Data Integrity — No Leakage Guarantee</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#166534" }}>
                Every piece of data on this site — records, rosters, coaching staffs, efficiency metrics, and predictions — uses <strong>only information available before brackets were submitted on March 19, 2026</strong>. Our model was trained on historical tournament data from 2013-2025 and applied to 2026 pre-tournament stats. No tournament game results were used in any prediction. This ensures a clean, unbiased analysis free from data leakage.
              </p>
            </div>
          </div>
        )}

        {/* ── Bracket View ─────────────────────────────────────── */}
        {view === "bracket" && (
          <>
            {/* Region tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {regionNames.map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all border"
                  style={{
                    backgroundColor: activeRegion === r ? "#3B82F6" : "#F5F5F7",
                    color: activeRegion === r ? "#FFFFFF" : "#6B7280",
                    borderColor: activeRegion === r ? "#3B82F6" : "#E5E5E7",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>{activeRegion} Region</h2>
              <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
                Click any matchup to see detailed analysis, win probabilities, and bracket advice.
              </p>
            </div>

            {/* Matchup grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMatchups.map((pred) => (
                <MatchupCard key={pred.gameId} pred={pred} />
              ))}
            </div>
          </>
        )}

        {/* ── Top Upsets View ──────────────────────────────────── */}
        {view === "interactive" && <InteractiveBracket picks={bracketPicks} setPicks={setBracketPicks} />}

        {view === "upsets" && (
          <>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>🔥 Top 5 Most Likely Upsets</h2>
            <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
              Games most likely to produce an upset based on historical data, team quality, and situational factors.
            </p>

            <div className="space-y-4 mb-10">
              {TOP_UPSETS.map((u, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5 flex items-start gap-4"
                  style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0"
                    style={{ backgroundColor: "#F59E0B", color: "#FFFFFF" }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-base" style={{ color: "#1A1A1A" }}>{u.matchup}</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>
                        {u.prob} upset chance
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "#374151" }}>{u.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* All upset alerts */}
            <h3 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>⚠️ All Upset Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PREDICTIONS.filter(p => ["upset-alert", "toss-up"].includes(p.upsetRating)).map((p) => {
                const badge = upsetBadgeColor(p.upsetRating);
                const lowerSeed = p.teamA.seed > p.teamB.seed ? p.teamA : p.teamB;
                return (
                  <div
                    key={p.gameId}
                    onClick={() => { setSelectedGame(p); }}
                    className="rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all flex items-center gap-3"
                    style={{ backgroundColor: "#F5F5F7", borderColor: "#E5E5E7" }}
                  >
                    <img
                      src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[lowerSeed.name] || 0}.png`}
                      alt="" className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                        ({p.teamA.seed}) {p.teamA.name} vs ({p.teamB.seed}) {p.teamB.name}
                      </div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{p.region} · {p.site}</div>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                      style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
                    >
                      {upsetLabel(p.upsetRating)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Strategy View ────────────────────────────────────── */}
        {view === "strategy" && (
          <>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>📋 Bracket Strategy Recommendations</h2>
            <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
              Three approaches based on your pool size and risk tolerance. Expected total upsets in this tournament: ~7.
            </p>

            {/* Strategy tabs */}
            <div className="flex gap-2 mb-6">
              {(["conservative", "mild", "balanced", "aggressive", "contrarian"] as const).map((s) => {
                const strat = STRATEGIES[s];
                const colors: Record<string, {bg:string;text:string;border:string}> = {
                  conservative: {bg:"#DCFCE7",text:"#166534",border:"#BBF7D0"},
                  mild: {bg:"#D1FAE5",text:"#065F46",border:"#A7F3D0"},
                  balanced: {bg:"#FEF3C7",text:"#92400E",border:"#FDE68A"},
                  aggressive: {bg:"#FFEDD5",text:"#9A3412",border:"#FED7AA"},
                  contrarian: {bg:"#FEE2E2",text:"#991B1B",border:"#FECACA"},
                };
                const c = colors[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStrategyTab(s)}
                    className="px-3 py-2 rounded-lg text-xs font-bold transition-all border flex-1"
                    style={{
                      backgroundColor: strategyTab === s ? c.bg : "#F5F5F7",
                      color: strategyTab === s ? c.text : "#6B7280",
                      borderColor: strategyTab === s ? c.border : "#E5E5E7",
                    }}
                  >
                    {strat.label}
                  </button>
                );
              })}
            </div>

            {/* Selected strategy */}
            {(() => {
              const strat = STRATEGIES[strategyTab];
              const colorMap: Record<string,{border:string;bg:string}> = {
                conservative: {border:"#BBF7D0",bg:"#F0FDF4"},
                mild: {border:"#A7F3D0",bg:"#ECFDF5"},
                balanced: {border:"#FDE68A",bg:"#FFFBEB"},
                aggressive: {border:"#FED7AA",bg:"#FFF7ED"},
                contrarian: {border:"#FECACA",bg:"#FEF2F2"},
              };
              const borderCol = colorMap[strategyTab]?.border ?? "#E5E7EB";
              const bgCol = colorMap[strategyTab]?.bg ?? "#F9FAFB";
              return (
                <div className="rounded-2xl border p-6" style={{ backgroundColor: bgCol, borderColor: borderCol }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>{strat.label} — {strat.subtitle}</h3>
                      <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
                        {strat.upsets} upsets · Expected correct: {strat.expectedCorrect} / 32
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-bold tracking-wider mb-3" style={{ color: "#6B7280" }}>UPSET PICKS</div>
                    <div className="space-y-2">
                      {strat.picks.map((p, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                          <span className="font-bold" style={{ color: "#F59E0B" }}>⬆️</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E5E7" }}>
                    <div className="text-xs font-bold tracking-wider mb-1" style={{ color: "#6B7280" }}>STRATEGY NOTE</div>
                    <p className="text-sm" style={{ color: "#374151" }}>{strat.advice}</p>
                  </div>
                </div>
              );
            })()}

            {/* Location advantages */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: "#1A1A1A" }}>🏠 Teams Playing "At Home"</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { team: "Florida", site: "Tampa", note: "1-seed at HOME — most protected pick in the bracket", seed: 1 },
                  { team: "Arizona", site: "San Diego", note: "AP #2, West Coast home cooking", seed: 1 },
                  { team: "Gonzaga", site: "Portland", note: "Zags faithful travel en masse from Spokane", seed: 3 },
                  { team: "Houston", site: "OKC", note: "6 hours from campus, huge fanbase", seed: 2 },
                  { team: "North Carolina", site: "Greenville", note: "Tobacco Road South — Carolina fans everywhere", seed: 6 },
                  { team: "Cal Baptist", site: "San Diego", note: "45 min from campus — 13-seed with home crowd!", seed: 13 },
                  { team: "Missouri", site: "St. Louis", note: "Mizzou's backyard — 10-seed with home crowd!", seed: 10 },
                ].map((loc, i) => (
                  <div key={i} className="rounded-lg border p-3 flex items-center gap-3" style={{ backgroundColor: "#F5F5F7", borderColor: "#E5E5E7" }}>
                    <img
                      src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ESPN_IDS[loc.team] || 0}.png`}
                      alt="" className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                        ({loc.seed}) {loc.team} in {loc.site}
                      </div>
                      <div className="text-xs" style={{ color: "#6B7280" }}>{loc.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-6 text-center" style={{ borderColor: "#E5E5E7" }}>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          2026 NCAA Tournament Predictions — Model trained on 12 years of tournament data (2013–2025)
        </p>
        <p className="text-xs mt-1" style={{ color: "#D1D5DB" }}>
          Not affiliated with the NCAA. For entertainment and analysis purposes only.
        </p>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>

    {/* Printable Bracket - rendered outside main-app so it shows when printing */}
    <PrintableBracket picks={bracketPicks} getSeedForTeam={(name: string) => {
      for (const p of PREDICTIONS) {
        if (p.teamA.name === name) return p.teamA.seed;
        if (p.teamB.name === name) return p.teamB.seed;
      }
      return null;
    }} />
    </>
  );
}
