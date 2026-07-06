"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "../header/Header";
import styles from "./Concesionarios.module.css";

// Interface for Dealership structure
interface Dealership {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  website: string;
  services: ("venta" | "carroceria" | "repuestos" | "seminuevos" | "servicios")[];
  x: number; // SVG position X
  y: number; // SVG position Y
  lat: number; // Mock latitude
  lng: number; // Mock longitude
  city: string;
  distance?: number;
}

// Initial dealerships data
const DEALERSHIPS: Dealership[] = [
  {
    id: "deal-1",
    name: "Autoespar C.C. Plaza Norte",
    address: "Cruce de las Av. Tomás Valle y Alfredo Mendiola - Independencia, Lima Norte",
    phone: "(01) 708-0900",
    hours: "Lunes a Domingo: 10:00 AM - 10:00 PM",
    website: "https://www.autoespar.com.pe/toyota/",
    services: ["venta"],
    x: 210,
    y: 190,
    lat: -11.9961,
    lng: -77.0601,
    city: "Lima"
  },
  {
    id: "deal-2",
    name: "Autoespar Cañete",
    address: "Antigua Panamericana Sur Km 145, San Vicente de Cañete",
    phone: "(01) 708-0900",
    hours: "L - V: 8:00 AM - 5:45 PM | Sábado: 8:30 AM - 4:00 PM",
    website: "https://www.autoespar.com.pe",
    services: ["venta", "servicios", "repuestos"],
    x: 350,
    y: 430,
    lat: -13.0768,
    lng: -76.3875,
    city: "Cañete"
  },
  {
    id: "deal-3",
    name: "Autoespar Comas",
    address: "Av. Túpac Amaru 1495 - Comas, Lima Norte",
    phone: "(01) 708-0900 / (01) 536-6009",
    hours: "L - V: 8:00 AM - 5:45 PM | Sábado: 8:30 AM - 4:00 PM",
    website: "https://www.autoespar.com.pe/toyota/",
    services: ["venta", "servicios", "seminuevos", "repuestos"],
    x: 220,
    y: 140,
    lat: -11.9355,
    lng: -77.0423,
    city: "Comas"
  },
  {
    id: "deal-4",
    name: "Autoespar San Borja",
    address: "Av. Javier Prado Este 1010 - San Borja, Lima Centro",
    phone: "(01) 708-0900",
    hours: "Lunes a Domingo: 9:00 AM - 8:00 PM",
    website: "https://www.autoespar.com.pe",
    services: ["venta", "servicios", "seminuevos", "carroceria"],
    x: 235,
    y: 230,
    lat: -12.0874,
    lng: -77.0041,
    city: "Lima"
  },
  {
    id: "deal-5",
    name: "Autoespar San Miguel",
    address: "Av. La Marina 2540 - San Miguel, Lima Oeste",
    phone: "(01) 708-0900",
    hours: "L - V: 8:30 AM - 7:00 PM | Sábado: 9:00 AM - 5:00 PM",
    website: "https://www.autoespar.com.pe",
    services: ["venta", "servicios", "repuestos", "carroceria"],
    x: 185,
    y: 220,
    lat: -12.0782,
    lng: -77.0854,
    city: "Lima"
  },
  {
    id: "deal-6",
    name: "Autoespar Huancayo",
    address: "Av. Mariscal Castilla 2235 - El Tambo, Huancayo",
    phone: "(064) 251-500",
    hours: "L - V: 8:30 AM - 6:00 PM | Sábado: 9:00 AM - 1:00 PM",
    website: "https://www.autoespar.com.pe",
    services: ["venta", "servicios", "repuestos"],
    x: 480,
    y: 280,
    lat: -12.0588,
    lng: -75.2214,
    city: "Huancayo"
  }
];

// Helper mapping for filter display text
const FILTER_LABELS = {
  todos: "Todos",
  carroceria: "Carrocería y pintura",
  repuestos: "Repuestos",
  seminuevos: "Seminuevos",
  servicios: "Servicios",
  venta: "Venta"
};

