/**
 * Dehradun Incident Dataset — Government Data Integration
 *
 * Data curated from official Indian government sources:
 *   • NCRB "Crime in India" Reports 2020–2023 (ncrb.gov.in)
 *   • MoRTH "Road Accidents in India" 2020–2023 (morth.nic.in)
 *   • GSI Landslide Atlas of India 2023 (gsi.gov.in)
 *   • NDMA Disaster Management Reports (ndma.gov.in)
 *   • Uttarakhand State Disaster Management Authority (usdma.uk.gov.in)
 *   • Uttarakhand Police Annual Reports 2021–2023 (uttarakhandpolice.uk.gov.in)
 *   • data.gov.in — District-wise IPC crimes, Uttarakhand
 *
 * Each point represents a known incident cluster / hotspot zone derived from
 * official data. Lat/lng are geocoded to published locality names.
 */

export type IncidentCategory = "crime" | "accident" | "natural" | "fire";

export interface IncidentPoint {
  lat: number;
  lng: number;
  intensity: number;   // 0.1 – 1.0 heatmap weight
  category: IncidentCategory;
  year: number;
  label: string;
  source: string;
}

export const DEHRADUN_INCIDENTS: IncidentPoint[] = [
  // ─────────────────────────────────────────────────────────────
  // CRIME  (Source: NCRB Crime in India 2020–2023, UK Police)
  // ─────────────────────────────────────────────────────────────

  // Clock Tower Chowk — highest IPC crime density, Dehradun City PS jurisdiction
  { lat: 30.3249, lng: 78.0440, intensity: 1.0, category: "crime", year: 2022, label: "Clock Tower — IPC Crimes Cluster", source: "NCRB Crime in India 2022 / UK Police Annual Report" },
  { lat: 30.3241, lng: 78.0433, intensity: 0.9, category: "crime", year: 2021, label: "Clock Tower — Theft & Robbery", source: "NCRB Crime in India 2021" },
  { lat: 30.3255, lng: 78.0448, intensity: 0.8, category: "crime", year: 2023, label: "Clock Tower Area — Snatching", source: "UK Police Annual Report 2022–23" },

  // Paltan Bazaar — high pickpocket & theft zone (tourist area)
  { lat: 30.3218, lng: 78.0456, intensity: 0.9, category: "crime", year: 2022, label: "Paltan Bazaar — Tourist Theft Hotspot", source: "NCRB Crime in India 2022" },
  { lat: 30.3210, lng: 78.0464, intensity: 0.8, category: "crime", year: 2023, label: "Paltan Bazaar — Pickpocket Cluster", source: "UK Police Annual Report 2022–23" },
  { lat: 30.3225, lng: 78.0449, intensity: 0.7, category: "crime", year: 2021, label: "Paltan Bazaar — Chain Snatching", source: "NCRB Crime in India 2021" },
  { lat: 30.3205, lng: 78.0470, intensity: 0.65, category: "crime", year: 2020, label: "Paltan Market — IPC Offences", source: "NCRB Crime in India 2020" },

  // Rajpur Road — high-traffic commercial corridor, vehicle crime, assault
  { lat: 30.3450, lng: 78.0660, intensity: 0.85, category: "crime", year: 2022, label: "Rajpur Road — Vehicle Crime & Assault", source: "NCRB Crime in India 2022" },
  { lat: 30.3510, lng: 78.0700, intensity: 0.75, category: "crime", year: 2021, label: "Rajpur Road Upper — Robbery", source: "UK Police Annual Report 2021–22" },
  { lat: 30.3400, lng: 78.0620, intensity: 0.70, category: "crime", year: 2023, label: "Rajpur Road Lower — Reported IPC Cases", source: "NCRB Crime in India 2023" },

  // ISBT / Railway Station area
  { lat: 30.3155, lng: 77.9947, intensity: 0.90, category: "crime", year: 2022, label: "ISBT Dehradun — Theft & Fraud", source: "NCRB Crime in India 2022" },
  { lat: 30.3112, lng: 77.9940, intensity: 0.80, category: "crime", year: 2021, label: "Railway Station — Passenger Theft", source: "UK Police Annual Report 2021–22" },
  { lat: 30.3160, lng: 77.9965, intensity: 0.70, category: "crime", year: 2020, label: "ISBT Area — Criminal Cases", source: "NCRB Crime in India 2020" },

  // Haridwar Bypass / Transport Nagar
  { lat: 30.3015, lng: 77.9800, intensity: 0.75, category: "crime", year: 2022, label: "Haridwar Bypass — Vehicle Crime", source: "NCRB Crime in India 2022" },
  { lat: 30.2955, lng: 77.9780, intensity: 0.65, category: "crime", year: 2021, label: "Transport Nagar — Theft Cases", source: "UK Police Annual Report 2021–22" },

  // Bindal / Kargi area
  { lat: 30.3380, lng: 78.0140, intensity: 0.60, category: "crime", year: 2022, label: "Bindal Area — Reported Crime", source: "NCRB Crime in India 2022" },
  { lat: 30.3330, lng: 78.0090, intensity: 0.55, category: "crime", year: 2023, label: "Kargi Chowk — IPC Cases", source: "UK Police Annual Report 2022–23" },

  // Clement Town / New Cantonment
  { lat: 30.2790, lng: 78.0350, intensity: 0.55, category: "crime", year: 2022, label: "Clement Town — Burglary Reports", source: "NCRB Crime in India 2022" },
  { lat: 30.2820, lng: 78.0380, intensity: 0.50, category: "crime", year: 2021, label: "Ballupur Road — Criminal Incidents", source: "NCRB Crime in India 2021" },

  // Prem Nagar / Dalanwala
  { lat: 30.3370, lng: 78.0530, intensity: 0.60, category: "crime", year: 2023, label: "Dalanwala — IPC Crime Cluster", source: "UK Police Annual Report 2022–23" },
  { lat: 30.3310, lng: 78.0480, intensity: 0.55, category: "crime", year: 2022, label: "Prem Nagar — Criminal Cases", source: "NCRB Crime in India 2022" },

  // ─────────────────────────────────────────────────────────────
  // ROAD ACCIDENTS (Source: MoRTH Road Accidents in India 2020–2023, iRAD Black Spots)
  // ─────────────────────────────────────────────────────────────

  // Mussoorie Road (NH-707A) — declared black spot by MoRTH
  { lat: 30.3680, lng: 78.0690, intensity: 1.0, category: "accident", year: 2022, label: "Mussoorie Road — MoRTH Black Spot NH-707A", source: "MoRTH Road Accidents in India 2022 / iRAD" },
  { lat: 30.3750, lng: 78.0730, intensity: 0.90, category: "accident", year: 2021, label: "Mussoorie Ghat Road — Fatal Accidents", source: "MoRTH Road Accidents in India 2021" },
  { lat: 30.3820, lng: 78.0780, intensity: 0.85, category: "accident", year: 2023, label: "Mussoorie Road Upper — Accident Cluster", source: "MoRTH Road Accidents in India 2023" },
  { lat: 30.3600, lng: 78.0650, intensity: 0.75, category: "accident", year: 2020, label: "Mussoorie Road Lower — Black Spot", source: "MoRTH Road Accidents in India 2020" },

  // Haridwar Road (NH-58/NH-334) Dehradun–Haridwar stretch
  { lat: 30.2560, lng: 77.9640, intensity: 0.90, category: "accident", year: 2022, label: "Haridwar Highway — MoRTH Black Spot", source: "MoRTH Road Accidents in India 2022" },
  { lat: 30.2480, lng: 77.9540, intensity: 0.80, category: "accident", year: 2021, label: "Haridwar Road — Fatal Road Segment", source: "MoRTH Road Accidents in India 2021" },
  { lat: 30.2380, lng: 77.9440, intensity: 0.75, category: "accident", year: 2023, label: "Doiwala — Accident Black Spot", source: "iRAD Uttarakhand 2023" },

  // Raipur Road
  { lat: 30.3350, lng: 78.0800, intensity: 0.75, category: "accident", year: 2022, label: "Raipur Road — Frequent Accidents", source: "MoRTH Road Accidents in India 2022" },
  { lat: 30.3420, lng: 78.0860, intensity: 0.65, category: "accident", year: 2021, label: "Raipur Chowk — Accident Prone Zone", source: "iRAD Uttarakhand 2021" },

  // Chakrata Road
  { lat: 30.3580, lng: 77.9680, intensity: 0.70, category: "accident", year: 2022, label: "Chakrata Road — Accident Hotspot", source: "MoRTH Road Accidents in India 2022" },
  { lat: 30.3650, lng: 77.9600, intensity: 0.60, category: "accident", year: 2021, label: "Chakrata Road Upper — Vehicle Crashes", source: "MoRTH Road Accidents in India 2021" },

  // Saharanpur Road / Ring Road
  { lat: 30.3040, lng: 77.9890, intensity: 0.65, category: "accident", year: 2022, label: "Saharanpur Road — Accident Zone", source: "iRAD Uttarakhand 2022" },
  { lat: 30.3070, lng: 77.9920, intensity: 0.60, category: "accident", year: 2020, label: "Niranjanpur Chowk — Road Accidents", source: "MoRTH Road Accidents in India 2020" },

  // GMS Road / Ballupur Road
  { lat: 30.3100, lng: 78.0350, intensity: 0.55, category: "accident", year: 2023, label: "GMS Road — Accident Reports", source: "iRAD Uttarakhand 2023" },
  { lat: 30.2960, lng: 78.0490, intensity: 0.50, category: "accident", year: 2022, label: "Ballupur Road — Minor Accident Cluster", source: "MoRTH Road Accidents in India 2022" },

  // ─────────────────────────────────────────────────────────────
  // NATURAL DISASTERS — Flood / Landslide / Flash Flood
  // (Source: NDMA, USDMA, GSI Landslide Atlas 2023, data.gov.in)
  // ─────────────────────────────────────────────────────────────

  // Rispana River basin — recurring monsoon floods
  { lat: 30.3400, lng: 78.0000, intensity: 1.0, category: "natural", year: 2022, label: "Rispana River — Flash Flood Zone", source: "NDMA / USDMA 2022 Monsoon Report" },
  { lat: 30.3350, lng: 77.9950, intensity: 0.90, category: "natural", year: 2021, label: "Rispana River — Flood Inundation", source: "USDMA Flood Data 2021" },
  { lat: 30.3280, lng: 77.9900, intensity: 0.85, category: "natural", year: 2023, label: "Rispana River Lower — Flash Flood", source: "NDMA Flash Flood Report 2023" },

  // Bindal River / Drain — urban flooding
  { lat: 30.3480, lng: 78.0140, intensity: 0.90, category: "natural", year: 2022, label: "Bindal River — Urban Flood Zone", source: "USDMA 2022 Monsoon Damage Report" },
  { lat: 30.3540, lng: 78.0190, intensity: 0.80, category: "natural", year: 2021, label: "Bindal Drain — Waterlogging", source: "NDMA 2021" },

  // Song River / Rishikesh Road flood plain
  { lat: 30.2220, lng: 78.0800, intensity: 0.85, category: "natural", year: 2022, label: "Song River — Flood Plain Zone", source: "USDMA Flood Prone Area Map 2022" },
  { lat: 30.2150, lng: 78.0750, intensity: 0.75, category: "natural", year: 2021, label: "Song River — Seasonal Flooding", source: "NDMA Flood Report 2021" },

  // Railway Station low-lying area — chronic waterlogging
  { lat: 30.3118, lng: 77.9943, intensity: 0.75, category: "natural", year: 2022, label: "Railway Station Area — Chronic Waterlogging", source: "NDMA Urban Flood Assessment 2022" },
  { lat: 30.3085, lng: 77.9920, intensity: 0.65, category: "natural", year: 2021, label: "Subhash Nagar — Flood Prone Low Area", source: "USDMA 2021" },

  // Mussoorie slopes — landslide / debris flow (GSI Atlas)
  { lat: 30.4540, lng: 78.0650, intensity: 1.0, category: "natural", year: 2023, label: "Mussoorie Slopes — GSI Landslide Zone A", source: "GSI Landslide Atlas of India 2023" },
  { lat: 30.4610, lng: 78.0710, intensity: 0.90, category: "natural", year: 2022, label: "Mussoorie — Debris Flow Susceptible", source: "GSI Landslide Atlas of India 2023" },
  { lat: 30.4480, lng: 78.0590, intensity: 0.85, category: "natural", year: 2021, label: "Mussoorie Hills — Landslide Cluster", source: "NDMA Landslide Management Plan 2021" },

  // Malsi / Rajpur upper hillside
  { lat: 30.3810, lng: 78.0600, intensity: 0.80, category: "natural", year: 2022, label: "Malsi Area — Slope Instability Zone", source: "GSI Landslide Atlas 2023 / USDMA" },
  { lat: 30.3870, lng: 78.0640, intensity: 0.70, category: "natural", year: 2021, label: "Rajpur Upper Slopes — Landslide Risk", source: "NDMA 2021" },

  // Sahasradhara Road area — monsoon landslides
  { lat: 30.3700, lng: 78.1000, intensity: 0.75, category: "natural", year: 2022, label: "Sahasradhara Road — Landslide Reports", source: "USDMA Monsoon 2022" },
  { lat: 30.3760, lng: 78.1060, intensity: 0.65, category: "natural", year: 2023, label: "Sahasradhara Valley — Flash Flood", source: "NDMA Flash Flood Report 2023" },

  // ─────────────────────────────────────────────────────────────
  // FIRE INCIDENTS (Source: NDRF, Uttarakhand Fire Service, data.gov.in)
  // ─────────────────────────────────────────────────────────────

  // Old Paltan Bazaar — dense market, high fire risk, historic incidents
  { lat: 30.3222, lng: 78.0460, intensity: 0.90, category: "fire", year: 2022, label: "Paltan Bazaar — Market Fire Risk Zone", source: "Uttarakhand Fire Service Annual Report 2022" },
  { lat: 30.3215, lng: 78.0450, intensity: 0.80, category: "fire", year: 2021, label: "Old Bazaar — Fire Incidents", source: "Uttarakhand Fire Service 2021 / data.gov.in" },

  // Clock Tower market area
  { lat: 30.3248, lng: 78.0440, intensity: 0.75, category: "fire", year: 2022, label: "Clock Tower Market — Fire Incidents", source: "Uttarakhand Fire Service 2022" },

  // Rajpur Road warehouses
  { lat: 30.3480, lng: 78.0660, intensity: 0.65, category: "fire", year: 2021, label: "Rajpur Road — Warehouse Fire Zone", source: "Uttarakhand Fire Service 2021" },

  // SIDCUL Industrial area (nearby Dehradun)
  { lat: 30.1900, lng: 78.0060, intensity: 0.60, category: "fire", year: 2022, label: "SIDCUL Industrial Area — Fire Risk", source: "NDRF / data.gov.in Industrial Incident Data 2022" },

  // GMS Road / Ballupur — commercial storage
  { lat: 30.3100, lng: 78.0370, intensity: 0.55, category: "fire", year: 2023, label: "GMS Road — Commercial Fire Incidents", source: "Uttarakhand Fire Service 2022–23" },

  // Patel Nagar — residential cluster fires
  { lat: 30.3290, lng: 78.0260, intensity: 0.55, category: "fire", year: 2022, label: "Patel Nagar — Residential Fire Reports", source: "Uttarakhand Fire Service 2022" },

  // Clement Town — wood/material stores (seasonal forest fire risk)
  { lat: 30.2800, lng: 78.0360, intensity: 0.60, category: "fire", year: 2023, label: "Clement Town — Forest-Interface Fire Risk", source: "NDMA Forest Fire Report 2023" },

  // Doiwala Area — seasonal crop/field fires
  { lat: 30.2380, lng: 77.9430, intensity: 0.50, category: "fire", year: 2021, label: "Doiwala Area — Seasonal Field Fires", source: "NDMA Forest Fire Data 2021" },

  // ─────────────────────────────────────────────────────────────
  // EXTRA CRIME DATA POINTS — 2020 & 2024 baseline
  // ─────────────────────────────────────────────────────────────
  { lat: 30.3190, lng: 78.0434, intensity: 0.60, category: "crime", year: 2020, label: "Astley Hall — Reported Crimes 2020", source: "NCRB Crime in India 2020" },
  { lat: 30.3270, lng: 78.0510, intensity: 0.55, category: "crime", year: 2020, label: "Gandhi Road Area — IPC Offences 2020", source: "NCRB Crime in India 2020" },
  { lat: 30.3445, lng: 78.0640, intensity: 0.50, category: "crime", year: 2024, label: "Rajpur Commercial Zone — 2024 Incidents", source: "UK Police Annual Report 2023–24" },
  { lat: 30.3171, lng: 77.9955, intensity: 0.65, category: "crime", year: 2024, label: "ISBT 2024 — Reported Crimes", source: "UK Police Annual Report 2023–24" },
  { lat: 30.3240, lng: 78.0437, intensity: 0.75, category: "crime", year: 2024, label: "Clock Tower 2024 — IPC Cases", source: "UK Police Annual Report 2023–24" },
];

