"use client";

import Header from "../header/Header";
import styles from "./Postventa.module.css";

export default function Postventa() {
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
            >
              Verificar Campañas de Seguridad
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