export default function Concesionarios() {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("todos");
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  
  // Map control states
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: -30, y: -20 });
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({ lat: "-12.0463", lng: "-77.0310" });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // User location states
  const [userLocation, setUserLocation] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distanceAlert, setDistanceAlert] = useState<string | null>(null);

  // References
  const mapSvgRef = useRef<SVGSVGElement>(null);
  const dealerListRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter & Search logic
  const filteredDealers = useMemo(() => {
    return DEALERSHIPS.filter((dealer) => {
      // Filter by tag
      if (activeFilter !== "todos" && !dealer.services.includes(activeFilter as any)) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = dealer.name.toLowerCase().includes(query);
        const matchesAddress = dealer.address.toLowerCase().includes(query);
        const matchesCity = dealer.city.toLowerCase().includes(query);
        return matchesName || matchesAddress || matchesCity;
      }
      
      return true;
    });
  }, [searchQuery, activeFilter]);

  // Calculate distances if user location is available
  const sortedDealersWithDistance = useMemo(() => {
    if (!userLocation) return filteredDealers;

    // Simple Euclidean distance multiplier for mock km (1 degree ~ 111km)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dy = lat1 - lat2;
      const dx = lng1 - lng2;
      return Math.sqrt(dx * dx + dy * dy) * 111.32;
    };

    return [...filteredDealers]
      .map((d) => ({
        ...d,
        distance: calculateDistance(userLocation.lat, userLocation.lng, d.lat, d.lng)
      }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [filteredDealers, userLocation]);

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.8));
  const handleResetMap = () => {
    setZoom(1.2);
    setPan({ x: -30, y: -20 });
    setSelectedDealerId(null);
  };

  // Mouse coordinate tracker on Map
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!mapSvgRef.current) return;

    const svg = mapSvgRef.current;
    const rect = svg.getBoundingClientRect();
    
    // Calculate SVG coordinate
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 600;

    // Convert SVG coords to mock Latitude/Longitude
    // Center point (San Borja: X 235, Y 230) maps to Lat: -12.0874, Lng: -77.0041
    const mockLat = -12.0874 - (y - 230) * 0.005;
    const mockLng = -77.0041 + (x - 235) * 0.005;

    setMouseCoords({
      lat: mockLat.toFixed(4),
      lng: mockLng.toFixed(4)
    });

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan((prev) => ({
        x: prev.x + dx / zoom,
        y: prev.y + dy / zoom
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Map panning drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle dealer selection
  const selectDealer = (dealer: Dealership) => {
    setSelectedDealerId(dealer.id);
    // Pan to center dealer (relative coordinates in SVG)
    setZoom(1.8);
    // Center map on dealer coords
    setPan({
      x: 300 - dealer.x,
      y: 300 - dealer.y
    });

    // Scroll card into view
    setTimeout(() => {
      const card = cardRefs.current[dealer.id];
      if (card && dealerListRef.current) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
  };

  // Geolocalize user
  const handleUseMyLocation = () => {
    setIsLocating(true);
    setDistanceAlert(null);

    // Simulate location retrieval
    setTimeout(() => {
      // User is located near Plaza de Armas, Lima (Mock coordinates)
      const mockUserLoc = {
        x: 215,
        y: 205,
        lat: -12.0463,
        lng: -77.0310
      };
      
      setUserLocation(mockUserLoc);
      setIsLocating(false);

      // Pan to show user and surrounding area
      setZoom(1.6);
      setPan({
        x: 300 - mockUserLoc.x,
        y: 300 - mockUserLoc.y
      });

      // Find closest dealership in DEALS
      let closest = DEALERSHIPS[0];
      let minDistance = Infinity;

      const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const dy = lat1 - lat2;
        const dx = lng1 - lng2;
        return Math.sqrt(dx * dx + dy * dy) * 111.32;
      };

      DEALERSHIPS.forEach((d) => {
        const dist = calculateDistance(mockUserLoc.lat, mockUserLoc.lng, d.lat, d.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = d;
        }
      });

      setDistanceAlert(
        `Ubicación detectada. El concesionario más cercano es "${closest.name}" a ${minDistance.toFixed(1)} km.`
      );
      setSelectedDealerId(closest.id);
    }, 1200);
  };

  // Find active dealer object
  const activeDealerObj = useMemo(() => {
    return DEALERSHIPS.find((d) => d.id === selectedDealerId) || null;
  }, [selectedDealerId]);

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.mainContent}>
        {/* Page Title Section */}
        <section className={styles.titleSection}>
          <div className={styles.titleWrapper}>
            <span className={styles.kicker}>Red Oficial de Concesionarios</span>
            <h2 className={styles.title}>Encuentra tu Concesionario</h2>
            <p className={styles.subtitle}>
              Explora nuestra red de sucursales oficiales de Legendary Motorsport. Encuentra centros de 
              venta autorizados, talleres de postventa homologados y repuestos exclusivos cerca de ti.
            </p>
          </div>
        </section>

        {/* Search & Filter Header Section */}
        <section className={styles.searchSection}>
          <div className={styles.searchBarContainer}>
            <div className={styles.inputWrapper}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                type="text"
                placeholder="¿Dónde estás? (Ej: Comas, Lima, Cañete...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button 
              type="button" 
              onClick={handleUseMyLocation} 
              className={styles.locationButton}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <span className={styles.spinner}></span>
                  Localizando...
                </>
              ) : (
                <>
                  <svg className={styles.pinIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Usar mi ubicación
                </>
              )}
            </button>
          </div>

          {/* Alert for Proximity Search */}
          {distanceAlert && (
            <div className={styles.alertSuccess}>
              <svg className={styles.alertIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <span>{distanceAlert}</span>
              <button onClick={() => setDistanceAlert(null)} className={styles.closeAlert}>×</button>
            </div>
          )}

          {/* Filter Chips Container */}
          <div className={styles.filterContainer}>
            {Object.entries(FILTER_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={`${styles.filterChip} ${activeFilter === key ? styles.filterChipActive : ""}`}
                onClick={() => setActiveFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Split Layout */}
        <section className={styles.splitLayout}>
          {/* Map Column */}
          <div className={styles.mapColumn}>
            <div className={styles.mapCard}>
              {/* Map Floating Controls */}
              <div className={styles.mapControls}>
                <button type="button" onClick={handleZoomIn} title="Acercar" className={styles.ctrlBtn}>+</button>
                <button type="button" onClick={handleZoomOut} title="Alejar" className={styles.ctrlBtn}>-</button>
                <button type="button" onClick={handleResetMap} title="Restablecer" className={styles.ctrlBtn}>⌖</button>
                <span className={styles.ctrlDivider}></span>
                <button
                  type="button"
                  onClick={() => setMapMode(mapMode === "map" ? "satellite" : "map")}
                  className={`${styles.ctrlBtn} ${styles.ctrlBtnText}`}
                >
                  {mapMode === "map" ? "Satélite" : "Mapa"}
                </button>
              </div>

              {/* High-tech SVG Map */}
              <div className={styles.mapWrapper}>
                <svg
                  ref={mapSvgRef}
                  className={`${styles.mapSvg} ${mapMode === "satellite" ? styles.mapSatellite : styles.mapVector}`}
                  viewBox="0 0 600 600"
                  onMouseMove={handleMouseMove}
                  onMouseDown={handleMouseDown}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Definition of gradients and shadows */}
                  <defs>
                    {/* Glowing effect for active route path */}
                    <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    
                    {/* Glowing effect for active pin */}
                    <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.97  0 0 0 0 0.77  0 0 0 0 0  0 0 0 0.8 0" />
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    <radialGradient id="water-grad" cx="20%" cy="40%" r="80%">
                      <stop offset="0%" stopColor="#080c18" />
                      <stop offset="100%" stopColor="#03050a" />
                    </radialGradient>

                    <radialGradient id="water-sat-grad" cx="20%" cy="40%" r="80%">
                      <stop offset="0%" stopColor="#071221" />
                      <stop offset="100%" stopColor="#02070e" />
                    </radialGradient>
                  </defs>

                  {/* Ocean Layer */}
                  <rect width="600" height="600" fill={mapMode === "satellite" ? "url(#water-sat-grad)" : "url(#water-grad)"} />

                  {/* Topography Coordinate Grid Lines (in background) */}
                  <g stroke="rgba(247, 198, 0, 0.05)" strokeWidth="0.5" strokeDasharray="3,12">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line key={`h-${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
                    ))}
                  </g>

                  {/* Map content transformed group (handles drag and zoom) */}
                  <g transform={`scale(${zoom}) translate(${pan.x}, ${pan.y})`} style={{ transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)" }}>
                    
                    {/* Outline of Coastline (Lima / Peru area) */}
                    <path
                      d="M -100,50 L 50,80 L 100,100 L 150,130 L 180,180 L 210,230 L 220,240 L 230,260 L 250,290 L 300,380 L 340,430 L 350,450 L 360,470 L 410,530 L 460,570 L 600,600 L 700,650 L 700,-100 L -100,-100 Z"
                      fill={mapMode === "satellite" ? "#0f1115" : "#0a0a0c"}
                      stroke={mapMode === "satellite" ? "#1b232c" : "rgba(247, 198, 0, 0.15)"}
                      strokeWidth="2"
                    />

                    {/* Coastal glow effect */}
                    <path
                      d="M -100,50 L 50,80 L 100,100 L 150,130 L 180,180 L 210,230 L 220,240 L 230,260 L 250,290 L 300,380 L 340,430 L 350,450 L 360,470 L 410,530 L 460,570 L 600,600"
                      fill="none"
                      stroke={mapMode === "satellite" ? "rgba(0, 150, 255, 0.2)" : "rgba(247, 198, 0, 0.25)"}
                      strokeWidth="8"
                      filter="blur(4px)"
                    />

                    {/* Basic Road Network / Highways (GTA styled layout) */}
                    <g fill="none" strokeWidth="1" opacity={mapMode === "satellite" ? "0.35" : "0.2"}>
                      {/* Panamericana Sur / Norte Highway */}
                      <path d="M 50,80 L 105,103 L 153,132 L 212,192 L 236,233 L 252,291 L 302,381 L 342,431 L 352,451 L 412,531 L 462,571" stroke="#f7c600" strokeWidth="2.5" />
                      
                      {/* Javier Prado Expressway */}
                      <path d="M 185,220 L 235,230 L 300,240 L 360,250 L 500,270" stroke="#f7c600" strokeWidth="1.5" />
                      
                      {/* Túpac Amaru Highway */}
                      <path d="M 220,140 L 210,190 L 215,205 L 235,230" stroke="#888" />
                      
                      {/* Connection to Huancayo (Carretera Central) */}
                      <path d="M 235,230 L 280,210 L 330,225 L 390,240 L 480,280" stroke="#f7c600" strokeWidth="1.8" />
                    </g>

                    {/* Regional Labels */}
                    <g fill={mapMode === "satellite" ? "rgba(255,255,255,0.4)" : "rgba(247, 198, 0, 0.3)"} fontSize="10" fontFamily="monospace" letterSpacing="2">
                      <text x="35" y="250" transform="rotate(-30 35 250)">PACIFIC OCEAN</text>
                      <text x="245" y="195" fontSize="8" letterSpacing="1">LIMA METROPOLITANA</text>
                      <text x="362" y="420" fontSize="8" letterSpacing="1">VALLE CAÑETE</text>
                      <text x="440" y="260" fontSize="8" letterSpacing="1">ANDES CENTRO</text>
                    </g>

                    {/* Animated Route Path (Draws route if userLocation is active and a dealer is selected) */}
                    {userLocation && selectedDealerId && activeDealerObj && (
                      <g>
                        {/* Dynamic Path calculation: Simple curve */}
                        <path
                          d={`M ${userLocation.x},${userLocation.y} Q ${(userLocation.x + activeDealerObj.x) / 2 - 30},${(userLocation.y + activeDealerObj.y) / 2 - 30} ${activeDealerObj.x},${activeDealerObj.y}`}
                          fill="none"
                          stroke="rgba(247, 198, 0, 0.8)"
                          strokeWidth="3.5"
                          filter="url(#route-glow)"
                          strokeDasharray="6, 6"
                          className={styles.animatedRoute}
                        />
                        <path
                          d={`M ${userLocation.x},${userLocation.y} Q ${(userLocation.x + activeDealerObj.x) / 2 - 30},${(userLocation.y + activeDealerObj.y) / 2 - 30} ${activeDealerObj.x},${activeDealerObj.y}`}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeDasharray="4, 8"
                          className={styles.animatedRouteFast}
                        />
                      </g>
                    )}

                    {/* User Location Glowing Marker */}
                    {userLocation && (
                      <g transform={`translate(${userLocation.x}, ${userLocation.y})`}>
                        <circle r="14" fill="rgba(247, 198, 0, 0.25)" className={styles.userLocationPulse} />
                        <circle r="6" fill="#f7c600" stroke="#000" strokeWidth="1.5" />
                        <circle r="2" fill="#fff" />
                        <text x="10" y="4" fill="#f7c600" fontSize="8" fontWeight="bold" fontFamily="sans-serif">TÚ</text>
                      </g>
                    )}

                    {/* Dealership Markers */}
                    {filteredDealers.map((dealer) => {
                      const isActive = dealer.id === selectedDealerId;
                      return (
                        <g
                          key={dealer.id}
                          transform={`translate(${dealer.x}, ${dealer.y})`}
                          className={styles.markerGroup}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDealer(dealer);
                          }}
                        >
                          {/* Pulsing ring for active dealer */}
                          {isActive && (
                            <circle r="18" fill="none" stroke="#f7c600" strokeWidth="1.5" className={styles.activeMarkerRing} />
                          )}
                          
                          {/* Marker Pin */}
                          <path
                            d="M 0,0 C -6,-12 -8,-16 -8,-22 A 8,8 0 1,1 8,-22 C 8,-16 6,-12 0,0 Z"
                            fill={isActive ? "#f7c600" : "#d12e2e"}
                            stroke="#000"
                            strokeWidth="1.5"
                            filter={isActive ? "url(#pin-glow)" : "none"}
                            className={styles.pinPath}
                          />
                          
                          {/* Inner Dot */}
                          <circle cx="0" cy="-22" r="3.5" fill="#ffffff" />

                          {/* Hover Tooltip Label */}
                          <g className={styles.markerLabel}>
                            <rect x="-60" y="-45" width="120" height="18" rx="4" fill="#0b0b0b" stroke="rgba(247, 198, 0, 0.3)" strokeWidth="1" />
                            <text x="0" y="-33" fill="#ffffff" fontSize="8.5" textAnchor="middle" fontWeight="bold">
                              {dealer.name.split(" ").slice(1).join(" ")}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Coordinate Readout Footer on Map */}
                <div className={styles.coordsFooter}>
                  <span className={styles.gpsLock}>🛰️ GPS LINK ACTIVE</span>
                  <span className={styles.coordsText}>
                    LAT: {mouseCoords.lat}° S &nbsp;|&nbsp; LNG: {mouseCoords.lng}° W
                  </span>
                  <span className={styles.zoomIndicator}>ZOOM: {zoom.toFixed(1)}x</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dealerships List Column */}
          <div className={styles.listColumn}>
            {/* Results Counter */}
            <div className={styles.resultsCounter}>
              <span>{sortedDealersWithDistance.length} Concesionarios encontrados</span>
              {activeFilter !== "todos" && (
                <span className={styles.activeFilterTag}>
                  Servicio: {FILTER_LABELS[activeFilter as keyof typeof FILTER_LABELS]}
                </span>
              )}
            </div>

            {/* Scrollable list */}
            <div ref={dealerListRef} className={styles.dealerList}>
              {sortedDealersWithDistance.length > 0 ? (
                sortedDealersWithDistance.map((dealer) => {
                  const isSelected = dealer.id === selectedDealerId;
                  return (
                    <div
                      key={dealer.id}
                      ref={(el) => {
                        cardRefs.current[dealer.id] = el;
                      }}
                      className={`${styles.dealerCard} ${isSelected ? styles.dealerCardSelected : ""}`}
                      onClick={() => selectDealer(dealer)}
                    >
                      {/* Card main contents */}
                      <div className={styles.cardHeader}>
                        <h3 className={styles.cardName}>{dealer.name}</h3>
                        
                        {/* Distance Badge if user location is available */}
                        {dealer.distance !== undefined && (
                          <span className={styles.distanceBadge}>
                            📍 a {(dealer.distance).toFixed(1)} km
                          </span>
                        )}
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.infoRow}>
                          <span className={styles.infoIcon}>📍</span>
                          <span className={styles.infoText}>{dealer.address}</span>
                        </p>
                        <p className={styles.infoRow}>
                          <span className={styles.infoIcon}>📞</span>
                          <span className={styles.infoText}>
                            Telf: <a href={`tel:${dealer.phone.replace(/[^0-9]/g, '')}`} className={styles.phoneLink}>{dealer.phone}</a>
                          </span>
                        </p>
                        <p className={styles.infoRow}>
                          <span className={styles.infoIcon}>⏰</span>
                          <span className={styles.infoText}>{dealer.hours}</span>
                        </p>
                        <p className={styles.infoRow}>
                          <span className={styles.infoIcon}>🌐</span>
                          <span className={styles.infoText}>
                            <a
                              href={dealer.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.webLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visitar sitio web
                              <svg className={styles.externalIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </a>
                          </span>
                        </p>
                      </div>

                      {/* Card services tags and actions footer */}
                      <div className={styles.cardFooter}>
                        {/* Badges indicators (matching screenshot list layout) */}
                        <div className={styles.servicesList}>
                          {dealer.services.includes("venta") && (
                            <span className={styles.serviceBadge}>
                              Venta <span className={`${styles.dot} ${styles.dotRed}`}></span>
                            </span>
                          )}
                          {dealer.services.includes("servicios") && (
                            <span className={styles.serviceBadge}>
                              Servicios <span className={`${styles.dot} ${styles.dotBlue}`}></span>
                            </span>
                          )}
                          {dealer.services.includes("repuestos") && (
                            <span className={styles.serviceBadge}>
                              Repuestos <span className={`${styles.dot} ${styles.dotGreen}`}></span>
                            </span>
                          )}
                          {dealer.services.includes("seminuevos") && (
                            <span className={styles.serviceBadge}>
                              Seminuevos <span className={`${styles.dot} ${styles.dotYellow}`}></span>
                            </span>
                          )}
                          {dealer.services.includes("carroceria") && (
                            <span className={styles.serviceBadge}>
                              Carrocería <span className={`${styles.dot} ${styles.dotPurple}`}></span>
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className={styles.cardActions}>
                          <button
                            type="button"
                            className={styles.actionBtnSecondary}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDealer(dealer);
                            }}
                          >
                            Ver Mapa
                          </button>
                          
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.name + " " + dealer.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.actionBtnPrimary}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Cómo llegar
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noResults}>
                  <div className={styles.noResultsIcon}>🔍</div>
                  <h4 className={styles.noResultsTitle}>No se encontraron concesionarios</h4>
                  <p className={styles.noResultsText}>
                    Intente buscar con otros términos o cambie el filtro de servicios seleccionado.
                  </p>
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("todos");
                    }}
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
