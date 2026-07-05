"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

type Mode = "login" | "register";

type LoginFormState = {
  Email: string;
  Password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  idRol: number;
};

const initialState: LoginFormState = {
  Email: "",
  Password: "",
  nombre: "",
  apellido: "",
  telefono: "",
  idRol: 2,
};

const API_BASE_URL = "http://localhost:5035";

export default function Login() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [mode, setMode] = useState<Mode>("login");
  const [formState, setFormState] = useState<LoginFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Use ref to avoid [router] as dep — router object can change reference
    // between renders causing this effect to fire repeatedly and loop redirects
    const token = localStorage.getItem("authToken");
    if (token) {
      routerRef.current.push("/catalog");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const canSubmit = useMemo(() => {
    if (mode === "login") {
      return formState.Email.trim().length > 0 && formState.Password.length > 0;
    }
    return (
      formState.Email.trim().length > 0 &&
      formState.Password.length > 0 &&
      formState.nombre.trim().length > 0 &&
      formState.apellido.trim().length > 0 &&
      formState.telefono.trim().length > 0
    );
  }, [mode, formState]);

  const handleChange = (field: keyof LoginFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);

    if (!validateEmail(formState.Email)) {
      setError("Ingresa un email valido");
      return;
    }

    if (!formState.Password.trim()) {
      setError("Ingresa tu contrasena");
      return;
    }

    if (mode === "register") {
      if (!formState.nombre.trim() || !formState.apellido.trim()) {
        setError("Completa tu nombre y apellido");
        return;
      }
      if (!formState.telefono.trim()) {
        setError("Ingresa tu telefono");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const response = await fetch(`${API_BASE_URL}/api/clientes/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formState.Email.trim(),
            contrasena: formState.Password,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setError(data?.error ?? "Credenciales invalidas");
          return;
        }

        if (data?.token) {
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("idCliente", String(data.idCliente ?? ""));
          localStorage.setItem("email", data.email ?? "");
          localStorage.setItem("idRol", String(data.idRol ?? ""));
          localStorage.setItem("nombre", data.nombre ?? data.name ?? "");
        }

        setIsSuccess(true);
        setFormState((prev) => ({ ...prev, Password: "" }));
        router.push("/catalog");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formState.nombre.trim(),
          apellido: formState.apellido.trim(),
          telefono: formState.telefono.trim(),
          email: formState.Email.trim(),
          idRol: formState.idRol,
          contrasena: formState.Password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error ?? "No se pudo crear la cuenta");
        return;
      }

      setIsSuccess(true);
      setFormState((prev) => ({ ...prev, Password: "" }));
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} />
      <div className={`${styles.orb} ${styles.orbOne}`} />
      <div className={`${styles.orb} ${styles.orbTwo}`} />

      <main className={styles.card}>
        <header className={styles.header}>
          <p className={styles.kicker}>LegendaryMotorsport</p>
          <h1 className={styles.title}>
            {mode === "login" ? "Accede a tu cuenta" : "Crea tu cuenta"}
          </h1>
          <p className={styles.subtitle}>
            {mode === "login"
              ? "Inicia sesion con tu email."
              : "Registra tus datos para crear un cliente."} Este flujo esta listo
            para conectarse a ASP.NET Core Web API.
          </p>
        </header>

        <div className={styles.modeSwitch}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`${styles.modeButton} ${
              mode === "login" ? styles.modeButtonActive : ""
            }`}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`${styles.modeButton} ${
              mode === "register" ? styles.modeButtonActive : ""
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            className={`${styles.registerFields} ${
              mode === "register" ? styles.registerFieldsVisible : ""
            }`}
            aria-hidden={mode !== "register"}
          >
            <label className={styles.field}>
              Nombre
              <input
                type="text"
                placeholder="Juan"
                value={formState.nombre}
                onChange={(event) => handleChange("nombre", event.target.value)}
                className={styles.input}
                disabled={mode !== "register"}
              />
            </label>
            <label className={styles.field}>
              Apellido
              <input
                type="text"
                placeholder="Perez"
                value={formState.apellido}
                onChange={(event) => handleChange("apellido", event.target.value)}
                className={styles.input}
                disabled={mode !== "register"}
              />
            </label>
            <label className={styles.field}>
              Telefono
              <input
                type="text"
                placeholder="555-123"
                value={formState.telefono}
                onChange={(event) => handleChange("telefono", event.target.value)}
                className={styles.input}
                disabled={mode !== "register"}
              />
            </label>
          </div>

          <label className={styles.field}>
            Email
            <input
              type="email"
              placeholder="cliente@legendary.com"
              value={formState.Email}
              onChange={(event) => handleChange("Email", event.target.value)}
              className={styles.input}
              autoComplete="email"
              aria-invalid={Boolean(error)}
            />
          </label>

          <label className={styles.field}>
            Contrasena
            <input
              type="password"
              placeholder="Tu clave segura"
              value={formState.Password}
              onChange={(event) => handleChange("Password", event.target.value)}
              className={styles.input}
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
            />
          </label>

          {mode === "register" && (
            <p className={styles.helper}>Rol asignado por defecto: {formState.idRol}</p>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {isSuccess && (
            <p className={styles.success}>Acceso correcto. Redirigiendo...</p>
          )}

          <button
            type="submit"
            className={`${styles.submit} ${
              mode === "register" ? styles.submitAlt : ""
            }`}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? "Procesando..."
              : mode === "login"
                ? "Iniciar sesion"
                : "Crear cuenta"}
          </button>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>
            {mode === "login"
              ? "Aun no tienes cuenta?"
              : "Ya tienes una cuenta?"}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className={styles.linkStrong}
          >
            {mode === "login" ? "Crear cuenta" : "Iniciar sesion"}
          </button>
        </footer>
      </main>
    </div>
  );
}
