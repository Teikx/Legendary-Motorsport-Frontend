"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Header.module.css";

const DEFAULT_NAME = "Usuario";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState(DEFAULT_NAME);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("nombre")?.trim();
    const storedEmail = localStorage.getItem("email")?.trim();
    const storedRole = localStorage.getItem("idRol")?.trim();
    setIsAdmin(storedRole === "1");

    if (storedName && storedName.length > 0) {
      setDisplayName(storedName);
    } else if (storedEmail && storedEmail.length > 0) {
      const emailPrefix = storedEmail.split("@")[0];
      const formattedName = emailPrefix
        .split(/[._-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setDisplayName(formattedName);
    } else {
      setDisplayName(DEFAULT_NAME);
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
      
      <nav className={styles.nav}>
        <Link href="/catalog" className={`${styles.navLink} ${pathname === "/catalog" ? styles.navLinkActive : ""}`}>
          Catálogo
        </Link>
        <Link href="/postventa" className={`${styles.navLink} ${pathname === "/postventa" ? styles.navLinkActive : ""}`}>
          Postventa
        </Link>
        <Link href="/concesionarios" className={`${styles.navLink} ${pathname === "/concesionarios" ? styles.navLinkActive : ""}`}>
          Concesionarios
        </Link>
        {isAdmin && (
          <Link href="/users" className={`${styles.navLink} ${pathname === "/users" ? styles.navLinkActive : ""}`}>
            Usuarios
          </Link>
        )}
        <Link href="/drive" className={`${styles.navLink} ${pathname === "/drive" ? styles.navLinkActive : ""}`}>
          Prueba de Manejo
        </Link>
        <Link href="/seguros" className={`${styles.navLink} ${pathname === "/seguros" ? styles.navLinkActive : ""}`}>
          Seguros
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

