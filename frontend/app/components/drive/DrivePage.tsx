"use client";

import { useState, useEffect } from "react";
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

export default function DrivePage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedVehicle, setSelectedVehicle] = useState<TestDriveVehicle>(VEHICLES_FOR_DRIVE[0]);

  // Form states (Paso 2)
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [licencia, setLicencia] = useState("");
  
  // Validation errors
  const [error, setError] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim();
    const storedEmail = localStorage.getItem("email")?.trim();
    const storedPhone = localStorage.getItem("telefono")?.trim();
    
    if (storedName) setNombre(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setTelefono(storedPhone);
  }, []);

  const validateStep2 = () => {
    if (!nombre.trim()) return "El nombre completo es obligatorio.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return "Ingresa un correo electrónico válido.";
    if (!telefono.trim()) return "El teléfono de contacto es obligatorio.";
    if (!licencia.trim()) return "El número de licencia de conducir es obligatorio.";
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
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
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
            <header className={styles.formHeader}>
              <h1 className={styles.title}>Prueba de Manejo</h1>
              <p className={styles.subtitle}>Experimenta el verdadero rendimiento en carretera</p>
            </header>

            {/* Indicador de pasos */}
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
              <div className={styles.stepContentPlaceholder}>
                <h3 className={styles.stepTitle}>Programar Cita</h3>
                <p className={styles.placeholderText}>
                  Aquí se presentará el selector de fecha, hora y ubicación (Próximo commit).
                </p>
              </div>
            )}

            {/* Paso 4: Confirmación */}
            {step === 4 && (
              <div className={styles.stepContentPlaceholder}>
                <h3 className={styles.stepTitle}>Confirmación</h3>
                <p className={styles.placeholderText}>
                  Aquí se presentará el resumen y la confirmación final (Próximo commit).
                </p>
              </div>
            )}

            {/* Mensaje de error general de validación */}
            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorIcon}>⚠</span>
                <span className={styles.errorMessage}>{error}</span>
              </div>
            )}

            {/* Barra de navegación de pasos */}
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
                disabled={step > 2} // Limitado temporalmente al paso 2 en este commit
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
