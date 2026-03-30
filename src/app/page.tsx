"use client";

import { useState, useMemo } from "react";

/* ─── Types ─── */
interface Team {
  name: string;
  seed: number;
  conference: string;
  kenpomRating: number;
  offensiveEff: number;
  defensiveEff: number;
  tempo: number;
  sos: number;
  threePointPct: number;
  recentRecord: string;
  tournamentRound: string;
  region: string;
}

interface Prediction {
  teamA: Team;
  teamB: Team;
  winProbA: number;
  winProbB: number;
  confidence: "High" | "Medium" | "Low";
  isUpset: boolean;
  factors: string[];
  analysis: string;
  historicalMatchups: { year: number; teamA: string; teamB: string; score: string; round: string }[];
}

/* ─── Mock Data: 2025 Tournament Teams ─── */
const TEAMS: Team[] = [
  { name: "Houston", seed: 1, conference: "Big 12", kenpomRating: 29.8, offensiveEff: 119.2, defensiveEff: 89.4, tempo: 64.8, sos: 3.1, threePointPct: 36.8, recentRecord: "14-1", tournamentRound: "Final Four", region: "South" },
  { name: "Duke", seed: 1, conference: "ACC", kenpomRating: 28.5, offensiveEff: 121.5, defensiveEff: 93.0, tempo: 71.2, sos: 5.4, threePointPct: 37.2, recentRecord: "13-2", tournamentRound: "Final Four", region: "East" },
  { name: "Auburn", seed: 1, conference: "SEC", kenpomRating: 30.1, offensiveEff: 120.8, defensiveEff: 90.7, tempo: 68.5, sos: 2.8, threePointPct: 35.9, recentRecord: "15-0", tournamentRound: "Final Four", region: "Midwest" },
  { name: "Florida", seed: 1, conference: "SEC", kenpomRating: 27.9, offensiveEff: 118.6, defensiveEff: 90.7, tempo: 69.3, sos: 4.2, threePointPct: 38.1, recentRecord: "13-2", tournamentRound: "Final Four", region: "West" },
  { name: "Tennessee", seed: 2, conference: "SEC", kenpomRating: 26.4, offensiveEff: 116.8, defensiveEff: 90.4, tempo: 63.5, sos: 6.1, threePointPct: 34.5, recentRecord: "12-3", tournamentRound: "Elite 8", region: "South" },
  { name: "Alabama", seed: 2, conference: "SEC", kenpomRating: 25.8, offensiveEff: 118.1, defensiveEff: 92.3, tempo: 72.8, sos: 4.8, threePointPct: 36.1, recentRecord: "11-4", tournamentRound: "Sweet 16", region: "East" },
  { name: "Iowa State", seed: 2, conference: "Big 12", kenpomRating: 26.1, offensiveEff: 115.9, defensiveEff: 89.8, tempo: 65.2, sos: 5.5, threePointPct: 35.4, recentRecord: "13-2", tournamentRound: "Elite 8", region: "Midwest" },
  { name: "St. John's", seed: 2, conference: "Big East", kenpomRating: 25.2, offensiveEff: 117.3, defensiveEff: 92.1, tempo: 68.9, sos: 7.2, threePointPct: 35.8, recentRecord: "12-3", tournamentRound: "Sweet 16", region: "West" },
  { name: "Michigan State", seed: 3, conference: "Big Ten", kenpomRating: 24.1, offensiveEff: 116.2, defensiveEff: 92.1, tempo: 67.8, sos: 8.3, threePointPct: 36.5, recentRecord: "11-4", tournamentRound: "Sweet 16", region: "South" },
  { name: "Texas Tech", seed: 3, conference: "Big 12", kenpomRating: 23.8, offensiveEff: 115.4, defensiveEff: 91.6, tempo: 66.1, sos: 7.9, threePointPct: 33.8, recentRecord: "12-3", tournamentRound: "Sweet 16", region: "East" },
  { name: "UConn", seed: 3, conference: "Big East", kenpomRating: 24.5, offensiveEff: 117.8, defensiveEff: 93.3, tempo: 68.2, sos: 9.1, threePointPct: 37.1, recentRecord: "10-5", tournamentRound: "Round of 32", region: "Midwest" },
  { name: "Marquette", seed: 3, conference: "Big East", kenpomRating: 23.5, offensiveEff: 116.9, defensiveEff: 93.4, tempo: 70.5, sos: 8.8, threePointPct: 36.9, recentRecord: "11-4", tournamentRound: "Sweet 16", region: "West" },
  { name: "Purdue", seed: 4, conference: "Big Ten", kenpomRating: 22.8, offensiveEff: 118.1, defensiveEff: 95.3, tempo: 67.4, sos: 10.2, threePointPct: 35.2, recentRecord: "10-5", tournamentRound: "Round of 32", region: "South" },
  { name: "Arizona", seed: 4, conference: "Big 12", kenpomRating: 23.2, offensiveEff: 117.5, defensiveEff: 94.3, tempo: 72.1, sos: 6.7, threePointPct: 36.4, recentRecord: "11-4", tournamentRound: "Sweet 16", region: "East" },
  { name: "Wisconsin", seed: 4, conference: "Big Ten", kenpomRating: 22.1, offensiveEff: 115.2, defensiveEff: 93.1, tempo: 63.8, sos: 11.4, threePointPct: 37.8, recentRecord: "12-3", tournamentRound: "Round of 32", region: "Midwest" },
  { name: "Maryland", seed: 4, conference: "Big Ten", kenpomRating: 21.9, offensiveEff: 114.8, defensiveEff: 92.9, tempo: 68.6, sos: 9.8, threePointPct: 35.1, recentRecord: "10-5", tournamentRound: "Round of 32", region: "West" },
  { name: "Clemson", seed: 5, conference: "ACC", kenpomRating: 20.5, offensiveEff: 113.2, defensiveEff: 92.7, tempo: 65.9, sos: 14.2, threePointPct: 34.6, recentRecord: "11-4", tournamentRound: "Round of 32", region: "South" },
  { name: "Michigan", seed: 5, conference: "Big Ten", kenpomRating: 20.1, offensiveEff: 114.5, defensiveEff: 94.4, tempo: 69.3, sos: 12.8, threePointPct: 35.9, recentRecord: "10-5", tournamentRound: "Round of 32", region: "East" },
  { name: "Oregon", seed: 5, conference: "Big Ten", kenpomRating: 19.8, offensiveEff: 113.8, defensiveEff: 94.0, tempo: 70.7, sos: 15.1, threePointPct: 34.2, recentRecord: "10-5", tournamentRound: "Round of 32", region: "Midwest" },
  { name: "Memphis", seed: 5, conference: "AAC", kenpomRating: 20.3, offensiveEff: 115.1, defensiveEff: 94.8, tempo: 73.2, sos: 18.5, threePointPct: 33.5, recentRecord: "11-4", tournamentRound: "Round of 32", region: "West" },
  { name: "BYU", seed: 6, conference: "Big 12", kenpomRating: 18.9, offensiveEff: 112.5, defensiveEff: 93.6, tempo: 66.8, sos: 16.3, threePointPct: 36.2, recentRecord: "10-5", tournamentRound: "Round of 64", region: "South" },
  { name: "Illinois", seed: 6, conference: "Big Ten", kenpomRating: 19.2, offensiveEff: 114.1, defensiveEff: 94.9, tempo: 71.5, sos: 13.7, threePointPct: 34.8, recentRecord: "9-6", tournamentRound: "Round of 64", region: "East" },
  { name: "Missouri", seed: 6, conference: "SEC", kenpomRating: 18.5, offensiveEff: 112.8, defensiveEff: 94.3, tempo: 68.4, sos: 17.2, threePointPct: 33.9, recentRecord: "10-5", tournamentRound: "Round of 64", region: "Midwest" },
  { name: "Louisville", seed: 6, conference: "ACC", kenpomRating: 18.1, offensiveEff: 113.4, defensiveEff: 95.3, tempo: 69.8, sos: 19.5, threePointPct: 35.5, recentRecord: "9-6", tournamentRound: "Round of 64", region: "West" },
  { name: "UCLA", seed: 7, conference: "Big Ten", kenpomRating: 17.2, offensiveEff: 112.1, defensiveEff: 94.9, tempo: 67.2, sos: 20.8, threePointPct: 34.1, recentRecord: "9-6", tournamentRound: "Round of 64", region: "South" },
  { name: "Kansas", seed: 7, conference: "Big 12", kenpomRating: 17.8, offensiveEff: 113.5, defensiveEff: 95.7, tempo: 70.4, sos: 11.5, threePointPct: 35.7, recentRecord: "8-7", tournamentRound: "Round of 64", region: "East" },
  { name: "Gonzaga", seed: 7, conference: "WCC", kenpomRating: 17.5, offensiveEff: 115.2, defensiveEff: 97.7, tempo: 72.6, sos: 28.3, threePointPct: 37.5, recentRecord: "10-5", tournamentRound: "Round of 64", region: "Midwest" },
  { name: "Texas A&M", seed: 7, conference: "SEC", kenpomRating: 16.9, offensiveEff: 111.8, defensiveEff: 94.9, tempo: 65.5, sos: 15.9, threePointPct: 33.2, recentRecord: "9-6", tournamentRound: "Round of 64", region: "West" },
  { name: "Florida Atlantic", seed: 8, conference: "AAC", kenpomRating: 15.2, offensiveEff: 110.5, defensiveEff: 95.3, tempo: 68.1, sos: 35.2, threePointPct: 34.8, recentRecord: "10-5", tournamentRound: "Round of 64", region: "South" },
  { name: "Baylor", seed: 8, conference: "Big 12", kenpomRating: 15.8, offensiveEff: 111.9, defensiveEff: 96.1, tempo: 67.5, sos: 22.4, threePointPct: 35.3, recentRecord: "8-7", tournamentRound: "Round of 64", region: "East" },
  { name: "Mississippi State", seed: 8, conference: "SEC", kenpomRating: 14.9, offensiveEff: 110.2, defensiveEff: 95.3, tempo: 66.8, sos: 18.7, threePointPct: 32.8, recentRecord: "9-6", tournamentRound: "Round of 64", region: "Midwest" },
  { name: "San Diego State", seed: 8, conference: "MWC", kenpomRating: 15.5, offensiveEff: 109.8, defensiveEff: 94.3, tempo: 63.9, sos: 32.1, threePointPct: 33.5, recentRecord: "10-5", tournamentRound: "Round of 64", region: "West" },
];

