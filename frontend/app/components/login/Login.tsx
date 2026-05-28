"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Login.module.css";

type LoginFormState = {
  Email: string;
  Password: string;
  remember: boolean;
};

const initialState: LoginFormState = {
  Email: "",
  Password: "",
  remember: true,
};

export default function Login() {
  const router = useRouter();
  const [formState, setFormState] = useState<LoginFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit = useMemo(
    () => formState.Email.trim().length > 0 && formState.Password.length > 0,
    [formState.Email, formState.Password],
  );

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

    const payload = {
      Email: formState.Email.trim(),
      Password: formState.Password,
    };

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormState((prev) => ({ ...prev, Password: "" }));
    router.push("/catalog");

    void payload;
  };

  return (
    <div className={`${styles.shell} min-h-screen`}>
      <div className={styles.backdrop} />
      <div className={`${styles.orb} ${styles.orbOne}`} />
      <div className={`${styles.orb} ${styles.orbTwo}`} />

      <main className={`${styles.card} shadow-2xl`}>
        <header className={styles.header}>
          <p className={styles.kicker}>LegendaryMotorsport</p>
          <h1 className={styles.title}>Accede a tu cuenta</h1>
          <p className={styles.subtitle}>
            Inicia sesion con tu email. Este flujo esta listo para conectarse a
            ASP.NET Core Web API.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <div className="flex items-center justify-between text-sm">
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formState.remember}
                onChange={(event) => handleChange("remember", event.target.checked)}
              />
              Recordarme
            </label>
            <Link href="/recuperar" className={styles.link}>
              Olvidaste tu contrasena?
            </Link>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {isSuccess && (
            <p className={styles.success}>Acceso correcto. Redirigiendo...</p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Validando..." : "Iniciar sesion"}
          </button>
        </form>

        <footer className={styles.footer}>
          <span className={styles.footerText}>Aun no tienes cuenta?</span>
          <Link href="/registro" className={styles.linkStrong}>
            Crear cuenta
          </Link>
        </footer>
      </main>
    </div>
  );
}
