"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, useMemo } from "react";
import { MapPin, ArrowLeft, ExternalLink, Info } from "lucide-react";
import {
  DEHRADUN_INCIDENTS,
  CATEGORY_META,
  DATA_SOURCES,
  type IncidentCategory,
} from "@/lib/dehradun-incidents";

const HeatMap = dynamic(() => import("@/components/maps/HeatMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b0f19]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading heatmap…</p>
      </div>
    </div>
  ),
});

const ALL_YEARS = [2020, 2021, 2022, 2023, 2024] as const;
const ALL_CATEGORIES: IncidentCategory[] = ["crime", "accident", "natural", "fire"];

export default function HeatMapPage() {
  const [selectedCategories, setSelectedCategories] = useState<IncidentCategory[]>([...ALL_CATEGORIES]);
  const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
  const [showMarkers, setShowMarkers] = useState(true);
  const [showSources, setShowSources] = useState(false);

  const filtered = useMemo(() => {
    return DEHRADUN_INCIDENTS.filter((inc) => {
      if (!selectedCategories.includes(inc.category)) return false;
      if (selectedYear !== "all" && inc.year !== selectedYear) return false;
      return true;
    });
  }, [selectedCategories, selectedYear]);

  // Stats
  const totalIncidents = filtered.length;

  const hottestZone = useMemo(() => {
    if (filtered.length === 0) return "—";
    const maxInc = filtered.reduce((a, b) => (b.intensity > a.intensity ? b : a));
    return maxInc.label.split("—")[0].trim();
  }, [filtered]);

  const peakYear = useMemo(() => {
    if (filtered.length === 0) return "—";
    const counts: Record<number, number> = {};
    for (const inc of filtered) counts[inc.year] = (counts[inc.year] ?? 0) + 1;
    return String(Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—");
  }, [filtered]);

  const riskIndex = useMemo(() => {
    if (filtered.length === 0) return "0.0";
    const avgIntensity = filtered.reduce((s, i) => s + i.intensity, 0) / filtered.length;
    return (avgIntensity * 10).toFixed(1);
  }, [filtered]);

  const toggleCategory = (cat: IncidentCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#2A303C] bg-[#0B0F19]/95 backdrop-blur px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/geo"
            className="flex items-center gap-1.5 rounded-lg border border-[#2A303C] px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:border-slate-500 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Geo
          </Link>
          <div className="h-5 w-px bg-[#2A303C]" />
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-400" />
            <h1 className="font-bold text-white">
              Dehradun{" "}
              <span className="text-slate-400">Danger Heatmap</span>
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowSources((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-[#2A303C] px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <Info className="h-3.5 w-3.5" />
          Data Sources
        </button>
      </header>

      <main className="flex flex-col gap-0">
        {/* Filter Bar */}
        <div className="border-b border-[#2A303C] bg-[#131B2B] px-4 py-3 sm:px-6 flex flex-wrap items-center gap-4">
          {/* Year */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="rounded-lg border border-[#2A303C] bg-[#0B0F19] px-3 py-1.5 text-sm text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">All (2020–2024)</option>
              {ALL_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Category toggles */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
            <div className="flex gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition border"
                    style={{
                      background: active ? meta.color + "22" : "transparent",
                      borderColor: active ? meta.color + "88" : "#2A303C",
                      color: active ? meta.color : "#64748b",
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full inline-block"
                      style={{ background: active ? meta.color : "#374151" }}
                    />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Show markers toggle */}
          <label className="ml-auto flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-slate-400">Show markers</span>
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </label>
        </div>

        {/* Stats Bar */}
        <div className="border-b border-[#2A303C] bg-[#0D1421] px-4 py-3 sm:px-6 flex flex-wrap gap-6">
          {[
            { label: "Total Incidents", value: totalIncidents, sub: selectedYear === "all" ? "5-year period" : String(selectedYear) },
            { label: "Hottest zone", value: hottestZone, sub: "highest density", small: true },
            { label: "Peak year", value: peakYear, sub: "most incidents" },
            { label: "Risk index", value: `${riskIndex}/10`, sub: "composite score" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#2A303C] bg-[#131B2B] px-5 py-3 min-w-[130px]">
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{stat.label}</p>
              <p className={`font-bold text-white mt-0.5 ${stat.small ? "text-sm" : "text-xl"}`}>{stat.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</p>
            </div>
          ))}

          {/* Category legend dots */}
          <div className="ml-auto flex items-center gap-4 self-center">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = selectedCategories.includes(cat);
              return (
                <div key={cat} className="flex items-center gap-1.5 text-xs" style={{ opacity: active ? 1 : 0.3 }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                  <span className="text-slate-300">{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="relative" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
          <HeatMap
            incidents={filtered}
            selectedCategories={selectedCategories}
            showMarkers={showMarkers}
            center={[30.3165, 78.0322]}
            zoom={12}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-6 right-6 z-[1000] rounded-xl border border-[#2A303C] bg-[#0B0F19]/90 backdrop-blur p-4 text-xs text-white shadow-2xl">
            <p className="font-bold text-slate-300 mb-2">Incident density</p>
            <div className="flex items-center gap-1 mb-1">
              <div
                className="h-3 w-28 rounded"
                style={{
                  background: "linear-gradient(to right, #3b82f688, #fbbf24, #ef4444)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <p className="mt-2 text-[10px] text-slate-600">Radius = 25m intensity zone</p>
          </div>

          {filtered.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
              <div className="rounded-2xl border border-[#2A303C] bg-[#0B0F19]/90 backdrop-blur p-8 text-center">
                <p className="text-lg font-bold text-slate-300">No data for selected filters</p>
                <p className="text-sm text-slate-500 mt-1">Try selecting a different year or category.</p>
              </div>
            </div>
          )}
        </div>

        {/* Data Sources Panel */}
        {showSources && (
          <div className="border-t border-[#2A303C] bg-[#0D1421] px-6 py-6">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              Official Government Data Sources
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DATA_SOURCES.map((src) => {
                const meta = CATEGORY_META[src.category as IncidentCategory];
                return (
                  <a
                    key={src.name}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-[#2A303C] bg-[#131B2B] p-4 hover:border-slate-600 transition group"
                  >
                    <span
                      className="mt-0.5 h-2 w-2 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition truncate">{src.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{src.years} · {meta.label}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 transition shrink-0 mt-0.5" />
                  </a>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-slate-600 max-w-3xl leading-relaxed">
              <span className="text-slate-500 font-semibold">Disclaimer:</span> These incident points are geo-coded from official government reports and publications. 
              Exact coordinates are approximated to known locality boundaries cited in these reports. 
              Data represents known incident clusters as reported by the respective government authorities.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