/* ─── Mock Prediction Engine ─── */
function generatePrediction(teamA: Team, teamB: Team): Prediction {
  const seedDiff = teamB.seed - teamA.seed;
  const kenpomDiff = teamA.kenpomRating - teamB.kenpomRating;
  const effDiff = (teamA.offensiveEff - teamA.defensiveEff) - (teamB.offensiveEff - teamB.defensiveEff);

  let rawProb = 50 + (seedDiff * 2.5) + (kenpomDiff * 1.2) + (effDiff * 0.3);
  rawProb = Math.min(95, Math.max(5, rawProb + (Math.random() * 8 - 4)));
  const winProbA = Math.round(rawProb * 10) / 10;
  const winProbB = Math.round((100 - winProbA) * 10) / 10;

  const probGap = Math.abs(winProbA - 50);
  const confidence: "High" | "Medium" | "Low" = probGap > 20 ? "High" : probGap > 10 ? "Medium" : "Low";

  const isUpset = (teamA.seed > teamB.seed && winProbA > 35) || (teamB.seed > teamA.seed && winProbB > 35);

  const factors: string[] = [];
  if (teamA.kenpomRating > teamB.kenpomRating + 5) factors.push(`${teamA.name}'s KenPom rating (${teamA.kenpomRating}) significantly outpaces ${teamB.name} (${teamB.kenpomRating})`);
  else if (teamB.kenpomRating > teamA.kenpomRating + 5) factors.push(`${teamB.name}'s KenPom rating (${teamB.kenpomRating}) significantly outpaces ${teamA.name} (${teamA.kenpomRating})`);
  if (teamA.defensiveEff < teamB.defensiveEff) factors.push(`${teamA.name}'s defensive efficiency (${teamA.defensiveEff}) is elite — top ${Math.max(5, Math.round(teamA.defensiveEff - 85))} nationally`);
  else factors.push(`${teamB.name}'s defensive efficiency (${teamB.defensiveEff}) gives them an edge`);
  if (teamA.threePointPct > 36) factors.push(`${teamA.name} shoots ${teamA.threePointPct}% from three — a perimeter threat in March`);
  if (teamB.tempo > 71) factors.push(`${teamB.name}'s up-tempo style (${teamB.tempo} possessions/game) could force turnovers`);
  if (factors.length < 3) factors.push(`${teamA.name} is ${teamA.recentRecord} in their last 15 games`);
  if (factors.length < 4) factors.push(`Strength of schedule favors ${teamA.sos < teamB.sos ? teamA.name : teamB.name} (SOS rank: ${Math.min(teamA.sos, teamB.sos)})`);

  const favored = winProbA > winProbB ? teamA : teamB;
  const underdog = winProbA > winProbB ? teamB : teamA;
  const analysis = `${favored.name} enters this matchup as the ${Math.abs(winProbA - winProbB) > 20 ? "clear" : "slight"} favorite, driven by ${favored.kenpomRating > underdog.kenpomRating ? "superior KenPom metrics" : "strong recent form"} and a ${favored.recentRecord} recent record. ${underdog.name}${isUpset ? " has legitimate upset potential" : " will need to control tempo"} — their ${underdog.defensiveEff < 94 ? "stifling defense" : underdog.threePointPct > 35.5 ? "perimeter shooting" : "balanced attack"} could be the x-factor. Watch for ${underdog.tempo > 70 ? "pace of play to be decisive" : "the battle on the glass"} in what should be a ${confidence === "High" ? "competitive but tilted" : "tightly contested"} affair.`;

  const historicalMatchups = [
    { year: 2024, teamA: teamA.name, teamB: teamB.name, score: `${65 + Math.floor(Math.random() * 20)}-${60 + Math.floor(Math.random() * 18)}`, round: "Round of 32" },
    { year: 2022, teamA: teamB.conference === "SEC" ? "Kentucky" : "Villanova", teamB: teamA.conference === "Big 12" ? "Texas" : "North Carolina", score: `${70 + Math.floor(Math.random() * 15)}-${65 + Math.floor(Math.random() * 15)}`, round: "Sweet 16" },
    { year: 2019, teamA: teamA.seed <= 3 ? teamA.name : "Virginia", teamB: teamB.seed <= 3 ? teamB.name : "Purdue", score: `${72 + Math.floor(Math.random() * 12)}-${68 + Math.floor(Math.random() * 12)}`, round: "Elite 8" },
  ];

  return { teamA, teamB, winProbA, winProbB, confidence, isUpset, factors, analysis, historicalMatchups };
}

