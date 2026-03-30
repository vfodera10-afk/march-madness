"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Team {
  name: string;
  seed: number;
  espnId: number;
  conference: string;
  rating: number;
  offEff: number;
  defEff: number;
  record: string;
  coach: string;
}

interface Matchup {
  id: string;
  round: number;
  position: number;
  teamA: Team | null;
  teamB: Team | null;
  winner: Team | null;
}

interface AnalysisData {
  winProbA: number;
  winProbB: number;
  factors: string[];
  analysis: string;
  recommended: "A" | "B";
}

// ─── Historical upset rates by seed matchup ─────────────────────────────────
const UPSET_RATES: Record<string, number> = {
  "1v16": 0.01, "2v15": 0.06, "3v14": 0.15, "4v13": 0.21,
  "5v12": 0.35, "6v11": 0.37, "7v10": 0.39, "8v9": 0.49,
};

// ─── Region data: EAST, WEST, SOUTH, MIDWEST ───────────────────────────────
const REGIONS: Record<string, Team[]> = {
  EAST: [
    { name: "Duke", seed: 1, espnId: 150, conference: "ACC", rating: 95.2, offEff: 121.3, defEff: 92.1, record: "31-3", coach: "Jon Scheyer" },
    { name: "Alabama", seed: 2, espnId: 333, conference: "SEC", rating: 91.8, offEff: 118.7, defEff: 95.4, record: "25-8", coach: "Nate Oats" },
    { name: "Wisconsin", seed: 3, espnId: 275, conference: "Big Ten", rating: 89.5, offEff: 115.2, defEff: 94.8, record: "26-9", coach: "Greg Gard" },
    { name: "Arizona", seed: 4, espnId: 12, conference: "Big 12", rating: 87.9, offEff: 116.8, defEff: 97.2, record: "22-12", coach: "Tommy Lloyd" },
    { name: "Oregon", seed: 5, espnId: 2483, conference: "Big Ten", rating: 86.4, offEff: 114.5, defEff: 96.3, record: "24-9", coach: "Dana Altman" },
    { name: "BYU", seed: 6, espnId: 252, conference: "Big 12", rating: 85.1, offEff: 113.8, defEff: 97.1, record: "24-9", coach: "Kevin Young" },
    { name: "Saint Mary's", seed: 7, espnId: 2608, conference: "WCC", rating: 84.3, offEff: 112.4, defEff: 96.8, record: "28-5", coach: "Randy Bennett" },
    { name: "Mississippi St", seed: 8, espnId: 344, conference: "SEC", rating: 82.7, offEff: 111.2, defEff: 97.5, record: "21-12", coach: "Chris Jans" },
    { name: "Baylor", seed: 9, espnId: 239, conference: "Big 12", rating: 82.1, offEff: 110.8, defEff: 97.9, record: "19-14", coach: "Scott Drew" },
    { name: "Vanderbilt", seed: 10, espnId: 238, conference: "SEC", rating: 81.4, offEff: 109.6, defEff: 98.2, record: "20-12", coach: "Mark Byington" },
    { name: "VCU", seed: 11, espnId: 2670, conference: "A-10", rating: 80.2, offEff: 108.9, defEff: 98.7, record: "28-6", coach: "Ryan Odom" },
    { name: "Liberty", seed: 12, espnId: 2335, conference: "C-USA", rating: 79.1, offEff: 107.5, defEff: 99.1, record: "28-6", coach: "Ritchie McKay" },
    { name: "Akron", seed: 13, espnId: 2006, conference: "MAC", rating: 77.8, offEff: 106.2, defEff: 99.8, record: "28-6", coach: "John Groce" },
    { name: "Montana", seed: 14, espnId: 149, conference: "Big Sky", rating: 75.4, offEff: 104.8, defEff: 101.2, record: "25-9", coach: "Travis DeCuire" },
    { name: "Robert Morris", seed: 15, espnId: 2523, conference: "Horizon", rating: 73.2, offEff: 103.1, defEff: 102.5, record: "26-8", coach: "Andrew Toole" },
    { name: "Mt St Mary's", seed: 16, espnId: 116, conference: "MAAC", rating: 68.5, offEff: 99.4, defEff: 105.8, record: "22-12", coach: "Dan Engelstad" },
  ],
  WEST: [
    { name: "Florida", seed: 1, espnId: 57, conference: "SEC", rating: 96.1, offEff: 122.5, defEff: 91.3, record: "30-4", coach: "Todd Golden" },
    { name: "St. John's", seed: 2, espnId: 2599, conference: "Big East", rating: 92.4, offEff: 119.1, defEff: 94.2, record: "30-4", coach: "Rick Pitino" },
    { name: "Texas Tech", seed: 3, espnId: 2641, conference: "Big 12", rating: 90.1, offEff: 116.3, defEff: 93.9, record: "25-8", coach: "Grant McCasland" },
    { name: "Maryland", seed: 4, espnId: 120, conference: "Big Ten", rating: 88.2, offEff: 115.7, defEff: 96.1, record: "25-8", coach: "Kevin Willard" },
    { name: "Memphis", seed: 5, espnId: 235, conference: "American", rating: 86.8, offEff: 114.9, defEff: 96.5, record: "29-5", coach: "Penny Hardaway" },
    { name: "Missouri", seed: 6, espnId: 142, conference: "SEC", rating: 84.9, offEff: 113.5, defEff: 97.3, record: "22-11", coach: "Dennis Gates" },
    { name: "Kansas", seed: 7, espnId: 2305, conference: "Big 12", rating: 83.7, offEff: 112.1, defEff: 97.0, record: "21-12", coach: "Bill Self" },
    { name: "UConn", seed: 8, espnId: 41, conference: "Big East", rating: 83.0, offEff: 111.8, defEff: 97.4, record: "23-10", coach: "Dan Hurley" },
    { name: "Oklahoma", seed: 9, espnId: 201, conference: "SEC", rating: 81.8, offEff: 110.4, defEff: 98.0, record: "20-13", coach: "Porter Moser" },
    { name: "Arkansas", seed: 10, espnId: 8, conference: "SEC", rating: 81.2, offEff: 109.9, defEff: 98.4, record: "20-13", coach: "John Calipari" },
    { name: "Drake", seed: 11, espnId: 2181, conference: "MVC", rating: 80.5, offEff: 109.2, defEff: 98.5, record: "30-3", coach: "Darian DeVries" },
    { name: "Colorado St", seed: 12, espnId: 36, conference: "MWC", rating: 78.8, offEff: 107.1, defEff: 99.3, record: "25-9", coach: "Niko Medved" },
    { name: "Grand Canyon", seed: 13, espnId: 2253, conference: "WAC", rating: 77.2, offEff: 106.5, defEff: 100.1, record: "26-7", coach: "Bryce Drew" },
    { name: "UNC Wilmington", seed: 14, espnId: 350, conference: "CAA", rating: 75.8, offEff: 105.1, defEff: 101.0, record: "27-7", coach: "Takayo Siddle" },
    { name: "Omaha", seed: 15, espnId: 2437, conference: "Summit", rating: 72.5, offEff: 102.8, defEff: 103.1, record: "22-12", coach: "Chris Crutchfield" },
    { name: "Norfolk State", seed: 16, espnId: 2450, conference: "MEAC", rating: 67.8, offEff: 98.9, defEff: 106.2, record: "24-10", coach: "Robert Jones" },
  ],
  SOUTH: [
    { name: "Auburn", seed: 1, espnId: 2, conference: "SEC", rating: 97.3, offEff: 123.1, defEff: 90.5, record: "28-5", coach: "Bruce Pearl" },
    { name: "Michigan St", seed: 2, espnId: 127, conference: "Big Ten", rating: 92.8, offEff: 119.5, defEff: 93.8, record: "27-6", coach: "Tom Izzo" },
    { name: "Iowa State", seed: 3, espnId: 66, conference: "Big 12", rating: 90.4, offEff: 116.1, defEff: 93.5, record: "24-9", coach: "T.J. Otzelberger" },
    { name: "Texas A&M", seed: 4, espnId: 245, conference: "SEC", rating: 88.5, offEff: 115.9, defEff: 95.8, record: "22-10", coach: "Buzz Williams" },
    { name: "Michigan", seed: 5, espnId: 130, conference: "Big Ten", rating: 87.1, offEff: 115.2, defEff: 96.0, record: "25-9", coach: "Dusty May" },
    { name: "Ole Miss", seed: 6, espnId: 145, conference: "SEC", rating: 85.3, offEff: 113.7, defEff: 96.9, record: "22-11", coach: "Chris Beard" },
    { name: "Marquette", seed: 7, espnId: 269, conference: "Big East", rating: 84.6, offEff: 112.8, defEff: 96.6, record: "23-10", coach: "Shaka Smart" },
    { name: "Louisville", seed: 8, espnId: 97, conference: "ACC", rating: 83.4, offEff: 112.0, defEff: 96.9, record: "27-7", coach: "Pat Kelsey" },
    { name: "Creighton", seed: 9, espnId: 156, conference: "Big East", rating: 82.5, offEff: 111.5, defEff: 97.6, record: "24-10", coach: "Greg McDermott" },
    { name: "New Mexico", seed: 10, espnId: 167, conference: "MWC", rating: 81.6, offEff: 110.2, defEff: 98.0, record: "26-7", coach: "Richard Pitino" },
    { name: "North Carolina", seed: 11, espnId: 153, conference: "ACC", rating: 80.8, offEff: 109.8, defEff: 98.4, record: "22-13", coach: "Hubert Davis" },
    { name: "UC San Diego", seed: 12, espnId: 5765, conference: "Big West", rating: 79.5, offEff: 108.2, defEff: 98.9, record: "30-4", coach: "Eric Olen" },
    { name: "Yale", seed: 13, espnId: 43, conference: "Ivy", rating: 77.5, offEff: 106.8, defEff: 100.0, record: "22-7", coach: "James Jones" },
    { name: "Lipscomb", seed: 14, espnId: 288, conference: "ASUN", rating: 75.1, offEff: 104.5, defEff: 101.5, record: "25-9", coach: "Lennie Acuff" },
    { name: "Bryant", seed: 15, espnId: 2803, conference: "A-East", rating: 72.8, offEff: 103.2, defEff: 102.8, record: "23-11", coach: "Chris Burns" },
    { name: "Alabama State", seed: 16, espnId: 2011, conference: "SWAC", rating: 66.9, offEff: 97.8, defEff: 107.1, record: "19-15", coach: "Tony Pujol" },
  ],
  MIDWEST: [
    { name: "Houston", seed: 1, espnId: 248, conference: "Big 12", rating: 96.8, offEff: 122.0, defEff: 89.8, record: "30-4", coach: "Kelvin Sampson" },
    { name: "Tennessee", seed: 2, espnId: 2633, conference: "SEC", rating: 93.1, offEff: 119.8, defEff: 93.2, record: "27-7", coach: "Rick Barnes" },
    { name: "Kentucky", seed: 3, espnId: 96, conference: "SEC", rating: 89.8, offEff: 116.5, defEff: 94.5, record: "22-11", coach: "Mark Pope" },
    { name: "Purdue", seed: 4, espnId: 2509, conference: "Big Ten", rating: 88.0, offEff: 116.2, defEff: 96.0, record: "22-11", coach: "Matt Painter" },
    { name: "Clemson", seed: 5, espnId: 228, conference: "ACC", rating: 86.6, offEff: 114.7, defEff: 96.2, record: "27-6", coach: "Brad Brownell" },
    { name: "Illinois", seed: 6, espnId: 356, conference: "Big Ten", rating: 85.0, offEff: 113.9, defEff: 97.0, record: "21-12", coach: "Brad Underwood" },
    { name: "UCLA", seed: 7, espnId: 26, conference: "Big Ten", rating: 84.1, offEff: 112.6, defEff: 97.2, record: "22-10", coach: "Mick Cronin" },
    { name: "Gonzaga", seed: 8, espnId: 2250, conference: "WCC", rating: 83.2, offEff: 112.3, defEff: 97.1, record: "25-8", coach: "Mark Few" },
    { name: "Georgia", seed: 9, espnId: 61, conference: "SEC", rating: 82.3, offEff: 111.0, defEff: 97.7, record: "20-12", coach: "Mike White" },
    { name: "Utah State", seed: 10, espnId: 328, conference: "MWC", rating: 81.0, offEff: 109.5, defEff: 98.5, record: "26-7", coach: "Jerrod Calhoun" },
    { name: "Xavier", seed: 11, espnId: 2752, conference: "Big East", rating: 80.4, offEff: 109.1, defEff: 98.6, record: "21-11", coach: "Sean Miller" },
    { name: "McNeese", seed: 12, espnId: 2377, conference: "Southland", rating: 79.0, offEff: 107.8, defEff: 99.0, record: "27-6", coach: "Will Wade" },
    { name: "High Point", seed: 13, espnId: 2272, conference: "Big South", rating: 77.0, offEff: 106.0, defEff: 100.4, record: "29-5", coach: "Tubby Smith" },
    { name: "Troy", seed: 14, espnId: 2653, conference: "Sun Belt", rating: 74.8, offEff: 104.2, defEff: 101.8, record: "23-10", coach: "Scott Cross" },
    { name: "Wofford", seed: 15, espnId: 2747, conference: "Southern", rating: 73.0, offEff: 103.5, defEff: 102.3, record: "19-15", coach: "Jay McAuley" },
    { name: "SIU Edwardsville", seed: 16, espnId: 2565, conference: "OVC", rating: 67.2, offEff: 98.5, defEff: 106.5, record: "22-11", coach: "Brian Barone" },
  ],
};

