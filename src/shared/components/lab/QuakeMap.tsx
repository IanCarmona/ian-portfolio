"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

import type { Quake } from "@/lab/data/usgs";

function magColor(mag: number) {
  if (mag >= 5) return "#f87171";
  if (mag >= 3) return "#fbbf24";
  return "#22d3ee";
}

/**
 * Real interactive world map (Leaflet + CARTO dark tiles) plotting live USGS
 * earthquakes as circle markers sized/colored by magnitude. Client-only:
 * Leaflet is imported dynamically inside an effect to avoid SSR issues.
 */
export function QuakeMap({ quakes }: { quakes: Quake[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const quakesRef = useRef<Quake[]>(quakes);
  quakesRef.current = quakes;

  const draw = () => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    for (const q of quakesRef.current) {
      const color = magColor(q.mag);
      const marker = L.circleMarker([q.lat, q.lon], {
        radius: Math.max(3, q.mag * 2),
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: 0.45,
      });
      marker.bindPopup(
        `<strong>M ${q.mag.toFixed(1)}</strong><br/>${q.place}`,
      );
      marker.addTo(layer);
    }
  };

  // Initialize the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      // Handle both ESM default and namespace interop across bundlers.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = ((mod as any).default ?? mod) as typeof import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        worldCopyJump: true,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      draw();
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers whenever the data changes.
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quakes]);

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full overflow-hidden rounded-xl border border-border"
      style={{ background: "#0a0c11" }}
    />
  );
}
