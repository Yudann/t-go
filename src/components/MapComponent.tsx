"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { Icon } from "leaflet";

// Fix Leaflet icon issue
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  estimated_time: number;
  fare: number;
  color: string;
}

interface MapComponentProps {
  routes: Route[];
}

// Dummy coordinates for Tangerang routes
const routeCoordinates: any = {
  T01: [
    [-6.178306, 106.638056], // Terminal Cimone
    [-6.19, 106.65],
    [-6.2, 106.67],
    [-6.205556, 106.720833], // CBD Ciledug
  ],
  T02: [
    [-6.266667, 106.766667], // Bintaro
    [-6.283333, 106.783333],
    [-6.3, 106.8], // BSD Serpong
  ],
  T03: [
    [-6.166667, 106.633333], // Karawaci
    [-6.155556, 106.65], // Lippo Karawaci
  ],
  T04: [
    [-6.178306, 106.638056], // Tangerang Kota
    [-6.233333, 106.766667], // Alam Sutera
  ],
  T05: [
    [-6.25, 106.616667], // Gading Serpong
    [-6.233333, 106.633333], // Summarecon Mall
  ],
};

const MapComponent = ({ routes }: MapComponentProps) => {
  return (
    <MapContainer
      center={[-6.178306, 106.638056]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routes.map((route) => {
        const coords = routeCoordinates[route.route_code] || [];

        return (
          <div key={route.id}>
            {coords.length > 0 && (
              <>
                <Polyline
                  positions={coords}
                  color={route.color}
                  weight={4}
                  opacity={0.7}
                />

                {/* Start marker */}
                <Marker position={coords[0]}>
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-sm">{route.route_code}</p>
                      <p className="text-xs">{route.start_point}</p>
                      <p className="text-xs text-muted-foreground">
                        Titik Awal
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* End marker */}
                <Marker position={coords[coords.length - 1]}>
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold text-sm">{route.route_code}</p>
                      <p className="text-xs">{route.end_point}</p>
                      <p className="text-xs text-muted-foreground">
                        Titik Akhir
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </div>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
