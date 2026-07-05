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

interface InsuredVehicle {
  id: string;
  idCliente: string;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  valorEstimado: number;
  color: string;
  fechaRegistro: string;
  estado: "Activo" | "Pendiente";
}

const API_BASE_URL = "http://localhost:5035";

export default function Seguros() {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"cliente" | "vehiculo">("cliente");

  // State for Insured Client Form fields
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [licenciaConducir, setLicenciaConducir] = useState("");
  const [tipoLicencia, setTipoLicencia] = useState("Clase A (Particular)");

  // State for Insured Vehicle Form fields
  const [marca, setMarca] = useState("Pegassi");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [placa, setPlaca] = useState("");
  const [valorEstimado, setValorEstimado] = useState("");
  const [color, setColor] = useState("");

  // UX & Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successClient, setSuccessClient] = useState<InsuredClient | null>(null);
  const [successVehicle, setSuccessVehicle] = useState<InsuredVehicle | null>(null);
  const [registeredClients, setRegisteredClients] = useState<InsuredClient[]>([]);
  const [registeredVehicles, setRegisteredVehicles] = useState<InsuredVehicle[]>([]);
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

    // Load registered insured vehicles from localStorage
    const localVehicles = localStorage.getItem("vehiculos_asegurados");
    if (localVehicles) {
      try {
        setRegisteredVehicles(JSON.parse(localVehicles));
      } catch (e) {
        console.error("No se pudo parsear los vehículos asegurados locales", e);
      }
    }
  }, [router]);

  // Form validation helper for Client
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

  // Form validation helper for Vehicle
  const isVehicleFormValid = useMemo(() => {
    return (
      marca.trim().length > 0 &&
      modelo.trim().length > 0 &&
      anio.trim().length === 4 &&
      !isNaN(parseInt(anio)) &&
      placa.trim().length >= 4 &&
      valorEstimado.trim().length > 0 &&
      !isNaN(parseFloat(valorEstimado)) &&
      color.trim().length > 0
    );
  }, [marca, modelo, anio, placa, valorEstimado, color]);

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

  // Handle vehicle registration submit
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVehicleFormValid) return;

    setIsLoading(true);
    setError(null);

    const idCliente = localStorage.getItem("idCliente") || "0";
    const token = localStorage.getItem("authToken");

    const vehicleData = {
      idCliente,
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: parseInt(anio),
      placa: placa.trim().toUpperCase(),
      valorEstimado: parseFloat(valorEstimado),
      color: color.trim(),
    };

    try {
      // Intentar registrar en el backend
      const response = await fetch(`${API_BASE_URL}/api/seguros/vehiculos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          idCliente: parseInt(idCliente),
          marca: vehicleData.marca,
          modelo: vehicleData.modelo,
          anio: vehicleData.anio,
          placa: vehicleData.placa,
          valorEstimado: vehicleData.valorEstimado,
          color: vehicleData.color,
        }),
      });

      let responseData = null;
      if (response.ok) {
        responseData = await response.json().catch(() => null);
      }

      const newVehicle: InsuredVehicle = {
        id: responseData?.idRegistro ? `VEH-${responseData.idRegistro}` : `VEH-${Math.floor(100000 + Math.random() * 900000)}`,
        idCliente: vehicleData.idCliente,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        anio: vehicleData.anio,
        placa: vehicleData.placa,
        valorEstimado: vehicleData.valorEstimado,
        color: vehicleData.color,
        fechaRegistro: new Date().toLocaleDateString("es-ES"),
        estado: response.ok ? "Activo" : "Pendiente",
      };

      const updatedVehicles = [newVehicle, ...registeredVehicles];
      setRegisteredVehicles(updatedVehicles);
      localStorage.setItem("vehiculos_asegurados", JSON.stringify(updatedVehicles));
      setSuccessVehicle(newVehicle);

      // Limpiar campos específicos
      setModelo("");
      setPlaca("");
      setValorEstimado("");
      setColor("");
    } catch (err) {
      console.warn("Backend API not reachable. Falling back to local storage.", err);

      const newVehicle: InsuredVehicle = {
        id: `VEH-${Math.floor(100000 + Math.random() * 900000)}`,
        idCliente: vehicleData.idCliente,
        marca: vehicleData.marca,
        modelo: vehicleData.modelo,
        anio: vehicleData.anio,
        placa: vehicleData.placa,
        valorEstimado: vehicleData.valorEstimado,
        color: vehicleData.color,
        fechaRegistro: new Date().toLocaleDateString("es-ES"),
        estado: "Activo",
      };

      const updatedVehicles = [newVehicle, ...registeredVehicles];
      setRegisteredVehicles(updatedVehicles);
      localStorage.setItem("vehiculos_asegurados", JSON.stringify(updatedVehicles));
      setSuccessVehicle(newVehicle);

      // Limpiar campos
      setModelo("");
      setPlaca("");
      setValorEstimado("");
      setColor("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClient = (id: string) => {
    const updated = registeredClients.filter((c) => c.id !== id);
    setRegisteredClients(updated);
    localStorage.setItem("clientes_asegurados", JSON.stringify(updated));
  };

  const handleRemoveVehicle = (id: string) => {
    const updated = registeredVehicles.filter((v) => v.id !== id);
    setRegisteredVehicles(updated);
    localStorage.setItem("vehiculos_asegurados", JSON.stringify(updated));
  };

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} />
      <div className={styles.orb} />

      <div className={styles.container}>
        <Header />

        {/* Tab Selection Navigation */}
        <div className={styles.tabContainer}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "cliente" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("cliente");
              setShowHistory(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Datos del Cliente
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "vehiculo" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("vehiculo");
              setShowHistory(false);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            Datos del Vehículo
          </button>
        </div>

        <header className={styles.pageHeader}>
          <div>
            <p className={styles.kicker}>Seguros de Prestigio</p>
            <h1 className={styles.pageTitle}>
              {activeTab === "cliente" ? "Registro del Cliente" : "Registro del Vehículo"}
            </h1>
            <p className={styles.pageSubtitle}>
              {activeTab === "cliente"
                ? "Registra tus datos personales y de conductor para habilitar tu perfil de seguros en la plataforma."
                : "Registra los datos del vehículo que deseas asegurar para cotizar y emitir tu póliza de cobertura."}
            </p>
          </div>
          <div>
            <button
              type="button"
              className={styles.toggleHistoryBtn}
              onClick={() => setShowHistory(!showHistory)}
            >
              {activeTab === "cliente"
                ? (showHistory ? "Ver Formulario de Registro" : `Clientes Registrados (${registeredClients.length})`)
                : (showHistory ? "Ver Formulario de Registro" : `Vehículos Registrados (${registeredVehicles.length})`)}
            </button>
          </div>
        </header>

        {showHistory ? (
          activeTab === "cliente" ? (
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
            /* REGISTERED VEHICLES VIEW */
            <section className={styles.historySection}>
              <h2 className={styles.sectionTitle}>Vehículos Asegurados Registrados</h2>
              {registeredVehicles.length === 0 ? (
                <div className={styles.emptyHistory}>
                  <p>No hay vehículos registrados para asegurar en este navegador.</p>
                  <button
                    type="button"
                    className={styles.backToFormBtn}
                    onClick={() => setShowHistory(false)}
                  >
                    Registrar tu primer vehículo
                  </button>
                </div>
              ) : (
                <div className={styles.policiesGrid}>
                  {registeredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className={styles.policyCard}>
                      <div className={styles.policyHeader}>
                        <div>
                          <span className={styles.policyId}>{vehicle.id}</span>
                          <h3 className={styles.policyVehicleName}>{vehicle.marca} {vehicle.modelo}</h3>
                        </div>
                        <span className={`${styles.policyBadge} ${styles.badgeActive}`}>
                          {vehicle.estado}
                        </span>
                      </div>

                      <div className={styles.policyDetails}>
                        <div className={styles.detailRow}>
                          <span>Matrícula / Placa:</span>
                          <strong>{vehicle.placa}</strong>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Año de Fabricación:</span>
                          <strong>{vehicle.anio}</strong>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Color:</span>
                          <span>{vehicle.color}</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Valor Estimado:</span>
                          <span>${vehicle.valorEstimado.toLocaleString()} USD</span>
                        </div>
                        <div className={styles.detailRow}>
                          <span>Fecha Registro:</span>
                          <span>{vehicle.fechaRegistro}</span>
                        </div>
                      </div>

                      <div className={styles.policyFooter} style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(vehicle.id)}
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
          )
        ) : activeTab === "cliente" ? (
          /* CLIENT FORM & LIVE CARD PREVIEW SPLIT VIEW */
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
        ) : (
          /* VEHICLE FORM & LIVE CARD PREVIEW SPLIT VIEW */
          <div className={styles.workspaceGrid}>
            
            {/* Vehicle Registration Form */}
            <form onSubmit={handleVehicleSubmit} className={styles.formCard}>
              <h2 className={styles.formSectionTitle}>Información del Vehículo</h2>
              
              <div className={styles.formRow}>
                <label className={styles.field}>
                  Marca del Vehículo
                  <select
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className={styles.input}
                    required
                  >
                    <option value="Pegassi">Pegassi</option>
                    <option value="Grotti">Grotti</option>
                    <option value="Benefactor">Benefactor</option>
                    <option value="Dewbauchee">Dewbauchee</option>
                    <option value="Obey">Obey</option>
                    <option value="Överflöd">Överflöd</option>
                    <option value="Ocelot">Ocelot</option>
                    <option value="Coil">Coil</option>
                    <option value="Progen">Progen</option>
                    <option value="Truffade">Truffade</option>
                    <option value="Pfister">Pfister</option>
                    <option value="Bravado">Bravado</option>
                    <option value="Karin">Karin</option>
                    <option value="Declasse">Declasse</option>
                    <option value="Vapid">Vapid</option>
                    <option value="Ubermacht">Übermacht</option>
                    <option value="Otro">Otro / Real</option>
                  </select>
                </label>

                <label className={styles.field}>
                  Modelo del Vehículo
                  <input
                    type="text"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej. Zentorno, T20, Osiris"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  Año del Vehículo
                  <input
                    type="number"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    placeholder="Ej. 2024"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  Matrícula / Placa
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="Ej. LS-777-MS"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              <div className={styles.formRow}>
                <label className={styles.field}>
                  Valor Estimado (USD)
                  <input
                    type="number"
                    min="1000"
                    value={valorEstimado}
                    onChange={(e) => setValorEstimado(e.target.value)}
                    placeholder="Ej. 450000"
                    className={styles.input}
                    required
                  />
                </label>

                <label className={styles.field}>
                  Color
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Ej. Amarillo Metálico, Negro Mate"
                    className={styles.input}
                    required
                  />
                </label>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              <button
                type="submit"
                disabled={!isVehicleFormValid || isLoading}
                className={styles.submitBtn}
                style={{ marginTop: "16px" }}
              >
                {isLoading ? "Procesando Registro..." : "Registrar Vehículo Asegurado"}
              </button>
            </form>

            {/* Live Vehicle Card Preview */}
            <aside className={styles.previewSection}>
              <div className={styles.stickyWrapper}>
                <h3 className={styles.previewTitle}>Ficha del Vehículo</h3>

                <div className={styles.quoteCertificate}>
                  <div className={styles.certHeader}>
                    <span className={styles.certSubtitle}>Póliza de Cobertura Vehicular</span>
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
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                          <circle cx="7" cy="17" r="2" />
                          <circle cx="17" cy="17" r="2" />
                        </svg>
                      </div>
                    </div>

                    <div className={styles.certGrid}>
                      <div className={styles.certItem} style={{ gridColumn: "span 2" }}>
                        <span className={styles.certLabel}>Vehículo Asegurado</span>
                        <span className={styles.certValue} style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                          {marca} {modelo || "---"}
                        </span>
                      </div>
                      
                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Placa</span>
                        <span className={styles.certValue}>{placa.toUpperCase() || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Año</span>
                        <span className={styles.certValue}>{anio || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Color</span>
                        <span className={styles.certValue}>{color || "---"}</span>
                      </div>

                      <div className={styles.certItem}>
                        <span className={styles.certLabel}>Valor Estimado</span>
                        <span className={styles.certValue} style={{ color: "var(--accent-2)" }}>
                          {valorEstimado ? `$${parseFloat(valorEstimado).toLocaleString()}` : "---"}
                        </span>
                      </div>
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <p>
                    Cotización instantánea sujeta a verificación de siniestralidad. Coberturas válidas en todo el territorio de <strong>Legendary MotorSport</strong>.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Success Modal Client */}
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

      {/* Success Modal Vehicle */}
      {successVehicle && (
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
            
            <h3 className={styles.modalTitle}>¡Vehículo Asegurado Registrado!</h3>
            <p className={styles.modalSubtitle}>
              Se ha creado tu perfil de vehículo asegurado correctamente en la plataforma.
            </p>

            <div className={styles.modalDetailsBox}>
              <div className={styles.modalDetailRow}>
                <span>Registro ID:</span>
                <strong>{successVehicle.id}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>Vehículo:</span>
                <strong>{successVehicle.marca} {successVehicle.modelo}</strong>
              </div>
              <div className={styles.modalDetailRow}>
                <span>Placa / Matrícula:</span>
                <strong>{successVehicle.placa}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={() => {
                  setSuccessVehicle(null);
                  setShowHistory(true);
                }}
              >
                Ver Vehículos Registrados
              </button>
              <button
                type="button"
                className={styles.modalSecondaryBtn}
                onClick={() => setSuccessVehicle(null)}
              >
                Registrar Otro Vehículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
