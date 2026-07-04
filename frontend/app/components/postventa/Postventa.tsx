"use client";

import { useState, useRef, FormEvent } from "react";
import Header from "../header/Header";
import styles from "./Postventa.module.css";

interface VinHistoryEntry {
  vin: string;
  status: "success" | "warning" | "info";
  timestamp: string;
}

export default function Postventa() {
  // VIN Checker State
  const [vin, setVin] = useState("");
  const [vinResult, setVinResult] = useState<{
    status: "success" | "warning" | "info";
    message: string;
    inspectedParts?: { name: string; status: "OK" | "WARNING" }[];
  } | null>(null);
  const [searchHistory, setSearchHistory] = useState<VinHistoryEntry[]>([]);

  // Interactive Card Customizer States
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // Card 0: Puesta a Punto Customizer
  const [engineType, setEngineType] = useState<"v8" | "v12">("v8");
  const [ecuStage, setEcuStage] = useState<"stage1" | "stage2">("stage1");

  // Card 1: Paint & Armor
  const [paintColor, setPaintColor] = useState<"chameleon" | "matte" | "pearl">("chameleon");
  const [armorLevel, setArmorLevel] = useState<"light" | "heavy" | "combat">("light");

  // Card 2: Performance upgrades
  const [hasTurbo, setHasTurbo] = useState(false);
  const [hasBrakes, setHasBrakes] = useState(false);
  const [hasClutch, setHasClutch] = useState(false);

  // Card 3: Warranty insurance
  const [warrantyPlan, setWarrantyPlan] = useState<"basic" | "gold" | "platinum">("gold");

  // Section Refs for Smooth Scrolling
  const vinRef = useRef<HTMLDivElement>(null);

  const handleVinCheck = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const cleanVin = vin.trim().toUpperCase();

    if (cleanVin.length < 5) {
      setVinResult({
        status: "warning",
        message: "El código VIN ingresado es demasiado corto. Debe tener al menos 5 caracteres.",
      });
      return;
    }

    let result: {
      status: "success" | "warning" | "info";
      message: string;
      inspectedParts: { name: string; status: "OK" | "WARNING" }[];
    };

    if (cleanVin.includes("999") || cleanVin.includes("RECALL")) {
      result = {
        status: "warning",
        message: "¡Campaña Activa Detectada! Su vehículo califica para la campaña gratuita de actualización del sistema de despliegue de airbags de carreras y calibración del chip de rastreo satelital. Agende una cita de recall de inmediato.",
        inspectedParts: [
          { name: "Cápsula de Airbag Takata", status: "WARNING" },
          { name: "Módulo GPS Tracker", status: "WARNING" },
          { name: "Sensores de Colisión Frontal", status: "OK" },
          { name: "Presión del Sobrealimentador", status: "OK" },
        ],
      };
    } else if (cleanVin.includes("123") || cleanVin.includes("GOLD")) {
      result = {
        status: "success",
        message: "Vehículo al día. No se registran campañas de seguridad pendientes o recalls técnicos para el número de chasis ingresado.",
        inspectedParts: [
          { name: "Cápsula de Airbag Takata", status: "OK" },
          { name: "Módulo GPS Tracker", status: "OK" },
          { name: "Sensores de Colisión Frontal", status: "OK" },
          { name: "Frenos de Cerámica", status: "OK" },
        ],
      };
    } else {
      result = {
        status: "info",
        message: `El chasis ${cleanVin} se encuentra verificado. No hay campañas de recall críticas activas en este momento. Recomendamos una revisión preventiva regular.`,
        inspectedParts: [
          { name: "Cápsula de Airbag", status: "OK" },
          { name: "Frenos y Suspensión", status: "OK" },
          { name: "Presión de Turbinas", status: "OK" },
        ],
      };
    }

    setVinResult(result);

    // Save search history
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSearchHistory((prev) => [
      { vin: cleanVin, status: result.status, timestamp },
      ...prev.slice(0, 4), // Keep last 5 queries
    ]);
  };

  const handleGenerateTestVin = () => {
    const types = ["RECALL", "GOLD", "LMS"];
    const type = types[Math.floor(Math.random() * types.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const newVin = `GTA5-${type}-${num}`;
    setVin(newVin);
    setVinResult(null);
  };

  const handleFaqScroll = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simulating performance statistics calculation for Card 0 (Puesta a punto)
  const getPuestaAPuntoStats = () => {
    let hp = 740;
    let maxSpeed = 345;
    if (engineType === "v12") {
      hp += 210;
      maxSpeed += 25;
    }
    if (ecuStage === "stage2") {
      hp += 90;
      maxSpeed += 15;
    }
    return { hp, maxSpeed };
  };

  // Simulating Armor & Weight calculation for Card 1 (Blindaje y Pintura)
  const getArmorStats = () => {
    let protection = 25; // in %
    let weightPenalty = 0; // in kg
    if (armorLevel === "heavy") {
      protection = 65;
      weightPenalty = 180;
    } else if (armorLevel === "combat") {
      protection = 95;
      weightPenalty = 350;
    }
    return { protection, weightPenalty };
  };

  // Simulating upgrades stats for Card 2 (Repuestos)
  const getUpgradeStats = () => {
    let speedBonus = 0;
    let accelBonus = 0;
    let brakeBonus = 0;
    if (hasTurbo) {
      speedBonus += 15;
      accelBonus += 30;
    }
    if (hasBrakes) {
      brakeBonus += 40;
    }
    if (hasClutch) {
      accelBonus += 15;
    }
    return { speedBonus, accelBonus, brakeBonus };
  };

  // Simulating price for Warranty Card 3 (Garantía)
  const getWarrantyInfo = () => {
    if (warrantyPlan === "basic") {
      return { cost: 1200, label: "Cobertura de colisión básica, fallos del bloque motor estándar." };
    } else if (warrantyPlan === "gold") {
      return { cost: 2800, label: "Daños balísticos leves, sobrecalentamiento de turbos y asistencia VIP 24/7." };
    } else {
      return { cost: 5500, label: "Seguro total contra asaltos, destrucción militar, reemplazo express de chasis de fibra de carbono." };
    }
  };

  const currentTuning = getPuestaAPuntoStats();
  const currentArmor = getArmorStats();
  const currentUpgrades = getUpgradeStats();
  const currentWarranty = getWarrantyInfo();

  return (
    <div className={styles.container}>
      <Header />

      {/* Hero Banner Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Postventa y Servicios Oficiales</span>
          <h1 className={styles.heroTitle}>Cuidado de Élite Para Tu Hipercoche</h1>
          <p className={styles.heroSubtitle}>
            En Legendary Motorsport no solo vendemos los autos más veloces del planeta; 
            nos aseguramos de que sigan siéndolo. Experimenta un servicio técnico cinco estrellas 
            en nuestros talleres autorizados de Los Santos.
          </p>
          <div className={styles.heroActions}>
            <button 
              type="button" 
              className={styles.btnPrimary}
            >
              Agendar Cita en Taller
            </button>
            <button 
              type="button" 
              className={styles.btnSecondary}
              onClick={() => handleFaqScroll(vinRef)}
            >
              Verificar Campañas de Seguridad
            </button>
          </div>
        </div>
      </section>

      {/* Core Services Cards */}
      <section className={styles.servicesSection}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Servicios Postventa</h2>
          <p className={styles.sectionSubtitle}>
            Haz clic en cualquiera de nuestras tarjetas para abrir el configurador interactivo de servicio y estimar tus especificaciones técnicas.
          </p>
        </div>

        <div className={styles.servicesGrid}>
          {/* Card 0: Puesta a Punto */}
          <div 
            className={`${styles.serviceCard} ${activeCard === 0 ? styles.serviceCardActive : ""}`}
            onClick={() => setActiveCard(activeCard === 0 ? null : 0)}
          >
            <div className={styles.iconWrapper}>⚙️</div>
            <h3 className={styles.cardTitle}>Puesta a Punto</h3>
            <p className={styles.cardDescription}>
              Optimización del motor de inducción forzada, balanceo de alerones activos, 
              puesta a punto electrónica y cambio de aceite de alto rendimiento para competición.
            </p>
            <span className={styles.expandLabel}>
              {activeCard === 0 ? "Ocultar configurador ▲" : "Configurar motor interactivo ▼"}
            </span>

            {activeCard === 0 && (
              <div className={styles.cardWidget} onClick={(e) => e.stopPropagation()}>
                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Bloque Motor</label>
                  <div className={styles.btnGroup}>
                    <button 
                      type="button" 
                      className={engineType === "v8" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setEngineType("v8")}
                    >
                      V8 Supercharged
                    </button>
                    <button 
                      type="button" 
                      className={engineType === "v12" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setEngineType("v12")}
                    >
                      V12 Twin-Turbo
                    </button>
                  </div>
                </div>

                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Calibración ECU</label>
                  <div className={styles.btnGroup}>
                    <button 
                      type="button" 
                      className={ecuStage === "stage1" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setEcuStage("stage1")}
                    >
                      Stage 1 (Street)
                    </button>
                    <button 
                      type="button" 
                      className={ecuStage === "stage2" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setEcuStage("stage2")}
                    >
                      Stage 2 (Racing)
                    </button>
                  </div>
                </div>

                <div className={styles.widgetStats}>
                  <div className={styles.statRow}>
                    <span>Potencia Estimada:</span>
                    <span className={styles.statVal}>{currentTuning.hp} HP</span>
                  </div>
                  <div className={styles.statRow}>
                    <span>Velocidad Máxima:</span>
                    <span className={styles.statVal}>{currentTuning.maxSpeed} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 1: Blindaje y Pintura */}
          <div 
            className={`${styles.serviceCard} ${activeCard === 1 ? styles.serviceCardActive : ""}`}
            onClick={() => setActiveCard(activeCard === 1 ? null : 1)}
          >
            <div className={styles.iconWrapper}>🎨</div>
            <h3 className={styles.cardTitle}>Blindaje y Pintura</h3>
            <p className={styles.cardDescription}>
              Reparación de carrocería en fibra de carbono autoclave, pinturas perladas exclusivas de 
              edición limitada y restauración de placas de blindaje balístico compuestos.
            </p>
            <span className={styles.expandLabel}>
              {activeCard === 1 ? "Ocultar configurador ▲" : "Configurar blindaje y color ▼"}
            </span>

            {activeCard === 1 && (
              <div className={styles.cardWidget} onClick={(e) => e.stopPropagation()}>
                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Acabado de Pintura</label>
                  <select 
                    value={paintColor} 
                    onChange={(e) => setPaintColor(e.target.value as any)} 
                    className={styles.widgetSelect}
                  >
                    <option value="chameleon">Oro Camaleónico (Chameleon)</option>
                    <option value="matte">Negro Medianoche Mate (Midnight Matte)</option>
                    <option value="pearl">Carbono Perlado Reflectivo</option>
                  </select>
                </div>

                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Nivel de Blindaje</label>
                  <div className={styles.btnGroup}>
                    <button 
                      type="button" 
                      className={armorLevel === "light" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setArmorLevel("light")}
                    >
                      Kevlar Liviano
                    </button>
                    <button 
                      type="button" 
                      className={armorLevel === "heavy" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setArmorLevel("heavy")}
                    >
                      Acero Pesado
                    </button>
                    <button 
                      type="button" 
                      className={armorLevel === "combat" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setArmorLevel("combat")}
                    >
                      Escudo de Combate
                    </button>
                  </div>
                </div>

                <div className={styles.widgetStats}>
                  <div className={styles.statRow}>
                    <span>Protección Balística:</span>
                    <span className={styles.statVal}>{currentArmor.protection}%</span>
                  </div>
                  <div className={styles.statRow}>
                    <span>Penalización de Peso:</span>
                    <span className={styles.statVal}>+{currentArmor.weightPenalty} kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Repuestos de Fábrica */}
          <div 
            className={`${styles.serviceCard} ${activeCard === 2 ? styles.serviceCardActive : ""}`}
            onClick={() => setActiveCard(activeCard === 2 ? null : 2)}
          >
            <div className={styles.iconWrapper}>🏎️</div>
            <h3 className={styles.cardTitle}>Repuestos de Fábrica</h3>
            <p className={styles.cardDescription}>
              Acceso exclusivo a turbocompresores originales, frenos de cerámica y carbono Brembo, 
              neumáticos reforzados y suspensiones regulables de competición.
            </p>
            <span className={styles.expandLabel}>
              {activeCard === 2 ? "Ocultar configurador ▲" : "Simular mejoras de partes ▼"}
            </span>

            {activeCard === 2 && (
              <div className={styles.cardWidget} onClick={(e) => e.stopPropagation()}>
                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Agregar Componentes de Rendimiento</label>
                  <div className={styles.checkboxList}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={hasTurbo} 
                        onChange={(e) => setHasTurbo(e.target.checked)} 
                        className={styles.widgetCheckbox} 
                      />
                      Turbocompresor de Carreras (+Velocidad)
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={hasBrakes} 
                        onChange={(e) => setHasBrakes(e.target.checked)} 
                        className={styles.widgetCheckbox} 
                      />
                      Frenos de Carbono-Cerámica (+Frenado)
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        checked={hasClutch} 
                        onChange={(e) => setHasClutch(e.target.checked)} 
                        className={styles.widgetCheckbox} 
                      />
                      Embrague de Competición (+Aceleración)
                    </label>
                  </div>
                </div>

                <div className={styles.widgetStats}>
                  <div className={styles.statRow}>
                    <span>Bono Aceleración:</span>
                    <span className={styles.statVal}>+{currentUpgrades.accelBonus}%</span>
                  </div>
                  <div className={styles.statRow}>
                    <span>Bono Capacidad Frenado:</span>
                    <span className={styles.statVal}>+{currentUpgrades.brakeBonus}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Garantía Legend Shield */}
          <div 
            className={`${styles.serviceCard} ${activeCard === 3 ? styles.serviceCardActive : ""}`}
            onClick={() => setActiveCard(activeCard === 3 ? null : 3)}
          >
            <div className={styles.iconWrapper}>🛡️</div>
            <h3 className={styles.cardTitle}>Garantía Legend Shield</h3>
            <p className={styles.cardDescription}>
              Protección mecánica completa de motor, caja de cambios y chasis de fibra de carbono. 
              Garantía contra corrosión extrema y fallos de suspensión activa.
            </p>
            <span className={styles.expandLabel}>
              {activeCard === 3 ? "Ocultar configurador ▲" : "Calcular plan de cobertura ▼"}
            </span>

            {activeCard === 3 && (
              <div className={styles.cardWidget} onClick={(e) => e.stopPropagation()}>
                <div className={styles.widgetGroup}>
                  <label className={styles.widgetLabel}>Seleccionar Plan de Cobertura</label>
                  <div className={styles.btnGroup}>
                    <button 
                      type="button" 
                      className={warrantyPlan === "basic" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setWarrantyPlan("basic")}
                    >
                      Básico
                    </button>
                    <button 
                      type="button" 
                      className={warrantyPlan === "gold" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setWarrantyPlan("gold")}
                    >
                      Oro (VIP)
                    </button>
                    <button 
                      type="button" 
                      className={warrantyPlan === "platinum" ? styles.widgetBtnActive : styles.widgetBtn}
                      onClick={() => setWarrantyPlan("platinum")}
                    >
                      Platino Total
                    </button>
                  </div>
                </div>

                <div className={styles.warrantyBox}>
                  <p className={styles.warrantyDescription}>{currentWarranty.label}</p>
                  <div className={styles.statRow}>
                    <span>Cuota Trimestral Estimada:</span>
                    <span className={styles.statVal}>${currentWarranty.cost} USD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive VIN Recall Checker */}
      <section ref={vinRef} className={styles.vinSection}>
        <div className={styles.vinLayout}>
          <div className={styles.vinIntro}>
            <h2>Campañas de Recall y Seguridad</h2>
            <p>
              La seguridad de nuestros conductores es nuestra máxima prioridad. Constantemente realizamos mejoras 
              y revisiones técnicas de seguridad de forma gratuita. Ingrese el número VIN de su chasis para verificar 
              si su modelo califica para alguna actualización activa.
            </p>
            <div className={styles.vinExamples}>
              <span>Pruebe con estos chasis precargados:</span>
              <div className={styles.presetVinGrid}>
                <button 
                  type="button" 
                  onClick={() => { setVin("GTA5-RECALL-999"); setVinResult(null); }}
                  className={styles.presetVinBtn}
                >
                  Recall Airbags (GTA5-RECALL-999)
                </button>
                <button 
                  type="button" 
                  onClick={() => { setVin("GTA5-GOLD-123"); setVinResult(null); }}
                  className={styles.presetVinBtn}
                >
                  Seguro/Al Día (GTA5-GOLD-123)
                </button>
              </div>
              <button 
                type="button" 
                onClick={handleGenerateTestVin} 
                className={styles.generateVinBtn}
              >
                🎲 Generar VIN de Prueba Aleatorio
              </button>
            </div>
          </div>

          <div>
            <form onSubmit={handleVinCheck} className={styles.vinForm}>
              <input
                type="text"
                placeholder="Ingrese el VIN del Vehículo (Chasis)..."
                value={vin}
                onChange={(e) => {
                  setVin(e.target.value);
                  setVinResult(null);
                }}
                className={styles.vinInput}
              />
              <button type="submit" className={styles.btnSearch}>
                Buscar
              </button>
            </form>

            {vinResult && (
              <div 
                className={`${styles.vinResult} ${
                  vinResult.status === "success" 
                    ? styles.vinResultSuccess 
                    : vinResult.status === "warning" 
                      ? styles.vinResultWarning 
                      : styles.vinResultInfo
                }`}
              >
                <p className={styles.resultText}>{vinResult.message}</p>
                {vinResult.inspectedParts && (
                  <div className={styles.inspectedGrid}>
                    <p className={styles.inspectedTitle}>Desglose del Diagnóstico:</p>
                    {vinResult.inspectedParts.map((part, index) => (
                      <div key={index} className={styles.inspectedItem}>
                        <span>{part.name}:</span>
                        <span className={part.status === "OK" ? styles.statusOk : styles.statusWarning}>
                          {part.status === "OK" ? "✓ Operativo" : "⚠ Requiere Recall"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Session Search History Log */}
            {searchHistory.length > 0 && (
              <div className={styles.historyContainer}>
                <h4 className={styles.historyTitle}>Consultas Recientes (Esta Sesión)</h4>
                <div className={styles.historyList}>
                  {searchHistory.map((item, idx) => (
                    <div key={idx} className={styles.historyItem} onClick={() => { setVin(item.vin); setVinResult(null); }}>
                      <span className={styles.historyVin}>{item.vin}</span>
                      <span className={styles.historyTime}>{item.timestamp}</span>
                      <span className={`${styles.historyBadge} ${
                        item.status === "success" 
                          ? styles.badgeSuccess 
                          : item.status === "warning" 
                            ? styles.badgeWarning 
                            : styles.badgeInfo
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
