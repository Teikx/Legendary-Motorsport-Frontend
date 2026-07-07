"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Header from "../header/Header";
import styles from "./Concesionarios.module.css";
import dynamic from "next/dynamic";
import type L from "leaflet";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false });

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
  const [zoom, setZoom] = useState<number>(8);
  const [mapMode, setMapMode] = useState<"map" | "satellite">("map");
  const [mouseCoords, setMouseCoords] = useState<{ lat: string; lng: string }>({ lat: "-12.0463", lng: "-77.0310" });

  // User location states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distanceAlert, setDistanceAlert] = useState<string | null>(null);

  // References
  const mapInstanceRef = useRef<L.Map | null>(null);
  const dealerListRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Inquiry form states for selected dealership details card
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState<"idle" | "sending" | "success">("idle");

  // Load user data on mount to pre-fill inquiry forms
  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim() || "";
    const storedEmail = localStorage.getItem("email")?.trim() || "";
    
    setInquiryName(storedName);
    setInquiryEmail(storedEmail);

    const clientId = localStorage.getItem("idCliente");
    const token = localStorage.getItem("authToken");
    const API_BASE_URL = "http://localhost:5035";

    if (clientId && token) {
      const fetchClientInfo = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/clientes/${clientId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const firstName = data.nombre ?? data.Nombre ?? "";
            const lastName = data.apellido ?? data.Apellido ?? "";
            const emailAddress = data.email ?? data.Email ?? "";
            
            if (firstName || lastName) {
              const fullName = `${firstName} ${lastName}`.trim();
              setInquiryName(fullName);
              localStorage.setItem("nombre", fullName);
            }
            if (emailAddress) {
              setInquiryEmail(emailAddress);
              localStorage.setItem("email", emailAddress);
            }
          }
        } catch (err) {
          console.error("Error loading customer in Concesionarios:", err);
        }
      };
      void fetchClientInfo();
    }
  }, []);

  // Reset form when selected dealership changes (maintain pre-filled user details)
  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim() || "";
    const storedEmail = localStorage.getItem("email")?.trim() || "";

    setInquiryName(storedName);
    setInquiryEmail(storedEmail);
    setInquiryMsg("");
    setInquiryStatus("idle");
  }, [selectedDealerId]);

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
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };
  const handleResetMap = () => {
    setSelectedDealerId(null);
    if (mapInstanceRef.current) {
      const coords = DEALERSHIPS.map((d) => [d.lat, d.lng] as [number, number]);
      mapInstanceRef.current.fitBounds(coords, { padding: [50, 50], animate: true });
    }
  };

  // Handle dealer selection
  const selectDealer = (dealer: Dealership) => {
    setSelectedDealerId(dealer.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([dealer.lat, dealer.lng], 14, { animate: true });
    }

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

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dy = lat1 - lat2;
      const dx = lng1 - lng2;
      return Math.sqrt(dx * dx + dy * dy) * 111.32;
    };

    const runSimulation = () => {
      const mockUserLoc = {
        lat: -12.0463,
        lng: -77.0310
      };

      let closest = DEALERSHIPS[0];
      let minDistance = Infinity;

      DEALERSHIPS.forEach((d) => {
        const dist = calculateDistance(mockUserLoc.lat, mockUserLoc.lng, d.lat, d.lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = d;
        }
      });

      setUserLocation(mockUserLoc);
      setIsLocating(false);
      setSelectedDealerId(closest.id);

      setDistanceAlert(
        `No pudimos acceder a tu GPS. Usando ubicación simulada de Lima Centro. Concesionario más cercano: "${closest.name}" a ${minDistance.toFixed(1)} km.`
      );

      if (mapInstanceRef.current) {
        const bounds = [[mockUserLoc.lat, mockUserLoc.lng], [closest.lat, closest.lng]] as [number, number][];
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          let closest = DEALERSHIPS[0];
          let minDistance = Infinity;

          DEALERSHIPS.forEach((d) => {
            const dist = calculateDistance(userLoc.lat, userLoc.lng, d.lat, d.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = d;
            }
          });

          setUserLocation(userLoc);
          setIsLocating(false);
          setSelectedDealerId(closest.id);

          setDistanceAlert(
            `Ubicación detectada. El concesionario más cercano es "${closest.name}" a ${minDistance.toFixed(1)} km.`
          );

          if (mapInstanceRef.current) {
            const bounds = [[userLoc.lat, userLoc.lng], [closest.lat, closest.lng]] as [number, number][];
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
          }
        },
        (error) => {
          console.warn("Geolocation error, running fallback simulation:", error);
          runSimulation();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      runSimulation();
    }
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

              {/* High-tech Leaflet Map */}
              <div className={styles.mapWrapper}>
                <LeafletMap
                  dealerships={DEALERSHIPS}
                  selectedDealerId={selectedDealerId}
                  onSelectDealer={selectDealer}
                  userLocation={userLocation}
                  mapMode={mapMode}
                  onMouseMoveCoords={(lat, lng) => setMouseCoords({ lat, lng })}
                  zoom={zoom}
                  setZoom={setZoom}
                  mapInstanceRef={mapInstanceRef}
                />

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

            {/* Active Dealer Details Panel */}
            {activeDealerObj && (
              <div className={styles.detailsCard}>
                <div className={styles.detailsHeader}>
                  <span className={styles.detailsKicker}>Ficha de Concesionario Oficial</span>
                  <h3 className={styles.detailsTitle}>{activeDealerObj.name}</h3>
                  <p className={styles.detailsSubtitle}>Sede {activeDealerObj.city}</p>
                </div>

                <div className={styles.detailsGrid}>
                  {/* Column 1: Info */}
                  <div className={styles.detailsCol}>
                    <h4 className={styles.colTitle}>Información de Contacto</h4>
                    <div className={styles.colBody}>
                      <div className={styles.infoDetailRow}>
                        <span className={styles.infoDetailIcon}>📍</span>
                        <div>
                          <p className={styles.infoLabel}>Dirección</p>
                          <p className={styles.infoVal}>{activeDealerObj.address}</p>
                        </div>
                      </div>
                      <div className={styles.infoDetailRow}>
                        <span className={styles.infoDetailIcon}>📞</span>
                        <div>
                          <p className={styles.infoLabel}>Teléfono</p>
                          <a href={`tel:${activeDealerObj.phone.replace(/[^0-9]/g, '')}`} className={styles.infoValLink}>
                            {activeDealerObj.phone}
                          </a>
                        </div>
                      </div>
                      <div className={styles.infoDetailRow}>
                        <span className={styles.infoDetailIcon}>⏰</span>
                        <div>
                          <p className={styles.infoLabel}>Horario de Atención</p>
                          <p className={styles.infoVal}>{activeDealerObj.hours}</p>
                        </div>
                      </div>
                      <div className={styles.infoDetailRow}>
                        <span className={styles.infoDetailIcon}>🌐</span>
                        <div>
                          <p className={styles.infoLabel}>Sitio Web</p>
                          <a href={activeDealerObj.website} target="_blank" rel="noopener noreferrer" className={styles.infoValLinkAccent}>
                            Visitar web oficial →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Services */}
                  <div className={styles.detailsCol}>
                    <h4 className={styles.colTitle}>Servicios Disponibles</h4>
                    <div className={styles.servicesDetailsList}>
                      {activeDealerObj.services.map((service) => {
                        const serviceLabels = {
                          venta: { title: "Venta de Nuevos", desc: "Vehículos 0km Legendary Motorsport.", dot: styles.dotRed },
                          servicios: { title: "Taller Oficial", desc: "Servicio técnico oficial homologado.", dot: styles.dotBlue },
                          repuestos: { title: "Repuestos Originales", desc: "Venta directa de accesorios de fábrica.", dot: styles.dotGreen },
                          seminuevos: { title: "Seminuevos Certificados", desc: "Autos de segundo uso garantizados.", dot: styles.dotYellow },
                          carroceria: { title: "Chapa y Pintura", desc: "Centro de enderezado y pintura Premium.", dot: styles.dotPurple }
                        };
                        const info = serviceLabels[service as keyof typeof serviceLabels];
                        return (
                          <div key={service} className={styles.serviceDetailItem}>
                            <span className={`${styles.serviceDot} ${info.dot}`}></span>
                            <div>
                              <p className={styles.serviceDetailTitle}>{info.title}</p>
                              <p className={styles.serviceDetailDesc}>{info.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className={styles.ctaWrapper}>
                      <a href={`/drive?dealer=${activeDealerObj.id}`} className={styles.ctaPrimaryButton}>
                        🏎️ Agendar Prueba de Manejo
                      </a>
                    </div>
                  </div>

                  {/* Column 3: Contact Form */}
                  <div className={styles.detailsCol}>
                    <h4 className={styles.colTitle}>Consulta Rápida</h4>
                    {inquiryStatus === "success" ? (
                      <div className={styles.formSuccess}>
                        <div className={styles.successIcon}>✓</div>
                        <h5>¡Mensaje Enviado!</h5>
                        <p>Nos pondremos en contacto contigo en menos de 24 horas hábiles.</p>
                        <button
                          type="button"
                          className={styles.resetFormBtn}
                          onClick={() => setInquiryStatus("idle")}
                        >
                          Enviar otra consulta
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!inquiryName || !inquiryEmail) return;
                          setInquiryStatus("sending");
                          setTimeout(() => {
                            setInquiryStatus("success");
                          }, 1000);
                        }}
                        className={styles.inquiryForm}
                      >
                        <div className={styles.formGroup}>
                          <input
                            type="text"
                            placeholder="Nombre y Apellido"
                            value={inquiryName}
                            onChange={(e) => setInquiryName(e.target.value)}
                            required
                            className={styles.formInput}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={inquiryEmail}
                            onChange={(e) => setInquiryEmail(e.target.value)}
                            required
                            className={styles.formInput}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <textarea
                            placeholder="¿En qué podemos ayudarte? (Ej: cotización, cita...)"
                            value={inquiryMsg}
                            onChange={(e) => setInquiryMsg(e.target.value)}
                            rows={3}
                            className={styles.formTextArea}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={inquiryStatus === "sending" || !inquiryName || !inquiryEmail}
                          className={styles.formSubmitBtn}
                        >
                          {inquiryStatus === "sending" ? "Enviando..." : "Enviar Solicitud"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
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
