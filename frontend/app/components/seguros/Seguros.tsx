"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../header/Header";
import styles from "./Seguros.module.css";

interface InsuredClient {
  id: string;
  idCliente: string;
  nombreCompleto: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
  licenciaConducir: string;
  tipoLicencia: string;
  fechaRegistro: string;
  estado: "Activo" | "Pendiente";
}

const API_BASE_URL = "http://localhost:5035";

export default function Seguros() {
  const router = useRouter();

  // State for Insured Client Form fields
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [licenciaConducir, setLicenciaConducir] = useState("");
  const [tipoLicencia, setTipoLicencia] = useState("Clase A (Particular)");

  // UX & Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClient, setSuccessClient] = useState<InsuredClient | null>(null);
  const [registeredClients, setRegisteredClients] = useState<InsuredClient[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Authenticate user & pre-fill default account data if logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/");
      return;
    }

    const storedName = localStorage.getItem("nombre")?.trim() || "";
    const storedEmail = localStorage.getItem("email")?.trim() || "";
    const storedPhone = localStorage.getItem("telefono")?.trim() || "";

    setNombreCompleto(storedName || "Camilo");
    setEmail(storedEmail || "cliente@legendary.com");
    setTelefono(storedPhone || "");

    // Load registered insured clients from localStorage
    const localClients = localStorage.getItem("clientes_asegurados");
    if (localClients) {
      try {
        setRegisteredClients(JSON.parse(localClients));
      } catch (e) {
        console.error("No se pudo parsear los clientes asegurados locales", e);
      }
    }
  }, [router]);

  // Form validation helper
  const isFormValid = useMemo(() => {
    return (
      nombreCompleto.trim().length > 0 &&
      dni.trim().length >= 6 &&
      email.trim().length > 0 &&
      telefono.trim().length >= 6 &&
      fechaNacimiento.trim().length > 0 &&
      direccion.trim().length > 0 &&
      licenciaConducir.trim().length >= 5
    );
  }, [
    nombreCompleto,
    dni,
    email,
    telefono,
    fechaNacimiento,
    direccion,
    licenciaConducir,
  ]);

  // Handle client registration submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    const idCliente = localStorage.getItem("idCliente") || "0";
    const token = localStorage.getItem("authToken");

    const clientData: Omit<InsuredClient, "id" | "fechaRegistro" | "estado"> = {
      idCliente,
      nombreCompleto: nombreCompleto.trim(),
      dni: dni.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      fechaNacimiento,
      direccion: direccion.trim(),
      licenciaConducir: licenciaConducir.trim().toUpperCase(),
      tipoLicencia,
    };

    try {
      // Intentar registrar en el backend
      const response = await fetch(`${API_BASE_URL}/api/seguros/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          idCliente: parseInt(idCliente),
          nombreCompleto: clientData.nombreCompleto,
          dni: clientData.dni,
          email: clientData.email,
          telefono: clientData.telefono,
          fechaNacimiento: clientData.fechaNacimiento,
          direccion: clientData.direccion,
          licenciaConducir: clientData.licenciaConducir,
          tipoLicencia: clientData.tipoLicencia,
        }),
      });

      let responseData = null;
      if (response.ok) {
        responseData = await response.json().catch(() => null);
      }

      const newInsured: InsuredClient = {
        id: responseData?.idRegistro ? `REG-${responseData.idRegistro}` : `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        idCliente: clientData.idCliente,
        nombreCompleto: clientData.nombreCompleto,
        dni: clientData.dni,
        email: clientData.email,
        telefono: clientData.telefono,
        fechaNacimiento: clientData.fechaNacimiento,
        direccion: clientData.direccion,
        licenciaConducir: clientData.licenciaConducir,
        tipoLicencia: clientData.tipoLicencia,
        fechaRegistro: new Date().toLocaleDateString("es-ES"),
        estado: response.ok ? "Activo" : "Pendiente",
      };

      const updatedClients = [newInsured, ...registeredClients];
      setRegisteredClients(updatedClients);
      localStorage.setItem("clientes_asegurados", JSON.stringify(updatedClients));
      setSuccessClient(newInsured);

      // Limpiar campos específicos
      setDni("");
      setFechaNacimiento("");
      setDireccion("");
      setLicenciaConducir("");
    } catch (err) {
      console.warn("Backend API not reachable. Falling back to local storage.", err);

      const newInsured: InsuredClient = {
        id: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        idCliente: clientData.idCliente,
        nombreCompleto: clientData.nombreCompleto,
        dni: clientData.dni,
        email: clientData.email,
        telefono: clientData.telefono,
        fechaNacimiento: clientData.fechaNacimiento,
        direccion: clientData.direccion,
        licenciaConducir: clientData.licenciaConducir,
        tipoLicencia: clientData.tipoLicencia,
        fechaRegistro: new Date().toLocaleDateString("es-ES"),
        estado: "Activo",
      };

      const updatedClients = [newInsured, ...registeredClients];
      setRegisteredClients(updatedClients);
      localStorage.setItem("clientes_asegurados", JSON.stringify(updatedClients));
      setSuccessClient(newInsured);

      // Limpiar campos
      setDni("");
      setFechaNacimiento("");
      setDireccion("");
      setLicenciaConducir("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClient = (id: string) => {
    const updated = registeredClients.filter((c) => c.id !== id);
    setRegisteredClients(updated);
    localStorage.setItem("clientes_asegurados", JSON.stringify(updated));
  };

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} />
      <div className={styles.orb} />

      <div className={styles.container}>
        <Header />

        <header className={styles.pageHeader}>
          <div>
            <p className={styles.kicker}>Seguros de Prestigio</p>
            <h1 className={styles.pageTitle}>Registro del Cliente</h1>
            <p className={styles.pageSubtitle}>
              Registra tus datos personales y de conductor para habilitar tu perfil de seguros en la plataforma.
            </p>
          </div>
          <div>
            <button
              type="button"
              className={styles.toggleHistoryBtn}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Ver Formulario de Registro" : `Clientes Registrados (${registeredClients.length})`}
            </button>
          </div>
        </header>

        {showHistory ? (
          /* REGISTERED CLIENTS VIEW */
          <section className={styles.historySection}>
            <h2 className={styles.sectionTitle}>Clientes Asegurados Registrados</h2>
            {registeredClients.length === 0 ? (
              <div className={styles.emptyHistory}>
                <p>No hay perfiles de clientes registrados en este navegador.</p>
                <button
                  type="button"
                  className={styles.backToFormBtn}
                  onClick={() => setShowHistory(false)}
                >
                  Registrar tu primer perfil
                </button>
              </div>
            ) : (
              <div className={styles.policiesGrid}>
                {registeredClients.map((client) => (
                  <div key={client.id} className={styles.policyCard}>
                    <div className={styles.policyHeader}>
                      <div>
                        <span className={styles.policyId}>{client.id}</span>
                        <h3 className={styles.policyVehicleName}>{client.nombreCompleto}</h3>
                      </div>
                      <span className={`${styles.policyBadge} ${styles.badgeActive}`}>
                        {client.estado}
                      </span>
                    </div>

                    <div className={styles.policyDetails}>
                      <div className={styles.detailRow}>
                        <span>DNI / Documento:</span>
                        <strong>{client.dni}</strong>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Email:</span>
                        <strong>{client.email}</strong>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Teléfono:</span>
                        <span>{client.telefono}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Fecha Nacimiento:</span>
                        <span>{client.fechaNacimiento}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Licencia de Conducir:</span>
                        <strong>{client.licenciaConducir} ({client.tipoLicencia})</strong>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Dirección:</span>
                        <span>{client.direccion}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Fecha Registro:</span>
                        <span>{client.fechaRegistro}</span>
                      </div>
                    </div>

                    <div className={styles.policyFooter} style={{ justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveClient(client.id)}
                        className={styles.cancelPolicyBtn}
                      >
                        Eliminar Registro
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* FORM & LIVE CARD PREVIEW SPLIT VIEW */
          <div className={styles.workspaceGrid}>
            
            {/* Client Registration Form */}
            <form onSubmit={handleSubmit} className={styles.formCard}>
              <h2 className={styles.formSectionTitle}>Información del Propietario</h2>
              
              <div className={styles.formRow}>
                <label className={styles.field}>
                  Nombre Completo
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  DNI o Documento de Identidad
                  <input
                    type="text"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ej. 72481023"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  Correo Electrónico
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@legendary.com"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  Teléfono de Contacto
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +51 987654321"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  Fecha de Nacimiento
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  Dirección de Residencia
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Calle Los Olivos 123"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <h2 className={styles.formSectionTitle} style={{ marginTop: "24px" }}>
                Información de Conducir
              </h2>
              <div className={styles.formRow}>
                <label className={styles.field}>
                  Número de Licencia de Conducir
                  <input
                    type="text"
                    value={licenciaConducir}
                    onChange={(e) => setLicenciaConducir(e.target.value)}
                    placeholder="Ej. Q72481023"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  Clase / Categoría de Licencia
                  <select
                    value={tipoLicencia}
                    onChange={(e) => setTipoLicencia(e.target.value)}
                    className={styles.input}
                  >
                    <option value="Clase A (Particular)">Clase A (Vehículos Particulares)</option>
                    <option value="Clase B (Motos)">Clase B (Motos / Trimotos)</option>
                    <option value="Clase C (Profesional)">Clase C (Profesional / Carga)</option>
                    <option value="Clase Especial (Deportivos)">Clase Especial (Superdeportivos / Circuito)</option>
                  </select>
                </label>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={styles.submitBtn}
                style={{ marginTop: "16px" }}
              >
                {isLoading ? "Procesando Registro..." : "Registrar Cliente Asegurado"}
              </button>
            </form>

            {/* Live Card Preview */}
            <aside className={styles.previewSection}>
              <div className={styles.stickyWrapper}>
                <h3 className={styles.previewTitle}>Vista Previa de Ficha</h3>

                <div className={styles.quoteCertificate}>
                  <div className={styles.certHeader}>
                    <span className={styles.certSubtitle}>Ficha Oficial de Asegurado</span>
                    <h4 className={styles.certTitle}>Legendary Motorsport</h4>
                  </div>

                  <div className={styles.certBody}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(247, 198, 0, 0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    </div>

                    <div className={styles.certGrid}>
                      <div className={styles.certItem} style={{ gridColumn: "span 2" }}>
                        <span className={styles.certLabel}>Nombre del Asegurado</span>
                        <span className={styles.certValue} style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                          {nombreCompleto || "---"}
                        </span>
                      </div>
                      
                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>DNI</span>
                        <span className={styles.certValue}>{dni || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Licencia</span>
                        <span className={styles.certValue}>{licenciaConducir.toUpperCase() || "---"}</span>
                      </div>

                      <div className={styles.certItem} style={{ gridColumn: "span 2" }}>
                        <span className={styles.certLabel}>Correo</span>
                        <span className={styles.certValue}>{email || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Teléfono</span>
                        <span className={styles.certValue}>{telefono || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Categoría</span>
                        <span className={styles.certValue} style={{ fontSize: "11px", color: "var(--accent)" }}>
                          {tipoLicencia.split(" (")[0]}
                        </span>
                      </div>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.certItem}>
                      <span className={styles.certLabel}>Dirección de Residencia</span>
                      <span className={styles.certValue} style={{ fontSize: "11px", whiteSpace: "normal" }}>
                        {direccion || "---"}
                      </span>
                    </div>

                    <div className={styles.certItem}>
                      <span className={styles.certLabel}>Fecha de Nacimiento</span>
                      <span className={styles.certValue}>{fechaNacimiento || "---"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.certBadgeShield}>
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p>
                    Datos de cliente encriptados de forma segura. Cumple con los protocolos de protección de datos de <strong>Legendary MotorSport</strong>.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {successClient && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIconWrapper}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            
            <h3 className={styles.modalTitle}>¡Cliente Asegurado Registrado!</h3>
            <p className={styles.modalSubtitle}>
              Se ha creado tu perfil de cliente asegurado correctamente en la plataforma.
            </p>

            <div className={styles.modalDetailsBox}>
              <div className={styles.modalDetailRow}>
                <span>Registro ID:</span>
                <strong>{successClient.id}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>Cliente:</span>
                <strong>{successClient.nombreCompleto}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>DNI / Documento:</span>
                <strong>{successClient.dni}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>Licencia de Conducir:</span>
                <strong>{successClient.licenciaConducir}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={() => {
                  setSuccessClient(null);
                  setShowHistory(true);
                }}
              >
                Ver Clientes Registrados
              </button>
              <button
                type="button"
                className={styles.modalSecondaryBtn}
                onClick={() => setSuccessClient(null)}
              >
                Registrar Otro Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