// ─── Prediction engine ──────────────────────────────────────────────────────
function getMatchupKey(seedA: number, seedB: number): string {
  const hi = Math.min(seedA, seedB);
  const lo = Math.max(seedA, seedB);
  return `${hi}v${lo}`;
}

function computeAnalysis(a: Team, b: Team): AnalysisData {
  const effGapA = (a.offEff - a.defEff) - (b.offEff - b.defEff);
  const ratingGap = a.rating - b.rating;
  const seedKey = getMatchupKey(a.seed, b.seed);
  const historicalUpset = UPSET_RATES[seedKey] ?? 0.3;

  // Base probability from rating
  let probA = 1 / (1 + Math.pow(10, -ratingGap / 15));

  // Adjust with historical upset rate
  const isAHigherSeed = a.seed < b.seed;
  if (isAHigherSeed) {
    probA = probA * 0.6 + (1 - historicalUpset) * 0.4;
  } else {
    probA = probA * 0.6 + historicalUpset * 0.4;
  }

  probA = Math.max(0.03, Math.min(0.97, probA));
  const probB = 1 - probA;

  const factors: string[] = [];
  if (Math.abs(effGapA) > 5) {
    factors.push(
      effGapA > 0
        ? `${a.name} has a significant efficiency advantage (+${effGapA.toFixed(1)} net)`
        : `${b.name} has a significant efficiency advantage (+${(-effGapA).toFixed(1)} net)`
    );
  } else {
    factors.push(`Tight efficiency margins — net gap of just ${Math.abs(effGapA).toFixed(1)} points`);
  }

  if (Math.abs(a.seed - b.seed) >= 5) {
    const fav = a.seed < b.seed ? a : b;
    const dog = a.seed < b.seed ? b : a;
    factors.push(
      `Seed gap of ${Math.abs(a.seed - b.seed)} — historically, ${dog.seed}-seeds upset ${fav.seed}-seeds ${((a.seed < b.seed ? historicalUpset : 1 - historicalUpset) * 100).toFixed(0)}% of the time`
    );
  } else {
    factors.push(`Close seeds (${a.seed} vs ${b.seed}) — expect a competitive, coin-flip style game`);
  }

  const betterOff = a.offEff > b.offEff ? a : b;
  const betterDef = a.defEff < b.defEff ? a : b;
  if (betterOff.name !== betterDef.name) {
    factors.push(`Stylistic clash: ${betterOff.name}'s offense (${betterOff.offEff}) vs ${betterDef.name}'s defense (${betterDef.defEff})`);
  } else {
    factors.push(`${betterOff.name} is superior on both ends of the floor`);
  }

  const recommended: "A" | "B" = probA >= probB ? "A" : "B";
  const favTeam = recommended === "A" ? a : b;
  const dogTeam = recommended === "A" ? b : a;
  const favProb = recommended === "A" ? probA : probB;

  const analysis = `Our model gives ${favTeam.name} (${favTeam.record}) a ${(favProb * 100).toFixed(0)}% chance to advance. ${favTeam.coach}'s squad ranks with a ${favTeam.offEff} offensive efficiency and ${favTeam.defEff} defensive efficiency, ${favProb > 0.7 ? "making them a clear favorite" : "though this could be tighter than the seed line suggests"}. ${dogTeam.name} (${dogTeam.record}) ${favProb > 0.8 ? "faces an uphill battle but could pull the upset if they control tempo and limit turnovers" : "has a legitimate shot — look for their " + (dogTeam.offEff > dogTeam.defEff + 10 ? "offensive firepower" : "defensive grit") + " to keep this competitive"}.`;

  return { winProbA: probA, winProbB: probB, factors, analysis, recommended };
}

