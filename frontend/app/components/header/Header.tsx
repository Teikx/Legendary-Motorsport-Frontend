"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Header.module.css";

const DEFAULT_NAME = "Camilo";

export default function Header() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(DEFAULT_NAME);

  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim();
    if (storedName) {
      setTimeout(() => setDisplayName(storedName), 0);
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
      <Link href="/catalog" className={styles.logoLink}>
        <div className={styles.titleBlock}>
          <span className={styles.subtitle}>Legendary MotorSport</span>
          <h1 className={styles.title}>Legendary MotorSport</h1>
        </div>
      </Link>

      <nav className={styles.navBar}>
        <Link href="/catalog" className={styles.navLink}>
          Catálogo
        </Link>
        <Link href="/drive" className={styles.navLink}>
          Prueba de Manejo
        </Link>
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

