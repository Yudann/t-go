// src/components/section/map/MapContainer.tsx

import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

// Center around Tangerang area (based on your route data)
const DEFAULT_CENTER = {
  lat: -6.1953,
  lng: 106.635,
};

const DEFAULT_ZOOM = 12;

import { Route, RouteStop } from "@/types/types";


interface MapContainerProps {
  routes: Route[];
  routeStops: RouteStop[];
  selectedRoute: Route | null;
  onRouteSelect: (route: Route) => void;
}

export default function MapContainer({
  routes,
  routeStops,
  selectedRoute,
  onRouteSelect,
}: MapContainerProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [L, setL] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        if (typeof window === "undefined") return;

        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const leaflet = await import("leaflet");

        delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        setL(leaflet);
        setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Leaflet:", error);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || map) return;

    try {
      const newMap = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(newMap);

      L.control.zoom({ position: "bottomright" }).addTo(newMap);

      setMap(newMap);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map) {
        try {
          map.remove();
        } catch (error) {
          console.error("Error removing map:", error);
        }
      }
    };
  }, [L, map]);

  useEffect(() => {
    if (!map || !L || routes.length === 0) return;

    // Clear existing markers and polylines
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (error) {
        console.error("Error removing marker:", error);
      }
    });
    markersRef.current = [];

    polylinesRef.current.forEach((polyline) => {
      try {
        polyline.remove();
      } catch (error) {
        console.error("Error removing polyline:", error);
      }
    });
    polylinesRef.current = [];

    // Create custom car icon for route markers
    const createCarIcon = (color: string) => {
      return L.divIcon({
        className: "custom-car-marker",
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              background: ${color || '#7B2CBF'};
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: transform 0.2s ease;
              color: #ffffff;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    };

    // Create stop marker icon with MapPin icon from lucide-react
    const createStopIcon = (color: string, isStartEnd: boolean = false) => {
      if (isStartEnd) {
        // End point marker with flag icon
        return L.divIcon({
          className: "custom-stop-marker",
          html: `
            <div style="
              background: ${color || '#7B2CBF'};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" x2="4" y1="22" y2="15"/>
              </svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
      }
      // Regular stop marker with circle-dot icon
      return L.divIcon({
        className: "custom-stop-marker",
        html: `
          <div style="
            background: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid ${color};
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="
              background: ${color || '#7B2CBF'};
              width: 8px;
              height: 8px;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
    };

    // Draw routes
    routes.forEach((route) => {
      const stops = routeStops
        .filter((stop) => stop.route_id === route.id)
        .sort((a, b) => a.stop_order - b.stop_order);

      if (stops.length > 0) {
        // Draw polyline for route
        const coordinates = stops.map((stop) => [
          stop.latitude,
          stop.longitude,
        ]);

        const polyline = L.polyline(coordinates, {
          color: route.color || '#7B2CBF',
          weight: 4,
          opacity: 0.7,
          smoothFactor: 1,
        })
          .addTo(map)
          .on("click", () => {
            onRouteSelect(route);
          });

        polylinesRef.current.push(polyline);

        // Add markers for all stops
        stops.forEach((stop, index) => {
          const isStartOrEnd = index === 0 || index === stops.length - 1;

          // Use car icon for start point
          if (index === 0) {
            const carMarker = L.marker([stop.latitude, stop.longitude], {
              icon: createCarIcon(route.color || '#7B2CBF'),
            })
              .addTo(map)
              .bindPopup(
                `
                <div style="text-align: center; min-width: 150px;">
                  <strong style="color: ${route.color || '#7B2CBF'}">${route.route_code}</strong><br/>
                  <small>${stop.stop_name}</small><br/>
                  <small style="color: green;">🚏 Titik Awal</small>
                </div>
              `
              )
              .on("click", () => {
                onRouteSelect(route);
              });
            markersRef.current.push(carMarker);
          } else {
            // Regular stop markers
            const stopMarker = L.marker([stop.latitude, stop.longitude], {
              icon: createStopIcon(route.color || '#7B2CBF', isStartOrEnd),
            })
              .addTo(map)
              .bindPopup(
                `
                <div style="text-align: center; min-width: 150px;">
                  <strong style="color: ${route.color}">${
                  route.route_code
                }</strong><br/>
                  <small>${stop.stop_name}</small><br/>
                  <small>Halte #${stop.stop_order}</small>
                  ${
                    isStartOrEnd
                      ? '<br/><small style="color: red;">🏁 Titik Akhir</small>'
                      : ""
                  }
                </div>
              `
              )
              .on("click", () => {
                onRouteSelect(route);
              });
            markersRef.current.push(stopMarker);
          }
        });
      }
    });
  }, [map, L, routes, routeStops, onRouteSelect]);

  // Highlight selected route
  useEffect(() => {
    if (!map || !L || !selectedRoute) return;

    const stops = routeStops
      .filter((stop) => stop.route_id === selectedRoute.id)
      .sort((a, b) => a.stop_order - b.stop_order);

    if (stops.length > 0) {
      const bounds = L.latLngBounds(
        stops.map((stop) => [stop.latitude, stop.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, L, selectedRoute, routeStops]);

  return (
    <div ref={mapRef} className="absolute inset-0 z-0 overflow-hidden">
      {!mapLoaded && (
        <div className="absolute inset-0 bg-purple-50 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-800 font-semibold">Memuat peta...</p>
          </div>
        </div>
      )}
    </div>
  );
}
