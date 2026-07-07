"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./DrivePage.module.css";
import Header from "../header/Header";

export interface TestDriveVehicle {
  id: string;
  brand: string;
  model: string;
  class: string;
  topSpeed: string;
  acceleration: string;
  image: string;
  description: string;
}

const VEHICLES_FOR_DRIVE: TestDriveVehicle[] = [
  {
    id: "grotti-turismo-r",
    brand: "Grotti",
    model: "Turismo R",
    class: "Superdeportivo",
    topSpeed: "340 km/h",
    acceleration: "2.8s",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    description: "Una obra maestra híbrida de diseño italiano y potencia bruta. Siente la fuerza g instantánea.",
  },
  {
    id: "pegassi-osiris",
    brand: "Pegassi",
    model: "Osiris",
    class: "Superdeportivo",
    topSpeed: "354 km/h",
    acceleration: "2.6s",
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80",
    description: "Sofisticación aerodinámica avanzada y tracción total para dominar cualquier curva de Los Santos.",
  },
  {
    id: "benefactor-schafter",
    brand: "Benefactor",
    model: "Schafter V12",
    class: "Sedán Deportivo",
    topSpeed: "290 km/h",
    acceleration: "3.9s",
    image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    description: "El rugido de un motor V12 envuelto en el lujo alemán más sobrio e intimidante.",
  },
  {
    id: "obey-9f",
    brand: "Obey",
    model: "9F Cabrio",
    class: "Deportivo",
    topSpeed: "320 km/h",
    acceleration: "3.1s",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
    description: "Diseño elegante y conducción precisa a cielo abierto. Siente el viento con estilo.",
  },
  {
    id: "pfister-comet-s2",
    brand: "Pfister",
    model: "Comet S2",
    class: "Deportivo",
    topSpeed: "325 km/h",
    acceleration: "3.0s",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
    description: "Motor trasero con una herencia legendaria de carreras. El deportivo definitivo para puristas.",
  },
  {
    id: "dewbauchee-vagner",
    brand: "Dewbauchee",
    model: "Vagner",
    class: "Hypercar",
    topSpeed: "362 km/h",
    acceleration: "2.4s",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
    description: "Nacido para romper récords de velocidad y gravedad. El futuro de la aerodinámica extrema.",
  },
];

interface LocationOption {
  id: string;
  name: string;
  address: string;
  description: string;
}

const LOCATIONS: LocationOption[] = [
  {
    id: "rockford-hills",
    name: "Rockford Hills Luxury",
    address: "Portola Drive, Rockford Hills",
    description: "Nuestra sucursal principal de lujo en Los Santos. Exclusiva para pruebas en ciudad y autopistas de alta gama.",
  },
  {
    id: "pillbox-hill",
    name: "Downtown Pillbox Hill",
    address: "San Andreas Blvd, Pillbox Hill",
    description: "Ubicación ideal para evaluar maniobrabilidad urbana y respuesta del motor en tráfico denso.",
  },
  {
    id: "ls-airport",
    name: "LS International Airport (Pista Privada)",
    address: "Hangar 4, Los Santos International Airport",
    description: "Nuestra pista de hangar privada y segura para exprimir la velocidad final de nuestros superdeportivos.",
  },
];

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "01:30 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
];

