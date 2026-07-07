"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Concesionarios.module.css";

interface Dealership {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  website: string;
  services: ("venta" | "carroceria" | "repuestos" | "seminuevos" | "servicios")[];
  x: number;
  y: number;
  lat: number;
  lng: number;
  city: string;
}

interface LeafletMapProps {
  dealerships: Dealership[];
  selectedDealerId: string | null;
  onSelectDealer: (dealer: Dealership) => void;
  userLocation: { lat: number; lng: number } | null;
  mapMode: "map" | "satellite";
  onMouseMoveCoords: (lat: string, lng: string) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  mapInstanceRef: React.MutableRefObject<L.Map | null>;
}

export default function LeafletMap({
  dealerships,
  selectedDealerId,
  onSelectDealer,
  userLocation,
  mapMode,
  onMouseMoveCoords,
  zoom,
  setZoom,
  mapInstanceRef
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center to encompass Comas (North), Cañete (South), Huancayo (East)
    const map = L.map(mapContainerRef.current, {
      center: [-12.25, -76.2],
      zoom: 8,
      zoomControl: false, // Custom styled controls in UI
      attributionControl: true
    });

    mapInstanceRef.current = map;

    // Track mouse coordinates over map
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      onMouseMoveCoords(e.latlng.lat.toFixed(4), e.latlng.lng.toFixed(4));
    });

    // Update parent zoom state on map zoom
    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let urlTemplate = "";
    let attribution = "";

    if (mapMode === "satellite") {
      // ESRI Satellite Imagery
      urlTemplate = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";
    } else {
      // CartoDB Dark Matter (Premium styled dark mode)
      urlTemplate = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }

    const tileLayer = L.tileLayer(urlTemplate, {
      attribution,
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [mapMode]);

  // Render Dealership Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    dealerships.forEach((dealer) => {
      const isActive = dealer.id === selectedDealerId;

      // Custom divIcon for Dealership Marker
      const icon = L.divIcon({
        className: "custom-leaflet-marker-icon",
        html: `
          <div style="position: relative; width: 30px; height: 42px;">
            ${
              isActive
                ? `<div class="${styles.activeMarkerRing}" style="position: absolute; left: 15px; top: 38px; width: 0px; height: 0px;"></div>`
                : ""
            }
            <svg width="30" height="42" viewBox="-15 -35 30 42" style="position: absolute; left: 0; top: 0;">
              <path
                d="M 0,0 C -6,-12 -8,-16 -8,-22 A 8,8 0 1,1 8,-22 C 8,-16 6,-12 0,0 Z"
                fill="${isActive ? "#f7c600" : "#d12e2e"}"
                stroke="#000"
                stroke-width="1.5"
              />
              <circle cx="0" cy="-22" r="3.5" fill="#ffffff" />
            </svg>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -38]
      });

      const marker = L.marker([dealer.lat, dealer.lng], { icon })
        .addTo(map)
        .on("click", () => {
          onSelectDealer(dealer);
        });

      // Bind popup with dealer information
      marker.bindPopup(`
        <div style="color: #fff; background: #0b0b0b; padding: 4px; font-family: system-ui, sans-serif;">
          <h4 style="margin: 0 0 6px 0; color: #f7c600; font-size: 14px; text-transform: uppercase;">${dealer.name}</h4>
          <p style="margin: 0 0 4px 0; font-size: 11px; opacity: 0.85;">📍 ${dealer.address}</p>
          <p style="margin: 0 0 4px 0; font-size: 11px; opacity: 0.85;">📞 ${dealer.phone}</p>
          <p style="margin: 0; font-size: 11px; opacity: 0.85;">⏰ ${dealer.hours}</p>
        </div>
      `, {
        closeButton: false,
        className: "custom-leaflet-popup"
      });

      markersRef.current[dealer.id] = marker;

      // Open popup if this marker is selected
      if (isActive) {
        // Center on the active dealer with slightly higher zoom
        map.setView([dealer.lat, dealer.lng], Math.max(map.getZoom(), 13), { animate: true });
        // Delay opening popup slightly to allow zoom transition to start
        setTimeout(() => {
          if (markersRef.current[dealer.id]) {
            markersRef.current[dealer.id].openPopup();
          }
        }, 150);
      }
    });
  }, [dealerships, selectedDealerId]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-leaflet-user-icon",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div class="${styles.userLocationPulse}" style="position: absolute; width: 36px; height: 36px; background: rgba(247, 198, 0, 0.25); border-radius: 50%;"></div>
            <div style="width: 12px; height: 12px; background: #f7c600; border: 1.5px solid #000; border-radius: 50%; z-index: 2;"></div>
            <div style="position: absolute; left: 24px; top: 12px; color: #f7c600; font-size: 9px; font-weight: bold; font-family: monospace; text-shadow: 0 0 3px #000; z-index: 3;">TÚ</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #fff; background: #0b0b0b; padding: 4px; font-family: system-ui, sans-serif;">
            <h4 style="margin: 0; color: #f7c600; font-size: 12px; text-transform: uppercase;">Tu Ubicación</h4>
          </div>
        `, { closeButton: false });

      userMarkerRef.current = userMarker;
      map.setView([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 12), { animate: true });
    }
  }, [userLocation]);

  // Draw Route from User to Selected Dealership
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (userLocation && selectedDealerId) {
      const selectedDealer = dealerships.find((d) => d.id === selectedDealerId);
      if (selectedDealer) {
        // Draw route line
        const routeLine = L.polyline(
          [
            [userLocation.lat, userLocation.lng],
            [selectedDealer.lat, selectedDealer.lng]
          ],
          {
            color: "#f7c600",
            weight: 3.5,
            dashArray: "6, 6",
            lineCap: "round",
            lineJoin: "round"
          }
        ).addTo(map);

        // Add custom animating dash effect (done via CSS on leaflet-interactive path)
        const path = routeLine.getElement();
        if (path) {
          path.classList.add(styles.animatedRoute);
        }

        routeLineRef.current = routeLine;

        // Fit map boundaries to show both points with padding
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [selectedDealer.lat, selectedDealer.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      }
    }
  }, [userLocation, selectedDealerId, dealerships]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#050505",
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 1
      }}
    />
  );
}