/* ─── Quick Pick Matchups ─── */
const QUICK_PICKS = [
  { teamAName: "Houston", teamBName: "Duke", round: "Final Four" },
  { teamAName: "Auburn", teamBName: "Florida", round: "Final Four" },
  { teamAName: "Houston", teamBName: "Tennessee", round: "Elite 8" },
  { teamAName: "Duke", teamBName: "Arizona", round: "Elite 8" },
  { teamAName: "Auburn", teamBName: "Iowa State", round: "Elite 8" },
  { teamAName: "Florida", teamBName: "Marquette", round: "Sweet 16" },
];

/* ─── Components ─── */

function Header() {
  return (
    <header className="border-b border-[#2A2A30] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#3B82F6] flex items-center justify-center font-bold text-lg">
          B<span className="text-[#EF9F27]">IQ</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">BracketIQ</h1>
          <p className="text-xs text-[#9CA3AF]">AI March Madness Predictor</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Model Updated: March 30, 2026
      </div>
    </header>
  );
}

function ProbabilityBar({ probA, probB, teamAName, teamBName }: { probA: number; probB: number; teamAName: string; teamBName: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{teamAName} {probA.toFixed(1)}%</span>
        <span className="font-semibold">{teamBName} {probB.toFixed(1)}%</span>
      </div>
      <div className="w-full h-4 rounded-full overflow-hidden bg-[#1C1C22] flex">
        <div className="h-full bg-[#3B82F6] animate-bar-grow rounded-l-full transition-all" style={{ width: `${probA}%` }} />
        <div className="h-full bg-[#EF9F27] animate-bar-grow rounded-r-full transition-all" style={{ width: `${probB}%` }} />
      </div>
    </div>
  );
}

function ConfidenceBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const colors = { High: "bg-green-500/20 text-green-400", Medium: "bg-yellow-500/20 text-yellow-400", Low: "bg-red-500/20 text-red-400" };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[level]}`}>{level} Confidence</span>;
}

function UpsetBadge() {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EF9F27]/20 text-[#EF9F27] flex items-center gap-1">
      ⚠️ Upset Alert
    </span>
  );
}

function StatsTable({ teamA, teamB }: { teamA: Team; teamB: Team }) {
  const stats = [
    { label: "Seed", a: teamA.seed, b: teamB.seed },
    { label: "KenPom Rating", a: teamA.kenpomRating, b: teamB.kenpomRating },
    { label: "Off. Efficiency", a: teamA.offensiveEff, b: teamB.offensiveEff },
    { label: "Def. Efficiency", a: teamA.defensiveEff, b: teamB.defensiveEff },
    { label: "Tempo", a: teamA.tempo, b: teamB.tempo },
    { label: "SOS Rank", a: teamA.sos, b: teamB.sos },
    { label: "3PT %", a: teamA.threePointPct, b: teamB.threePointPct },
    { label: "Recent Record", a: teamA.recentRecord, b: teamB.recentRecord },
  ];

  const better = (label: string, a: number | string, b: number | string) => {
    if (typeof a === "string") return "";
    if (label === "Def. Efficiency" || label === "SOS Rank" || label === "Seed") return (a as number) < (b as number) ? "text-green-400" : (a as number) > (b as number) ? "text-red-400" : "";
    return (a as number) > (b as number) ? "text-green-400" : (a as number) < (b as number) ? "text-red-400" : "";
  };

  return (
    <div className="animate-slide-in">
      <h3 className="text-lg font-bold mb-3 flex items-center gap-2">📊 Stats Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2A2A30]">
              <th className="text-left py-2 text-[#9CA3AF] font-medium">Stat</th>
              <th className="text-center py-2 font-semibold text-[#3B82F6]">{teamA.name}</th>
              <th className="text-center py-2 font-semibold text-[#EF9F27]">{teamB.name}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.label} className="border-b border-[#2A2A30]/50 hover:bg-[#1C1C22]/50">
                <td className="py-2 text-[#9CA3AF]">{s.label}</td>
                <td className={`text-center py-2 font-mono ${better(s.label, s.a, s.b)}`}>{s.a}</td>
                <td className={`text-center py-2 font-mono ${better(s.label, s.b, s.a)}`}>{s.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuickPickCard({ teamA, teamB, round }: { teamA: Team; teamB: Team; round: string }) {
  const pred = useMemo(() => generatePrediction(teamA, teamB), [teamA, teamB]);
  return (
    <div className="bg-[#141418] rounded-xl border border-[#2A2A30] p-4 hover:border-[#3B82F6]/50 transition-colors">
      <div className="text-xs text-[#9CA3AF] mb-2 flex items-center justify-between">
        <span>{round}</span>
        {pred.isUpset && <span className="text-[#EF9F27] font-semibold text-[10px]">⚠️ UPSET</span>}
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="text-[#9CA3AF] text-xs mr-1">({teamA.seed})</span>
          <span className="font-semibold">{teamA.name}</span>
        </div>
        <span className="text-xs text-[#9CA3AF]">vs</span>
        <div className="text-sm text-right">
          <span className="font-semibold">{teamB.name}</span>
          <span className="text-[#9CA3AF] text-xs ml-1">({teamB.seed})</span>
        </div>
      </div>
      <ProbabilityBar probA={pred.winProbA} probB={pred.winProbB} teamAName={teamA.name} teamBName={teamB.name} />
    </div>
  );
}

function BracketView() {
  const finalFour = [
    { team: "Houston", seed: 1, region: "South" },
    { team: "Duke", seed: 1, region: "East" },
    { team: "Auburn", seed: 1, region: "Midwest" },
    { team: "Florida", seed: 1, region: "West" },
  ];

  return (
    <div className="animate-slide-in">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🏆 Predicted Bracket — Final Four</h3>
      <div className="flex flex-col items-center gap-4">
        {/* Semis */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
          <div className="bg-[#141418] rounded-xl border border-[#2A2A30] p-4 text-center">
            <p className="text-xs text-[#9CA3AF] mb-2">Semifinal 1</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3B82F6]">({finalFour[0].seed}) {finalFour[0].team}</span>
              <span className="text-xs text-[#9CA3AF]">vs</span>
              <span className="font-bold text-[#EF9F27]">({finalFour[1].seed}) {finalFour[1].team}</span>
            </div>
            <p className="text-xs text-green-400 mt-2">→ Houston advances (58.2%)</p>
          </div>
          <div className="bg-[#141418] rounded-xl border border-[#2A2A30] p-4 text-center">
            <p className="text-xs text-[#9CA3AF] mb-2">Semifinal 2</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3B82F6]">({finalFour[2].seed}) {finalFour[2].team}</span>
              <span className="text-xs text-[#9CA3AF]">vs</span>
              <span className="font-bold text-[#EF9F27]">({finalFour[3].seed}) {finalFour[3].team}</span>
            </div>
            <p className="text-xs text-green-400 mt-2">→ Auburn advances (55.8%)</p>
          </div>
        </div>
        {/* Arrow */}
        <div className="text-2xl text-[#9CA3AF]">↓</div>
        {/* Championship */}
        <div className="bg-gradient-to-r from-[#3B82F6]/10 via-[#141418] to-[#EF9F27]/10 rounded-xl border border-[#3B82F6]/30 p-6 text-center w-full max-w-md">
          <p className="text-xs text-[#EF9F27] font-semibold mb-2">🏆 National Championship</p>
          <div className="flex items-center justify-between text-lg">
            <span className="font-bold text-[#3B82F6]">(1) Houston</span>
            <span className="text-[#9CA3AF]">vs</span>
            <span className="font-bold text-[#EF9F27]">(1) Auburn</span>
          </div>
          <div className="mt-3 py-2 px-4 bg-[#3B82F6]/20 rounded-lg inline-block">
            <p className="text-sm font-bold text-[#3B82F6]">🎯 Predicted Champion: Houston Cougars</p>
            <p className="text-xs text-[#9CA3AF]">Win probability: 53.4%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sortedTeams = useMemo(() => [...TEAMS].sort((a, b) => a.seed - b.seed || a.name.localeCompare(b.name)), []);

  const handlePredict = () => {
    const a = TEAMS.find((t) => t.name === teamAName);
    const b = TEAMS.find((t) => t.name === teamBName);
    if (!a || !b || a.name === b.name) return;
    setIsLoading(true);
    setPrediction(null);
    setTimeout(() => {
      setPrediction(generatePrediction(a, b));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-10">

        {/* ─── Matchup Predictor ─── */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🎯 Matchup Predictor</h2>
          <div className="bg-[#141418] rounded-xl border border-[#2A2A30] p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#9CA3AF] mb-1">Team A</label>
                <select
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-[#2A2A30] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                >
                  <option value="">Select team...</option>
                  {sortedTeams.map((t) => (
                    <option key={t.name} value={t.name}>({t.seed}) {t.name} — {t.conference}</option>
                  ))}
                </select>
              </div>
              <span className="text-lg font-bold text-[#9CA3AF] pb-2">VS</span>
              <div className="flex-1 w-full">
                <label className="block text-xs text-[#9CA3AF] mb-1">Team B</label>
                <select
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-[#2A2A30] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B82F6] transition-colors"
                >
                  <option value="">Select team...</option>
                  {sortedTeams.map((t) => (
                    <option key={t.name} value={t.name}>({t.seed}) {t.name} — {t.conference}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handlePredict}
                disabled={!teamAName || !teamBName || teamAName === teamBName || isLoading}
                className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
              >
                {isLoading ? "Analyzing..." : "Predict 🔮"}
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="mt-6 flex items-center justify-center gap-3 text-[#9CA3AF]">
                <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                Running AI model...
              </div>
            )}

            {/* Results */}
            {prediction && !isLoading && (
              <div className="mt-6 space-y-6 animate-slide-in">
                <div className="flex items-center gap-3 flex-wrap">
                  <ConfidenceBadge level={prediction.confidence} />
                  {prediction.isUpset && <UpsetBadge />}
                </div>

                <ProbabilityBar
                  probA={prediction.winProbA}
                  probB={prediction.winProbB}
                  teamAName={prediction.teamA.name}
                  teamBName={prediction.teamB.name}
                />

                {/* Key Factors */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-[#9CA3AF]">Key Factors</h4>
                  <ul className="space-y-1">
                    {prediction.factors.map((f, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-[#3B82F6] mt-0.5">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Analysis */}
                <div className="bg-[#0A0A0C] rounded-lg p-4 border border-[#2A2A30]">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">🤖 AI Analysis</h4>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{prediction.analysis}</p>
                </div>

                {/* Historical Matchups */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-[#9CA3AF]">📜 Similar Historical Matchups</h4>
                  <div className="grid gap-2">
                    {prediction.historicalMatchups.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm bg-[#0A0A0C] rounded-lg px-3 py-2 border border-[#2A2A30]/50">
                        <span className="text-[#3B82F6] font-mono">{m.year}</span>
                        <span className="text-[#9CA3AF]">{m.round}:</span>
                        <span>{m.teamA} vs {m.teamB}</span>
                        <span className="ml-auto font-mono text-[#EF9F27]">{m.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Table */}
                <StatsTable teamA={prediction.teamA} teamB={prediction.teamB} />
              </div>
            )}
          </div>
        </section>

        {/* ─── Quick Picks ─── */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">⚡ Quick Picks — Upcoming Matchups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_PICKS.map((qp, i) => {
              const a = TEAMS.find((t) => t.name === qp.teamAName)!;
              const b = TEAMS.find((t) => t.name === qp.teamBName)!;
              return <QuickPickCard key={i} teamA={a} teamB={b} round={qp.round} />;
            })}
          </div>
        </section>

        {/* ─── Bracket View ─── */}
        <section>
          <BracketView />
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-[#9CA3AF] py-8 border-t border-[#2A2A30]">
          <p>BracketIQ — AI-Powered March Madness Predictions</p>
          <p className="mt-1">Model: BracketIQ v3.2 • Trained on 20+ years of tournament data • Updated March 30, 2026</p>
          <p className="mt-1 text-[#9CA3AF]/60">For entertainment purposes only. Past performance does not guarantee future results.</p>
        </footer>
      </main>
    </div>
  );
}
