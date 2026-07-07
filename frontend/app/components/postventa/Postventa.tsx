"use client";

import { useState, useRef, FormEvent } from "react";
import Header from "../header/Header";
import styles from "./Postventa.module.css";

interface VinHistoryEntry {
  vin: string;
  status: "success" | "warning" | "info";
  timestamp: string;
}

interface ChatMessage {
  sender: "user" | "system" | "benny" | "simeon";
  text: string;
  timestamp: string;
}

const VEHICLES = [
  "Pegassi Osiris",
  "Grotti Turismo R",
  "Truffade Adder",
  "Pegassi Zentorno",
  "Progen T20",
  "Overflod Entity XF",
  "Dewbauchee Vagner",
];

const WORKSHOPS = [
  "Legendary Motorsport HQ (Rockford Hills)",
  "Los Santos Customs (Burton)",
  "Los Santos Customs (LSIA)",
  "Benny's Original Motor Works (Strawberry)",
];

const SERVICES = [
  "Mantenimiento de Alto Rendimiento (Preventivo)",
  "Planchado, Pintura y Restauración de Chasis",
  "Actualización de Blindaje y Neumáticos a Prueba de Balas",
  "Inspección de Campaña de Seguridad (Recall)",
];

const BASE_TIME_SLOTS = [
  { time: "09:00 AM", available: true },
  { time: "10:30 AM", available: false },
  { time: "12:00 PM", available: true },
  { time: "01:30 PM", available: true },
  { time: "03:00 PM", available: false },
  { time: "04:30 PM", available: true },
];

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

  // Booking Form State
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [availableSlots, setAvailableSlots] = useState(BASE_TIME_SLOTS);
  const [formData, setFormData] = useState({
    vehiculo: VEHICLES[0],
    taller: WORKSHOPS[0],
    tipoServicio: SERVICES[0],
    fecha: "",
    hora: "09:00 AM",
    nombre: "",
    email: "",
    telefono: "",
  });

  // FAQ Category Filter States
  const [faqCategory, setFaqCategory] = useState<"all" | "warranty" | "tuning" | "safety">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live Chat Simulator States
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: "system",
      text: "Hola. Bienvenido al canal de soporte oficial de Legendary Motorsport. ¿En qué podemos ayudarte hoy?",
      timestamp: "12:00 PM",
    },
  ]);

  // Section Refs for Smooth Scrolling
  const vinRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);

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

  const handleDateChange = (dateVal: string) => {
    setFormData((prev) => ({ ...prev, fecha: dateVal }));
    const shuffled = BASE_TIME_SLOTS.map((slot) => {
      const isWeekend = new Date(dateVal).getDay() % 6 === 0;
      if (isWeekend && (slot.time.includes("03:00") || slot.time.includes("04:30"))) {
        return { ...slot, available: false };
      }
      return {
        ...slot,
        available: Math.random() > 0.4,
      };
    });
    setAvailableSlots(shuffled);
  };

  const handleBookingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.fecha) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    const rand = Math.floor(1000 + Math.random() * 9000);
    setBookingCode(`LMS-BK-${rand}`);
    setBookingSubmitted(true);
  };

  const resetBooking = () => {
    setBookingSubmitted(false);
    setFormData({
      vehiculo: VEHICLES[0],
      taller: WORKSHOPS[0],
      tipoServicio: SERVICES[0],
      fecha: "",
      hora: "09:00 AM",
      nombre: "",
      email: "",
      telefono: "",
    });
  };

  const scrollToSection = (elementRef: React.RefObject<HTMLDivElement | null>) => {
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg, timestamp }]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      let sender: "benny" | "simeon" | "system" = "system";

      const lower = userMsg.toLowerCase();
      if (
        lower.includes("benny") ||
        lower.includes("taller") ||
        lower.includes("personalizar") ||
        lower.includes("pintura") ||
        lower.includes("color") ||
        lower.includes("llanta") ||
        lower.includes("tuning") ||
        lower.includes("motor") ||
        lower.includes("turbo")
      ) {
        sender = "benny";
        reply = "¡Qué tal hermano! Hablas con Benny. En el taller de Strawberry nos especializamos en dejar las naves flotando. Si quieres pinturas camaleónicas o rines cromados custom, agenda tu cita y yo mismo me encargo de mimar esa nave. ¡Nos vemos!";
      } else if (
        lower.includes("simeon") ||
        lower.includes("precio") ||
        lower.includes("dinero") ||
        lower.includes("garantia") ||
        lower.includes("pagar") ||
        lower.includes("comprar") ||
        lower.includes("mors") ||
        lower.includes("seguro")
      ) {
        sender = "simeon";
        reply = "¿Amigo mío? ¡Hablas con Simeon Yetarian! Has tomado una excelente decisión al confiar en mí. La garantía Legend Shield es fantástica para el negocio... digo, para tu seguridad. Asegúrate de pagar tu prima a tiempo y tu hipercoche será eterno.";
      } else {
        reply = "Gracias por su consulta. Si su duda está relacionada con campañas de seguridad o recalls, por favor utilice el verificador de VIN arriba. Para agendar mantenimiento, use el formulario de reserva prioritaria.";
      }

      setChatMessages((prev) => [...prev, { sender, text: reply, timestamp }]);
      setIsTyping(false);
    }, 1500);
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
    let protection = 25;
    let weightPenalty = 0;
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

  // FAQ list with categories
  const FAQ_ITEMS = [
    {
      category: "tuning",
      question: "¿Cada cuánto debo realizar el mantenimiento preventivo de mi hipercoche?",
      answer: (
        <>
          Recomendamos ingresar tu vehículo a taller cada 5,000 km o después de escapar de persecuciones policiales intensas de 5 estrellas. El desgaste de neumáticos de alta velocidad y turbocompresores debe ser monitoreado. Puedes{" "}
          <button
            type="button"
            onClick={() => scrollToSection(bookingRef)}
            className={styles.faqLink}
          >
            agendar tu cita en taller ahora mismo
          </button>.
        </>
      ),
    },
    {
      category: "warranty",
      question: "¿Qué es la cobertura de garantía 'Legend Shield' y qué incluye?",
      answer: (
        <>
          Es nuestra garantía premium exclusiva de fábrica que cubre el 100% de desperfectos mecánicos, calibración de transmisiones de doble embrague, fallos de inyección de nitroso y reparaciones de fibra de carbono. Nota: No cubre daños provocados por colisiones contra trenes de carga ni explosiones directas por RPG.
        </>
      ),
    },
    {
      category: "safety",
      question: "¿Las campañas de recall de airbag y blindaje tienen algún coste?",
      answer: (
        <>
          No. Todas las campañas de recall oficiales y mejoras de seguridad son financiadas íntegramente por Legendary Motorsport y se realizan de manera gratuita en cualquiera de nuestros talleres autorizados. Te recomendamos{" "}
          <button
            type="button"
            onClick={() => scrollToSection(vinRef)}
            className={styles.faqLink}
          >
            verificar el VIN de tu chasis
          </button>{" "}
          para descartar campañas pendientes.
        </>
      ),
    },
    {
      category: "tuning",
      question: "¿Puedo personalizar la pintura de mi auto durante un servicio de planchado y pintura?",
      answer: (
        <>
          Por supuesto. Disponemos de la gama de pinturas premium más avanzada del mercado, incluyendo acabados nacarados, mate, camaleónicos exclusivos y cromados de alta reflectividad. Puedes programarlo seleccionando la opción respectiva en el formulario de citas.
        </>
      ),
    },
  ];

  const filteredFaqs = FAQ_ITEMS.filter((item) => faqCategory === "all" || item.category === faqCategory);

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
              onClick={() => scrollToSection(bookingRef)}
            >
              Agendar Cita en Taller
            </button>
            <button 
              type="button" 
              className={styles.btnSecondary}
              onClick={() => scrollToSection(vinRef)}
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

      {/* Interactive Booking Appointment Section */}
      <section ref={bookingRef} className={styles.bookingSection}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Agenda tu Cita en Taller</h2>
          <p className={styles.sectionSubtitle}>Reserva un turno preferente en el concesionario y taller de tu elección.</p>
        </div>

        <div className={styles.bookingLayout}>
          {!bookingSubmitted ? (
            <form onSubmit={handleBookingSubmit} className={styles.bookingForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Selecciona tu Vehículo</label>
                  <select
                    value={formData.vehiculo}
                    onChange={(e) => setFormData({ ...formData, vehiculo: e.target.value })}
                    className={styles.select}
                  >
                    {VEHICLES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Selecciona el Taller Sucursal</label>
                  <select
                    value={formData.taller}
                    onChange={(e) => setFormData({ ...formData, taller: e.target.value })}
                    className={styles.select}
                  >
                    {WORKSHOPS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Servicio Requerido</label>
                  <select
                    value={formData.tipoServicio}
                    onChange={(e) => setFormData({ ...formData, tipoServicio: e.target.value })}
                    className={styles.select}
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha Deseada *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={styles.input}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Time Slots Grid Selection */}
              {formData.fecha && (
                <div className={styles.slotSection}>
                  <label className={styles.label}>Horarios Disponibles para esta Fecha</label>
                  <div className={styles.slotsGrid}>
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setFormData({ ...formData, hora: slot.time })}
                        className={`${styles.slotBtn} ${
                          formData.hora === slot.time ? styles.slotBtnSelected : ""
                        } ${!slot.available ? styles.slotBtnDisabled : ""}`}
                      >
                        {slot.time}
                        {!slot.available && <span className={styles.slotBadge}>Ocupado</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.formGrid} style={{ marginTop: "20px" }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Franklin Clinton"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Número Telefónico</label>
                  <input
                    type="tel"
                    placeholder="555-0199"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>

              <button type="submit" className={styles.btnSubmit} style={{ marginTop: "24px" }}>
                Confirmar Reserva
              </button>
            </form>
          ) : (
            <div className={styles.successCard}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>¡Reserva Confirmada Exitosamente!</h3>
              <p className={styles.successText}>
                Su turno ha sido agendado. Presente este pase VIP en el taller seleccionado 
                para recibir atención inmediata sin esperas.
              </p>

              <div className={styles.detailsBox}>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Código Cita</span>
                  <span className={styles.detailsVal} style={{ color: "var(--accent)", fontWeight: "bold" }}>
                    {bookingCode}
                  </span>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Vehículo</span>
                  <span className={styles.detailsVal}>{formData.vehiculo}</span>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Taller Sucursal</span>
                  <span className={styles.detailsVal}>{formData.taller}</span>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Servicio</span>
                  <span className={styles.detailsVal}>{formData.tipoServicio}</span>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Fecha / Hora</span>
                  <span className={styles.detailsVal}>{formData.fecha} a las {formData.hora}</span>
                </div>
                <div className={styles.detailsRow}>
                  <span className={styles.detailsLabel}>Cliente</span>
                  <span className={styles.detailsVal}>{formData.nombre}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button type="button" onClick={() => window.print()} className={styles.btnPrimary}>
                  🖨️ Imprimir Pase VIP
                </button>
                <button type="button" onClick={resetBooking} className={styles.btnSecondary}>
                  Agendar Otra Cita
                </button>
              </div>
            </div>
          )}

          {/* Real-time VIP Ticket Preview Side Card */}
          {!bookingSubmitted && (
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewBrand}>LEGENDARY MOTORSPORT</span>
                <span className={styles.previewBadge}>VIP PASS</span>
              </div>
              <div className={styles.previewContent}>
                <div className={styles.previewMain}>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>PROPIETARIO</span>
                    <span className={styles.previewVal}>{formData.nombre || "INTRUSO ANÓNIMO"}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>HIPERCOCHE</span>
                    <span className={styles.previewVal}>{formData.vehiculo}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>DESTINO TALLER</span>
                    <span className={styles.previewVal}>{formData.taller}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>RESERVA FECHA</span>
                    <span className={styles.previewVal}>{formData.fecha || "FECHA PENDIENTE"}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>HORA TURNO</span>
                    <span className={styles.previewVal}>{formData.hora}</span>
                  </div>
                </div>
                <div className={styles.previewBarcode}>
                  <div className={styles.barcodeLines}></div>
                  <span className={styles.barcodeText}>LMS-VIP-CHECK-IN</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Accordion FAQ Section with Category Filter Tabs */}
      <section className={styles.faqSection}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
          <p className={styles.sectionSubtitle}>Filtra por categoría y resuelve tus dudas sobre el servicio oficial.</p>
        </div>

        {/* Category tabs */}
        <div className={styles.faqTabs}>
          <button
            type="button"
            className={`${styles.faqTab} ${faqCategory === "all" ? styles.faqTabActive : ""}`}
            onClick={() => { setFaqCategory("all"); setOpenFaq(null); }}
          >
            Todos
          </button>
          <button
            type="button"
            className={`${styles.faqTab} ${faqCategory === "warranty" ? styles.faqTabActive : ""}`}
            onClick={() => { setFaqCategory("warranty"); setOpenFaq(null); }}
          >
            Garantía y Seguros
          </button>
          <button
            type="button"
            className={`${styles.faqTab} ${faqCategory === "tuning" ? styles.faqTabActive : ""}`}
            onClick={() => { setFaqCategory("tuning"); setOpenFaq(null); }}
          >
            Mantenimiento y Tuning
          </button>
          <button
            type="button"
            className={`${styles.faqTab} ${faqCategory === "safety" ? styles.faqTabActive : ""}`}
            onClick={() => { setFaqCategory("safety"); setOpenFaq(null); }}
          >
            Campañas y Recall
          </button>
        </div>

        <div className={styles.accordion}>
          {filteredFaqs.map((item, idx) => {
            const isActive = openFaq === idx;
            return (
              <div
                key={idx}
                className={`${styles.accordionItem} ${isActive ? styles.accordionItemActive : ""}`}
              >
                <button
                  type="button"
                  className={styles.accordionHeader}
                  onClick={() => setOpenFaq(isActive ? null : idx)}
                >
                  <span>{item.question}</span>
                  <span className={`${styles.arrow} ${isActive ? styles.arrowRotated : ""}`}>
                    ▼
                  </span>
                </button>
                <div
                  className={`${styles.accordionContent} ${
                    isActive ? styles.accordionContentActive : ""
                  }`}
                >
                  <div className={styles.accordionText}>{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Support Contact Info & Live Chat Simulator */}
      <section className={styles.contactSection}>
        <div className={styles.sectionTitleBlock}>
          <h2 className={styles.sectionTitle}>Atención al Cliente Postventa</h2>
          <p className={styles.sectionSubtitle}>¿Tienes preguntas adicionales? Consúltanos directamente o chatea con soporte.</p>
        </div>

        <div className={styles.contactLayout}>
          {/* Left: Contact Info Cards */}
          <div className={styles.contactInfo}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>📞</div>
              <div className={styles.contactLabel}>Línea Directa</div>
              <div className={styles.contactValue}>555-0100 (WhatsApp)</div>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>✉️</div>
              <div className={styles.contactLabel}>Soporte Oficial</div>
              <div className={styles.contactValue}>
                <a href="mailto:soporte@legendarymotorsport.com" className={styles.contactLink}>
                  soporte@legendarymotorsport.com
                </a>
              </div>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>🗺️</div>
              <div className={styles.contactLabel}>Oficina Central</div>
              <div className={styles.contactValue}>Rockford Hills, Los Santos</div>
            </div>
          </div>

          {/* Right: Live Chat Widget Simulator */}
          <div className={styles.chatWidget}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <span className={styles.chatDot}></span>
                <span className={styles.chatTitle}>Asistente de Soporte Legendary</span>
              </div>
              <span className={styles.chatStatus}>Canal Seguro</span>
            </div>

            <div className={styles.chatBody}>
              {chatMessages.map((msg, index) => {
                let senderName = "Soporte";
                let senderClass = styles.chatMsgSystem;

                if (msg.sender === "user") {
                  senderName = "Tú";
                  senderClass = styles.chatMsgUser;
                } else if (msg.sender === "benny") {
                  senderName = "Benny (Original Motor Works)";
                  senderClass = styles.chatMsgBenny;
                } else if (msg.sender === "simeon") {
                  senderName = "Simeon Yetarian (Premium Deluxe)";
                  senderClass = styles.chatMsgSimeon;
                }

                return (
                  <div key={index} className={`${styles.chatMessage} ${senderClass}`}>
                    <div className={styles.chatMsgHeader}>
                      <span className={styles.chatMsgSender}>{senderName}</span>
                      <span className={styles.chatMsgTime}>{msg.timestamp}</span>
                    </div>
                    <p className={styles.chatMsgText}>{msg.text}</p>
                  </div>
                );
              })}

              {isTyping && (
                <div className={`${styles.chatMessage} ${styles.chatMsgSystem}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className={styles.chatForm}>
              <input
                type="text"
                placeholder="Escribe una pregunta (ej. 'Benny', 'Garantía', 'Taller')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className={styles.chatInput}
              />
              <button type="submit" className={styles.btnChatSend}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
