"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { IncidentPoint, IncidentCategory } from "@/lib/dehradun-incidents";
import { CATEGORY_META } from "@/lib/dehradun-incidents";

interface Props {
  incidents: IncidentPoint[];
  selectedCategories: IncidentCategory[];
  showMarkers: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function HeatMap({
  incidents,
  selectedCategories,
  showMarkers,
  center = [30.3165, 78.0322],
  zoom = 12,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayersRef = useRef<Record<string, L.Layer>>({});
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd", attribution: "© OpenStreetMap contributors, © CARTO" }
    ).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update heat layers when incidents or selected categories change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove all existing heat layers
    Object.values(heatLayersRef.current).forEach((layer) => map.removeLayer(layer));
    heatLayersRef.current = {};

    // Group incidents by category
    const byCategory: Record<string, IncidentPoint[]> = {};
    for (const inc of incidents) {
      if (!selectedCategories.includes(inc.category)) continue;
      if (!byCategory[inc.category]) byCategory[inc.category] = [];
      byCategory[inc.category].push(inc);
    }

    // Add one heat layer per category
    for (const [cat, pts] of Object.entries(byCategory)) {
      const meta = CATEGORY_META[cat as IncidentCategory];
      const heatData = pts.map((p) => [p.lat, p.lng, p.intensity] as [number, number, number]);

      // Dynamic import leaflet.heat  
      import("leaflet.heat").then(() => {
        if (!mapRef.current) return;
        // @ts-ignore — leaflet.heat extends L namespace at runtime
        const layer = (L as any).heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 16,
          max: 1.0,
          gradient: {
            0.2: meta.gradient[0],
            0.6: meta.gradient[1],
            1.0: meta.gradient[2],
          },
        });
        layer.addTo(mapRef.current!);
        heatLayersRef.current[cat] = layer;
      });
    }
  }, [incidents, selectedCategories]);

  // Update marker layer when showMarkers changes
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (!showMarkers) return;

    for (const inc of incidents) {
      if (!selectedCategories.includes(inc.category)) continue;
      const meta = CATEGORY_META[inc.category];
      const marker = L.circleMarker([inc.lat, inc.lng], {
        radius: 6,
        color: meta.color,
        fillColor: meta.color,
        fillOpacity: 0.85,
        weight: 1.5,
      });
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:200px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="background:${meta.color}22;color:${meta.color};border:1px solid ${meta.color}55;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px">
              ${meta.label}
            </span>
            <span style="font-size:10px;color:#94a3b8">${inc.year}</span>
          </div>
          <div style="font-weight:700;font-size:12px;color:#1e293b;margin-bottom:4px">📍 ${inc.label}</div>
          <div style="font-size:10px;color:#64748b;line-height:1.5;border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px">
            <span style="font-weight:600">Source:</span> ${inc.source}
          </div>
        </div>
      `);
      group.addLayer(marker);
    }
  }, [incidents, selectedCategories, showMarkers]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}