export default function DrivePage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<TestDriveVehicle>(VEHICLES_FOR_DRIVE[0]);

  // Form states (Paso 2)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [licencia, setLicencia] = useState("");
  
  // Form states (Paso 3)
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [sucursal, setSucursal] = useState("");

  // Step 4 state
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  
  // Validation errors
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim() || "";
    const storedEmail = localStorage.getItem("email")?.trim() || "";
    const storedPhone = localStorage.getItem("telefono")?.trim() || "";
    
    if (storedName) setNombre(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setTelefono(storedPhone);

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
            const phone = data.telefono ?? data.Telefono ?? "";
            const emailAddress = data.email ?? data.Email ?? "";
            
            if (firstName || lastName) {
              const fullName = `${firstName} ${lastName}`.trim();
              setNombre(fullName);
              localStorage.setItem("nombre", fullName);
            }
            if (phone) {
              setTelefono(phone);
              localStorage.setItem("telefono", phone);
            }
            if (emailAddress) {
              setEmail(emailAddress);
              localStorage.setItem("email", emailAddress);
            }
          }
        } catch (err) {
          console.error("Error loading customer in DrivePage:", err);
        }
      };
      void fetchClientInfo();
    }
  }, []);

  const validateStep2 = () => {
    if (!nombre.trim()) return "El nombre completo es obligatorio.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Ingresa un correo electrónico válido.";
    if (!telefono.trim()) return "El teléfono de contacto es obligatorio.";
    if (!licencia.trim()) return "El número de licencia de conducir es obligatorio.";
    return null;
  };

  const validateStep3 = () => {
    if (!fecha) return "Debes seleccionar una fecha para la prueba.";
    const selectedDate = new Date(fecha + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return "La fecha seleccionada no puede estar en el pasado.";
    if (!hora) return "Debes seleccionar un horario disponible.";
    if (!sucursal) return "Debes seleccionar una sucursal.";
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
      } else {
        setStep(3);
      }
    } else if (step === 3) {
      const err = validateStep3();
      if (err) {
        setError(err);
      } else {
        setStep(4);
      }
    } else if (step === 4) {
      if (!acceptTerms) {
        setError("Debes aceptar los términos y condiciones de la prueba de manejo.");
        return;
      }
      const code = "LM-" + Math.floor(100000 + Math.random() * 900000);
      setTicketCode(code);
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedVehicle(VEHICLES_FOR_DRIVE[0]);
    setLicencia("");
    setFecha("");
    setHora("");
    setSucursal("");
    setAcceptTerms(false);
    setTicketCode("");
    setError(null);
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.mainWrapper}>
        {/* Panel izquierdo: Visualizador Premium del Vehículo Seleccionado */}
        <section className={styles.previewPanel}>
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedVehicle.image}
              alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
              className={styles.heroImage}
            />
            <div className={styles.imageOverlay} />
            
            <div className={styles.vehicleInfoCard}>
              <span className={styles.badge}>{selectedVehicle.class}</span>
              <h2 className={styles.heroTitle}>
                {selectedVehicle.brand} <span className={styles.highlightText}>{selectedVehicle.model}</span>
              </h2>
              <p className={styles.heroDescription}>{selectedVehicle.description}</p>
              
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Velocidad Máx.</span>
                  <span className={styles.specValue}>{selectedVehicle.topSpeed}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>0-100 km/h</span>
                  <span className={styles.specValue}>{selectedVehicle.acceleration}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel derecho: Configuración y pasos */}
        <section className={styles.formPanel}>
          <div className={styles.formCard}>
            {/* Cabecera del formulario */}
            {step < 5 && (
              <header className={styles.formHeader}>
                <h1 className={styles.title}>Prueba de Manejo</h1>
                <p className={styles.subtitle}>Experimenta el verdadero rendimiento en carretera</p>
              </header>
            )}

            {/* Indicador de pasos */}
            {step < 5 && (
              <div className={styles.stepIndicator}>
                <div className={`${styles.stepNode} ${step >= 1 ? styles.stepActive : ""}`}>
                  <span className={styles.stepNumber}>1</span>
                  <span className={styles.stepLabelText}>Vehículo</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.stepNode} ${step >= 2 ? styles.stepActive : ""}`}>
                  <span className={styles.stepNumber}>2</span>
                  <span className={styles.stepLabelText}>Datos</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.stepNode} ${step >= 3 ? styles.stepActive : ""}`}>
                  <span className={styles.stepNumber}>3</span>
                  <span className={styles.stepLabelText}>Cita</span>
                </div>
                <div className={styles.stepLine} />
                <div className={`${styles.stepNode} ${step >= 4 ? styles.stepActive : ""}`}>
                  <span className={styles.stepNumber}>4</span>
                  <span className={styles.stepLabelText}>Confirmación</span>
                </div>
              </div>
            )}

            {/* Paso 1: Selección de Vehículo */}
            {step === 1 && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Selecciona tu modelo de prueba</h3>
                <div className={styles.vehicleGrid}>
                  {VEHICLES_FOR_DRIVE.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      className={`${styles.vehicleCard} ${
                        selectedVehicle.id === vehicle.id ? styles.vehicleCardActive : ""
                      }`}
                      onClick={() => setSelectedVehicle(vehicle)}
                    >
                      <div className={styles.cardHeader}>
                        <span className={styles.cardBrand}>{vehicle.brand}</span>
                        <span className={styles.cardModel}>{vehicle.model}</span>
                      </div>
                      <div className={styles.cardSpecMini}>
                        <span>{vehicle.class}</span>
                        <span className={styles.cardDot}>•</span>
                        <span>{vehicle.topSpeed}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 2: Datos de Contacto */}
            {step === 2 && (
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Datos del Conductor</h3>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="nombre">Nombre Completo</label>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Michael De Santa"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: michael@vinewood.com"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="telefono">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      id="telefono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej: 555-0199"
                      className={styles.formInput}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel} htmlFor="licencia">Número de Licencia de Conducir</label>
                    <input
                      type="text"
                      id="licencia"
                      value={licencia}
                      onChange={(e) => setLicencia(e.target.value)}
                      placeholder="Ej: L-38491823"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 3: Programar Cita */}
            {step === 3 && (
              <div className={styles.appointmentForm}>
                <h3 className={styles.stepTitle}>Programar Cita</h3>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="fecha">Fecha de la Prueba</label>
                  <input
                    type="date"
                    id="fecha"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.timeSection}>
                  <span className={styles.sectionLabel}>Horario Disponible</span>
                  <div className={styles.timeGrid}>
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`${styles.timeSlotButton} ${
                          hora === slot ? styles.timeSlotActive : ""
                        }`}
                        onClick={() => setHora(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.locationSection}>
                  <span className={styles.sectionLabel}>Selecciona una Sucursal</span>
                  <div className={styles.locationGrid}>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        className={`${styles.locationCard} ${
                          sucursal === loc.id ? styles.locationCardActive : ""
                        }`}
                        onClick={() => setSucursal(loc.id)}
                      >
                        <div className={styles.locationHeader}>
                          <span className={styles.locationName}>{loc.name}</span>
                        </div>
                        <span className={styles.locationAddress}>{loc.address}</span>
                        <p className={styles.locationDescription}>{loc.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Confirmación */}
            {step === 4 && (() => {
              const selectedLocation = LOCATIONS.find((loc) => loc.id === sucursal);
              return (
                <div className={styles.summaryContainer}>
                  <h3 className={styles.stepTitle}>Resumen de tu Reserva</h3>
                  
                  {/* Vehículo */}
                  <div className={styles.summarySection}>
                    <h4 className={styles.summarySubtitle}>Vehículo de Prueba</h4>
                    <div className={styles.summaryVehicleDetails}>
                      <p className={styles.summaryText}>
                        <strong>Modelo:</strong> {selectedVehicle.brand} {selectedVehicle.model}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Categoría:</strong> {selectedVehicle.class}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Prestaciones:</strong> Velocidad máxima de {selectedVehicle.topSpeed} (0-100 en {selectedVehicle.acceleration})
                      </p>
                    </div>
                  </div>

                  {/* Conductor */}
                  <div className={styles.summarySection}>
                    <h4 className={styles.summarySubtitle}>Datos del Conductor</h4>
                    <div className={styles.summaryGrid}>
                      <p className={styles.summaryText}>
                        <strong>Nombre:</strong> {nombre}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Licencia:</strong> {licencia}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Teléfono:</strong> {telefono}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Email:</strong> {email}
                      </p>
                    </div>
                  </div>

                  {/* Cita */}
                  <div className={styles.summarySection}>
                    <h4 className={styles.summarySubtitle}>Fecha y Ubicación</h4>
                    <div className={styles.summaryGrid}>
                      <p className={styles.summaryText}>
                        <strong>Fecha:</strong> {fecha}
                      </p>
                      <p className={styles.summaryText}>
                        <strong>Horario:</strong> {hora}
                      </p>
                      <p className={styles.summaryText} style={{ gridColumn: "span 2" }}>
                        <strong>Sucursal:</strong> {selectedLocation?.name}
                      </p>
                      <p className={styles.summaryText} style={{ gridColumn: "span 2" }}>
                        <strong>Dirección:</strong> {selectedLocation?.address}
                      </p>
                    </div>
                  </div>

                  {/* Términos y condiciones */}
                  <div className={styles.termsContainer}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxText}>
                        Acepto que poseo una licencia de conducir vigente y asumo la responsabilidad por cualquier daño material causado durante la prueba debido a conducción temeraria.
                      </span>
                    </label>
                  </div>
                </div>
              );
            })()}

            {/* Paso 5: Éxito */}
            {step === 5 && (() => {
              const selectedLocation = LOCATIONS.find((loc) => loc.id === sucursal);
              return (
                <div className={styles.successPanel}>
                  <header className={styles.successHeader}>
                    <div className={styles.successIconWrapper}>
                      <svg
                        className={styles.successIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2 className={styles.successTitle}>¡Cita Confirmada!</h2>
                    <p className={styles.successSubtitle}>
                      Tu prueba de manejo ha sido programada con éxito en Legendary Motorsport.
                    </p>
                  </header>

                  <div className={styles.ticketCard}>
                    <div className={styles.ticketHeader}>
                      <span className={styles.ticketLabel}>COMPROBANTE DE RESERVA</span>
                      <span className={styles.ticketCode}>{ticketCode}</span>
                    </div>
                    <div className={styles.ticketDivider} />
                    <div className={styles.ticketBody}>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Vehículo</span>
                        <span className={styles.ticketRowValue}>
                          {selectedVehicle.brand} {selectedVehicle.model}
                        </span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Sucursal</span>
                        <span className={styles.ticketRowValue}>{selectedLocation?.name}</span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Dirección</span>
                        <span className={styles.ticketRowValue}>{selectedLocation?.address}</span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Fecha</span>
                        <span className={styles.ticketRowValue}>{fecha}</span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Hora</span>
                        <span className={styles.ticketRowValue}>{hora}</span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Conductor</span>
                        <span className={styles.ticketRowValue}>{nombre}</span>
                      </div>
                      <div className={styles.ticketRow}>
                        <span className={styles.ticketRowLabel}>Licencia</span>
                        <span className={styles.ticketRowValue}>{licencia}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.instructionsBox}>
                    <h4 className={styles.instructionsTitle}>Instrucciones Importantes</h4>
                    <ul className={styles.instructionsList}>
                      <li>Llegar 15 minutos antes de la hora de tu cita.</li>
                      <li>Presentar tu Licencia de Conducir física ({licencia}).</li>
                      <li>Llevar calzado adecuado cerrado para conducción deportiva.</li>
                    </ul>
                  </div>

                  <div className={styles.successActions}>
                    <button
                      type="button"
                      onClick={handleReset}
                      className={styles.resetButton}
                    >
                      Nueva Reserva
                    </button>
                    <Link href="/catalog" className={styles.catalogButton}>
                      Volver al Catálogo
                    </Link>
                  </div>
                </div>
              );
            })()}

            {/* Mensaje de error general de validación */}
            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorIcon}>⚠</span>
                <span className={styles.errorMessage}>{error}</span>
              </div>
            )}

            {/* Barra de navegación de pasos */}
            {step < 5 && (
              <div className={styles.navigationActions}>
                {step > 1 && (
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handlePrevStep}
                  >
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={handleNextStep}
                >
                  {step === 4 ? "Confirmar Cita" : "Siguiente"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
