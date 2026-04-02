import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth-user";
import { classifyZone, scoreToTTLHours } from "@/lib/threat-engine";

const bodySchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const CACHE_RADIUS_DEG = 0.015; // ~1.5 km

export async function POST(req: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  let json: unknown;
  try { json = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { lat, lng } = parsed.data;
  const now = new Date();

  // 1. Lazy cleanup — remove expired threats
  try {
    await (prisma.threatZone as any).deleteMany({ where: { expiresAt: { lte: now } } });
  } catch (_) {}

  // 2. Reverse geocode to get city/area name
  let cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  let fullLocation = cityName;
  let stateName = "";
  let countryName = "India";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "User-Agent": "Suraksha-Safety-App/1.0" }, signal: controller.signal },
    );
    clearTimeout(timeoutId);
    
    if (geoRes.ok) {
      const geoData = await geoRes.json() as any;
      fullLocation = geoData.display_name?.split(",").slice(0, 3).join(", ") ?? cityName;
      cityName =
        geoData.address?.city ??
        geoData.address?.town ??
        geoData.address?.village ??
        geoData.address?.county ??
        fullLocation.split(",")[0].trim();
      stateName = geoData.address?.state ?? "";
      countryName = geoData.address?.country ?? "India";
    }
  } catch {
    console.warn("[news-threat] Nominatim failed, using coordinates");
  }
  
  if (cityName.includes(",") && cityName.match(/\d/)) {
     cityName = "India"; 
  }

  // 3. Fetch GDELT news — last 2 days, focused on major crimes
  let rawArticles: { title: string; url?: string; seendate?: string }[] = [];
  const crimeKeywords = "murder OR robbery OR rape OR kidnapping OR shooting OR stabbing OR bombing OR terrorist OR riot OR arson OR gang OR massacre OR homicide OR assault OR dacoity OR loot";
  
  // Try city-specific search first
  const searchQueries = [
    `"${cityName}" (${crimeKeywords})`,
    ...(stateName ? [`"${stateName}" (${crimeKeywords})`] : []),
    `"${countryName}" (${crimeKeywords})`,
  ];

  for (const queryStr of searchQueries) {
    if (rawArticles.length >= 10) break;
    
    try {
      const gdeltQuery = encodeURIComponent(queryStr);
      // timespan: 48 hours = last 2 days
      const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${gdeltQuery}&mode=artlist&format=json&maxrecords=30&timespan=48h&sort=datedesc`;
      
      console.log(`[news-threat] Fetching GDELT: ${queryStr.slice(0, 80)}...`);
      
      const gdeltRes = await fetch(gdeltUrl, {
        cache: "no-store",
        headers: { "User-Agent": "Suraksha-Safety-App/1.0" },
      });
      
      if (gdeltRes.ok) {
        const gdeltData = await gdeltRes.json();
        const articles = gdeltData.articles || [];
        for (const a of articles) {
          // Avoid duplicates by title
          if (!rawArticles.some(existing => existing.title === a.title)) {
            rawArticles.push({
              title: a.title,
              url: a.url,
              seendate: a.seendate,
            });
          }
        }
      }
    } catch (err) {
      console.warn("[news-threat] GDELT fetch failed for query:", err);
    }
  }

  console.log(`[news-threat] Total unique articles found: ${rawArticles.length}`);

  if (rawArticles.length === 0) {
    return NextResponse.json({
      ok: true,
      message: `No crime news found near ${cityName} in the last 2 days.`,
      created: 0,
      threats: [],
    });
  }

  // Prepare article text for OpenAI
  const rawText = rawArticles
    .slice(0, 30)
    .map((a, i) => `${i + 1}. ${a.title}${a.seendate ? ` [${a.seendate}]` : ""}`)
    .join("\n");

  // 4. OpenAI Analysis — extract only REAL, MAJOR crimes from the last 2 days
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    console.warn("[news-threat] OpenAI API key missing.");
    return NextResponse.json({ error: "OpenAI API key missing" }, { status: 500 });
  }

  const prompt = `You are a crime intelligence analyst for the SURAKSHA tourist safety platform.

TASK: Analyze the following real news headlines from the last 2 days and extract ONLY REAL, SIGNIFICANT CRIMES that happened near or around "${cityName}, ${stateName}, ${countryName}" (coordinates: ${lat}, ${lng}).

NEWS HEADLINES:
${rawText}

RULES:
1. Only include REAL crimes from the headlines above — DO NOT invent or fabricate any incidents
2. Focus on BIG/SERIOUS crimes only: murder, robbery, rape, kidnapping, terrorist attack, shooting, bombing, riot, dacoity, gang violence, arson, massacre
3. Skip minor incidents like petty theft, traffic violations, verbal disputes
4. Each crime must have actually been reported in the headlines above
5. Extract the actual location mentioned in the headline if available
6. Estimate a realistic distance_km from the user's coordinates (${lat}, ${lng})
7. Estimate realistic lat/lng coordinates for where the crime occurred based on the location mentioned
8. If NO significant crimes are found in the headlines, return an empty array []

Respond ONLY in JSON format:
[
  {
    "threat": "Type of crime (e.g. Murder, Armed Robbery, Kidnapping, Riot)",
    "severity": "high" | "medium",
    "reason": "Brief factual summary of the incident from the headline",
    "distance_km": <estimated distance from user in km>,
    "newsSource": "Exact or close headline text from the data above",
    "estimatedLat": <estimated latitude of incident>,
    "estimatedLng": <estimated longitude of incident>
  }
]

Return an empty array [] if there are no significant/major crimes in the headlines.`;

  let analyzedThreats: any[] = [];
  try {
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content;
      // Strip markdown fences if present
      const jsonStr = content?.replace(/```json/g, "").replace(/```/g, "").trim() || "[]";
      analyzedThreats = JSON.parse(jsonStr);
      console.log(`[news-threat] OpenAI returned ${analyzedThreats.length} threat(s)`);
    } else {
      const errText = await aiRes.text();
      console.warn("[news-threat] OpenAI API returned status:", aiRes.status, errText);
    }
  } catch (e) {
    console.warn("[news-threat] OpenAI pipeline failed", e);
  }

  if (!Array.isArray(analyzedThreats) || analyzedThreats.length === 0) {
    return NextResponse.json({
      ok: true,
      created: 0,
      threats: [],
      message: `No major crimes detected near ${cityName} in the last 2 days.`,
    });
  }

  // 5. Create PENDING threats for admin approval
  const created: any[] = [];

  for (const t of analyzedThreats) {
    // Use estimated coordinates from OpenAI if available, otherwise user location
    const threatLat = typeof t.estimatedLat === "number" && !isNaN(t.estimatedLat) ? t.estimatedLat : lat;
    const threatLng = typeof t.estimatedLng === "number" && !isNaN(t.estimatedLng) ? t.estimatedLng : lng;

    // Check for duplicate threats (same area + same news source)
    const existing = await (prisma.threatZone as any).findFirst({
      where: {
        lat: { gte: threatLat - CACHE_RADIUS_DEG, lte: threatLat + CACHE_RADIUS_DEG },
        lng: { gte: threatLng - CACHE_RADIUS_DEG, lte: threatLng + CACHE_RADIUS_DEG },
        status: { in: ["PENDING", "VERIFIED"] },
        newsSource: t.newsSource || t.threat, 
      },
    });
    if (existing) {
      console.log(`[news-threat] Skipping duplicate: ${t.threat}`);
      continue;
    }

    // Map severity to score
    let threatScore = 50;
    if (t.severity?.toLowerCase() === "high") threatScore = 85;
    if (t.severity?.toLowerCase() === "medium") threatScore = 65;
    if (t.severity?.toLowerCase() === "low") threatScore = 45;

    const zone = classifyZone(threatScore);
    const ttlHours = scoreToTTLHours(threatScore);
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    const distanceInfo = t.distance_km ? ` (~${t.distance_km} km away)` : "";
    const summary = `🚨 ${t.threat}: ${t.reason}${distanceInfo}. Severity: ${t.severity?.toUpperCase()}.`;

    const threatLocation = t.distance_km && t.distance_km > 5
      ? `${fullLocation} (nearby area)`
      : fullLocation;

    await (prisma.threatZone as any).create({
      data: {
        lat: threatLat,
        lng: threatLng,
        location: threatLocation,
        score: threatScore,
        zone,
        summary,
        status: "PENDING",
        reportedByUserId: session.sub,
        newsSource: t.newsSource || t.threat,
        expiresAt,
      },
    });

    created.push({
      location: threatLocation,
      zone,
      threat: t.threat,
      severity: t.severity,
      newsSource: t.newsSource,
    });
  }

  console.log(`[news-threat] Created ${created.length} new PENDING threat(s) for admin review`);

  return NextResponse.json({
    ok: true,
    city: cityName,
    created: created.length,
    threats: created,
    articlesScanned: rawArticles.length,
    message: created.length > 0
      ? `${created.length} real crime(s) from the last 2 days sent to admin for verification.`
      : "No new threats — duplicates were skipped.",
  });
}