// ─── Standard NCAA bracket order ────────────────────────────────────────────
const SEED_MATCHUP_ORDER = [
  [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15],
];

function buildRegionMatchups(regionTeams: Team[]): Matchup[] {
  const byS: Record<number, Team> = {};
  regionTeams.forEach((t) => (byS[t.seed] = t));

  return SEED_MATCHUP_ORDER.map(([sA, sB], i) => ({
    id: `r64-${i}`,
    round: 0,
    position: i,
    teamA: byS[sA] || null,
    teamB: byS[sB] || null,
    winner: null,
  }));
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function MarchMadnessBracket() {
  const [activeTab, setActiveTab] = useState<string>("SOUTH");
  const [picks, setPicks] = useState<Record<string, Record<string, Team>>>({});
  const [modalMatchup, setModalMatchup] = useState<{ region: string; round: number; pos: number } | null>(null);

  const regionNames = ["EAST", "WEST", "SOUTH", "MIDWEST"];

  // Build all rounds for a given region
  const getRegionBracket = useCallback(
    (region: string) => {
      const teams = REGIONS[region];
      if (!teams) return { rounds: [] as Matchup[][] };

      const r64 = buildRegionMatchups(teams);
      const rPicks = picks[region] || {};

      // Apply picks to R64
      r64.forEach((m) => {
        const pickKey = `0-${m.position}`;
        if (rPicks[pickKey]) m.winner = rPicks[pickKey];
      });

      const rounds: Matchup[][] = [r64];

      // Build subsequent rounds
      for (let round = 1; round <= 3; round++) {
        const prev = rounds[round - 1];
        const curr: Matchup[] = [];
        for (let i = 0; i < prev.length; i += 2) {
          const pos = i / 2;
          const tA = prev[i].winner;
          const tB = prev[i + 1]?.winner ?? null;
          const pickKey = `${round}-${pos}`;
          curr.push({
            id: `r${round}-${pos}`,
            round,
            position: pos,
            teamA: tA,
            teamB: tB,
            winner: rPicks[pickKey] || null,
          });
        }
        rounds.push(curr);
      }

      return { rounds };
    },
    [picks]
  );

  // Final Four data
  const getFinalFour = useCallback(() => {
    const regionOrder = ["SOUTH", "WEST", "EAST", "MIDWEST"];
    const eliteWinners = regionOrder.map((r) => {
      const p = picks[r] || {};
      return p["3-0"] || null;
    });

    const ffPicks = picks["FINAL_FOUR"] || {};

    const semi1: Matchup = {
      id: "ff-0", round: 4, position: 0,
      teamA: eliteWinners[0], teamB: eliteWinners[1],
      winner: ffPicks["4-0"] || null,
    };
    const semi2: Matchup = {
      id: "ff-1", round: 4, position: 1,
      teamA: eliteWinners[2], teamB: eliteWinners[3],
      winner: ffPicks["4-1"] || null,
    };
    const champ: Matchup = {
      id: "ff-champ", round: 5, position: 0,
      teamA: semi1.winner, teamB: semi2.winner,
      winner: ffPicks["5-0"] || null,
    };

    return { semi1, semi2, champ, eliteWinners, regionOrder };
  }, [picks]);

  const handlePick = useCallback(
    (region: string, round: number, position: number, team: Team) => {
      setPicks((prev) => {
        const rPicks = { ...(prev[region] || {}) };
        const key = `${round}-${position}`;
        rPicks[key] = team;

        // Clear downstream picks that depended on a different winner
        const clearDownstream = (r: number, p: number) => {
          const nextR = r + 1;
          const nextP = Math.floor(p / 2);
          const nextKey = `${nextR}-${nextP}`;
          if (rPicks[nextKey]) {
            delete rPicks[nextKey];
            clearDownstream(nextR, nextP);
          }
        };
        clearDownstream(round, position);

        return { ...prev, [region]: rPicks };
      });
      setModalMatchup(null);
    },
    []
  );

  const roundLabels = ["ROUND OF 64", "ROUND OF 32", "SWEET 16", "ELITE EIGHT"];

  // ─── Modal ────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!modalMatchup) return null;
    const { region, round, pos } = modalMatchup;

    let matchup: Matchup | null = null;
    let pickRegion = region;

    if (region === "FINAL_FOUR") {
      const ff = getFinalFour();
      if (round === 4) matchup = pos === 0 ? ff.semi1 : ff.semi2;
      else matchup = ff.champ;
      pickRegion = "FINAL_FOUR";
    } else {
      const bracket = getRegionBracket(region);
      matchup = bracket.rounds[round]?.[pos] ?? null;
    }

    if (!matchup || !matchup.teamA || !matchup.teamB) return null;

    const a = matchup.teamA;
    const b = matchup.teamB;
    const analysis = computeAnalysis(a, b);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        onClick={() => setModalMatchup(null)}
      >
        <div
          className="w-full max-w-lg rounded-xl border border-gray-700 p-6"
          style={{ backgroundColor: "#141418" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-4 text-center">
            <div className="text-xs font-bold tracking-widest text-blue-400 mb-1">
              {region === "FINAL_FOUR"
                ? round === 5
                  ? "NATIONAL CHAMPIONSHIP"
                  : "FINAL FOUR"
                : roundLabels[round] || ""}
            </div>
            <div className="text-lg font-bold text-white">
              ({a.seed}) {a.name} vs ({b.seed}) {b.name}
            </div>
          </div>

          {/* Probability bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-400 font-semibold">{a.name} {(analysis.winProbA * 100).toFixed(0)}%</span>
              <span className="text-orange-400 font-semibold">{(analysis.winProbB * 100).toFixed(0)}% {b.name}</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-gray-700 flex">
              <div
                className="h-full transition-all"
                style={{
                  width: `${analysis.winProbA * 100}%`,
                  background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
                }}
              />
              <div
                className="h-full transition-all"
                style={{
                  width: `${analysis.winProbB * 100}%`,
                  background: "linear-gradient(90deg, #F97316, #FB923C)",
                }}
              />
            </div>
          </div>

          {/* Key factors */}
          <div className="mb-4 space-y-2">
            <div className="text-xs font-bold text-gray-400 tracking-wider">KEY FACTORS</div>
            {analysis.factors.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-yellow-400 mt-0.5">▸</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div className="mb-5 rounded-lg p-3 border border-gray-600" style={{ backgroundColor: "#1a1a1f" }}>
            <div className="text-xs font-bold text-gray-400 tracking-wider mb-1">AI ANALYSIS</div>
            <p className="text-sm text-gray-300 leading-relaxed">{analysis.analysis}</p>
          </div>

          {/* Team comparison */}
          <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-gray-400">
            {[a, b].map((t, idx) => (
              <div key={idx} className="rounded-lg p-2 text-center" style={{ backgroundColor: "#1a1a1f" }}>
                <img
                  src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${t.espnId}.png`}
                  alt={t.name}
                  className="w-10 h-10 mx-auto mb-1 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="text-white font-bold text-sm">{t.name}</div>
                <div>{t.record} · {t.conference}</div>
                <div>Off: {t.offEff} · Def: {t.defEff}</div>
                <div>Coach: {t.coach}</div>
              </div>
            ))}
          </div>

          {/* Pick buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { team: a, label: "A", rec: analysis.recommended === "A" },
              { team: b, label: "B", rec: analysis.recommended === "B" },
            ].map(({ team, rec }) => (
              <button
                key={team.name}
                onClick={() => handlePick(pickRegion, round, pos, team)}
                className="py-3 rounded-lg font-bold text-sm transition-all border"
                style={{
                  backgroundColor: rec ? "#1e3a5f" : "#1a1a1f",
                  borderColor: rec ? "#3B82F6" : "#374151",
                  color: rec ? "#93C5FD" : "#9CA3AF",
                }}
              >
                {rec && <span className="text-xs block text-blue-400 mb-0.5">★ AI PICK</span>}
                Pick ({team.seed}) {team.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Team cell ────────────────────────────────────────────────────────
  const TeamCell = ({
    team,
    isWinner,
    isClickable,
    onClick,
  }: {
    team: Team | null;
    isWinner: boolean;
    isClickable: boolean;
    onClick?: () => void;
  }) => {
    if (!team) {
      return (
        <div
          className="h-10 rounded border border-dashed flex items-center justify-center text-xs"
          style={{ borderColor: "#2a2a30", color: "#4a4a50", minWidth: 150 }}
        >
          TBD
        </div>
      );
    }
    return (
      <div
        onClick={isClickable ? onClick : undefined}
        className={`h-10 rounded flex items-center gap-2 px-2 border text-sm transition-all ${
          isClickable ? "cursor-pointer hover:border-blue-500" : ""
        }`}
        style={{
          backgroundColor: isWinner ? "#1e3a5f" : "#141418",
          borderColor: isWinner ? "#3B82F6" : "#2a2a30",
          minWidth: 150,
        }}
      >
        <img
          src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${team.espnId}.png`}
          alt=""
          className="w-5 h-5 object-contain flex-shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span
          className="text-xs font-bold flex-shrink-0 w-5 h-5 rounded flex items-center justify-center"
          style={{ backgroundColor: "#0A0A0C", color: seedColor(team.seed) }}
        >
          {team.seed}
        </span>
        <span className="text-white font-medium truncate text-xs">{team.name}</span>
        {isWinner && <span className="ml-auto text-green-400 text-xs">✓</span>}
      </div>
    );
  };

  // ─── Seed color coding ────────────────────────────────────────────────
  function seedColor(seed: number): string {
    if (seed <= 4) return "#34D399";
    if (seed <= 8) return "#60A5FA";
    if (seed <= 12) return "#FBBF24";
    return "#F87171";
  }

  // ─── Region bracket renderer ──────────────────────────────────────────
  const renderRegionBracket = (region: string) => {
    const { rounds } = getRegionBracket(region);
    const regionPicks = picks[region] || {};

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-1 min-w-fit items-start">
          {rounds.map((roundMatchups, roundIdx) => (
            <div key={roundIdx} className="flex flex-col" style={{ minWidth: 170 }}>
              {/* Round header */}
              <div
                className="text-center text-xs font-bold tracking-wider mb-3 py-1.5 rounded"
                style={{ color: "#9CA3AF", backgroundColor: "#141418" }}
              >
                {roundLabels[roundIdx]}
              </div>
              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: roundIdx === 0 ? 4 : undefined }}
              >
                {roundMatchups.map((matchup, mIdx) => {
                  const pickKey = `${roundIdx}-${mIdx}`;
                  const hasBothTeams = matchup.teamA && matchup.teamB;
                  const isPicked = !!regionPicks[pickKey];

                  return (
                    <div
                      key={mIdx}
                      className="flex flex-col gap-0.5 relative"
                      style={{
                        marginTop: roundIdx > 0 ? `${Math.pow(2, roundIdx) * 8}px` : 0,
                        marginBottom: roundIdx > 0 ? `${Math.pow(2, roundIdx) * 8}px` : 0,
                      }}
                    >
                      {/* Connector line */}
                      {roundIdx > 0 && (
                        <div
                          className="absolute -left-1 top-1/2 w-1"
                          style={{
                            height: 1,
                            backgroundColor: "#3B82F6",
                            transform: "translateY(-50%)",
                          }}
                        />
                      )}
                      {roundIdx < rounds.length - 1 && (
                        <div
                          className="absolute -right-1 top-1/2 w-1"
                          style={{
                            height: 1,
                            backgroundColor: "#2a2a30",
                          }}
                        />
                      )}

                      <div
                        onClick={() => {
                          if (hasBothTeams && !isPicked) {
                            setModalMatchup({ region, round: roundIdx, pos: mIdx });
                          }
                        }}
                        className={`rounded-lg border p-1 ${
                          hasBothTeams && !isPicked
                            ? "cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10"
                            : ""
                        }`}
                        style={{
                          backgroundColor: "#0e0e12",
                          borderColor: hasBothTeams && !isPicked ? "#3B82F6" : "#1e1e24",
                        }}
                      >
                        <TeamCell
                          team={matchup.teamA}
                          isWinner={matchup.winner?.name === matchup.teamA?.name}
                          isClickable={false}
                        />
                        <div className="h-px my-0.5" style={{ backgroundColor: "#1e1e24" }} />
                        <TeamCell
                          team={matchup.teamB}
                          isWinner={matchup.winner?.name === matchup.teamB?.name}
                          isClickable={false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Final Four renderer ──────────────────────────────────────────────
  const renderFinalFour = () => {
    const ff = getFinalFour();
    const ffPicks = picks["FINAL_FOUR"] || {};

    const renderFFMatchup = (matchup: Matchup, round: number, pos: number, label: string) => {
      const hasBoth = matchup.teamA && matchup.teamB;
      const pickKey = `${round}-${pos}`;
      const isPicked = !!ffPicks[pickKey];

      return (
        <div className="flex-1 max-w-sm">
          <div className="text-center text-xs font-bold tracking-wider mb-2" style={{ color: "#9CA3AF" }}>
            {label}
          </div>
          <div
            onClick={() => {
              if (hasBoth && !isPicked) {
                setModalMatchup({ region: "FINAL_FOUR", round, pos });
              }
            }}
            className={`rounded-lg border p-1.5 ${
              hasBoth && !isPicked ? "cursor-pointer hover:border-blue-500" : ""
            }`}
            style={{
              backgroundColor: "#0e0e12",
              borderColor: hasBoth && !isPicked ? "#3B82F6" : "#1e1e24",
            }}
          >
            <TeamCell
              team={matchup.teamA}
              isWinner={matchup.winner?.name === matchup.teamA?.name}
              isClickable={false}
            />
            <div className="h-px my-1" style={{ backgroundColor: "#1e1e24" }} />
            <TeamCell
              team={matchup.teamB}
              isWinner={matchup.winner?.name === matchup.teamB?.name}
              isClickable={false}
            />
          </div>
          {matchup.teamA && (
            <div className="text-center mt-1">
              <span className="text-xs text-gray-500">
                {matchup.teamA
                  ? `${ff.regionOrder[round === 4 ? pos * 2 : 0]} vs ${ff.regionOrder[round === 4 ? pos * 2 + 1 : 2]}`
                  : ""}
              </span>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center gap-8 py-4">
        {/* Semi finals */}
        <div className="flex gap-8 w-full max-w-2xl justify-center">
          {renderFFMatchup(ff.semi1, 4, 0, "SEMIFINAL 1")}
          {renderFFMatchup(ff.semi2, 4, 1, "SEMIFINAL 2")}
        </div>

        {/* Championship */}
        <div className="w-full max-w-sm">
          {renderFFMatchup(ff.champ, 5, 0, "🏆 NATIONAL CHAMPIONSHIP")}
        </div>

        {/* Champion display */}
        {ff.champ.winner && (
          <div className="text-center mt-4 p-6 rounded-xl border border-yellow-500/30" style={{ backgroundColor: "#1a1810" }}>
            <div className="text-yellow-400 text-xs tracking-widest font-bold mb-2">🏆 PREDICTED NATIONAL CHAMPION 🏆</div>
            <img
              src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${ff.champ.winner.espnId}.png`}
              alt={ff.champ.winner.name}
              className="w-20 h-20 mx-auto mb-2 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="text-3xl font-black text-white">{ff.champ.winner.name}</div>
            <div className="text-sm text-yellow-400 mt-1">
              ({ff.champ.winner.seed}) seed · {ff.champ.winner.record} · {ff.champ.winner.conference}
            </div>
            <div className="text-xs text-gray-400 mt-1">Coach: {ff.champ.winner.coach}</div>
          </div>
        )}

        {/* Region winners */}
        <div className="w-full max-w-2xl">
          <div className="text-xs font-bold text-gray-400 tracking-wider mb-3 text-center">REGION CHAMPIONS</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ff.regionOrder.map((r, i) => {
              const winner = ff.eliteWinners[i];
              return (
                <div
                  key={r}
                  className="rounded-lg border p-3 text-center"
                  style={{
                    backgroundColor: winner ? "#141418" : "#0e0e12",
                    borderColor: winner ? "#3B82F6" : "#1e1e24",
                  }}
                >
                  <div className="text-xs text-gray-500 mb-1">{r}</div>
                  {winner ? (
                    <>
                      <img
                        src={`https://a.espncdn.com/i/teamlogos/ncaa/500/${winner.espnId}.png`}
                        alt={winner.name}
                        className="w-8 h-8 mx-auto mb-1 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="text-sm font-bold text-white">({winner.seed}) {winner.name}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">TBD</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ─── Progress tracker ─────────────────────────────────────────────────
  const totalPicks = useMemo(() => {
    let count = 0;
    Object.values(picks).forEach((rp) => {
      count += Object.keys(rp).length;
    });
    return count;
  }, [picks]);

  const tabs = [...regionNames, "FINAL FOUR"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0C", color: "#E5E7EB" }}>
      {/* Banner */}
      <div
        className="border-b"
        style={{
          borderColor: "#1e1e24",
          background: "linear-gradient(180deg, #0f1020 0%, #0A0A0C 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-5 text-center">
          <div className="text-xs tracking-[0.3em] text-blue-400 font-bold mb-1">
            MARCH MADNESS
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            2026 NCAA Tournament Predictions
          </h1>
          <p className="text-xs text-gray-500">
            Trained on 2013–2025 historical data · Seed differentials · Efficiency metrics · Upset probability modeling
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            <span>
              <span className="text-blue-400 font-bold">{totalPicks}</span> / 63 picks made
            </span>
            <span className="text-gray-600">|</span>
            <span>64 teams · 4 regions · 6 rounds</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: "#1e1e24" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-0">
            {tabs.map((tab) => {
              const isActive = activeTab === (tab === "FINAL FOUR" ? "FINAL_FOUR" : tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab === "FINAL FOUR" ? "FINAL_FOUR" : tab)}
                  className="px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap transition-all border-b-2"
                  style={{
                    borderColor: isActive ? "#3B82F6" : "transparent",
                    color: isActive ? "#3B82F6" : "#6B7280",
                    backgroundColor: isActive ? "rgba(59,130,246,0.05)" : "transparent",
                  }}
                >
                  {tab === "FINAL FOUR" ? "🏆 FINAL FOUR" : tab}
                  {tab !== "FINAL FOUR" && (
                    <span className="ml-1.5 text-gray-600">
                      {Object.keys(picks[tab] || {}).length}/15
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "FINAL_FOUR" ? (
          renderFinalFour()
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-white">{activeTab} REGION</h2>
              <span className="text-xs text-gray-500">
                {activeTab === "EAST" && "Newark, NJ"}
                {activeTab === "WEST" && "San Francisco, CA"}
                {activeTab === "SOUTH" && "Atlanta, GA"}
                {activeTab === "MIDWEST" && "Indianapolis, IN"}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              Click a highlighted matchup to see analysis and make your pick. Winners advance to the next round.
            </div>
            {renderRegionBracket(activeTab)}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t py-4 text-center text-xs text-gray-600" style={{ borderColor: "#1e1e24" }}>
        Predictions based on KenPom-style efficiency metrics, historical upset rates by seed, and conference strength adjustments.
        <br />
        Not affiliated with the NCAA. For entertainment purposes only.
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