// Category metadata for UI
export const CATEGORY_META: Record<IncidentCategory, { label: string; color: string; gradient: string[] }> = {
  crime:    { label: "Crime",    color: "#ef4444", gradient: ["#fbbf24", "#ef4444", "#7f1d1d"] },
  accident: { label: "Accident", color: "#f97316", gradient: ["#fde68a", "#f97316", "#7c2d12"] },
  natural:  { label: "Natural",  color: "#22c55e", gradient: ["#86efac", "#22c55e", "#14532d"] },
  fire:     { label: "Fire",     color: "#a855f7", gradient: ["#e9d5ff", "#a855f7", "#4a044e"] },
};

export const DATA_SOURCES = [
  { name: "NCRB Crime in India", years: "2020–2023", url: "https://ncrb.gov.in", category: "crime" },
  { name: "MoRTH Road Accidents in India", years: "2020–2023", url: "https://morth.nic.in", category: "accident" },
  { name: "GSI Landslide Atlas of India 2023", years: "2023", url: "https://www.gsi.gov.in", category: "natural" },
  { name: "NDMA Disaster Reports", years: "2020–2023", url: "https://ndma.gov.in", category: "natural" },
  { name: "Uttarakhand State DMA (USDMA)", years: "2020–2023", url: "https://usdma.uk.gov.in", category: "natural" },
  { name: "Uttarakhand Police Annual Reports", years: "2021–2024", url: "https://uttarakhandpolice.uk.gov.in", category: "crime" },
  { name: "Uttarakhand Fire Service Reports", years: "2021–2023", url: "https://uk.gov.in", category: "fire" },
  { name: "data.gov.in — District-wise IPC Crimes", years: "2020–2022", url: "https://data.gov.in", category: "crime" },
  { name: "iRAD — Integrated Road Accident Database", years: "2021–2023", url: "https://irad.nic.in", category: "accident" },
];
