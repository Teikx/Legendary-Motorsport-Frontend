"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./Header.module.css";

const DEFAULT_NAME = "Camilo";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState(DEFAULT_NAME);

  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim();
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("idCliente");
    localStorage.removeItem("email");
    localStorage.removeItem("idRol");
    router.push("/");
  };

  return (
    <header className={styles.wrapper}>
      <div 
        className={styles.titleBlock} 
        onClick={() => router.push("/catalog")} 
        style={{ cursor: "pointer" }}
      >
        <span className={styles.subtitle}>Legendary MotorSport</span>
        <h1 className={styles.title}>Legendary MotorSport</h1>
      </div>
      <nav className={styles.navigation}>
        <button
          type="button"
          onClick={() => router.push("/catalog")}
          className={`${styles.navItem} ${pathname === "/catalog" ? styles.activeNav : ""}`}
        >
          Catálogo
        </button>
        <button
          type="button"
          onClick={() => router.push("/seguros")}
          className={`${styles.navItem} ${pathname === "/seguros" ? styles.activeNav : ""}`}
        >
          Seguros Vehiculares
        </button>
      </nav>
      <div className={styles.actions}>
        <button type="button" className={styles.userButton} onClick={handleLogout}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.logoutText}>Cerrar sesion</span>
        </button>
      </div>
    </header>
  );
}
