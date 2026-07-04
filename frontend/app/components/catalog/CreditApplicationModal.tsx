"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { VehicleDetail, InventoryItem } from "./types";
import styles from "./CreditApplicationModal.module.css";

type CreditApplicationModalProps = {
  vehicle: VehicleDetail | null;
  selectedInventory: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
};

type CreditFormState = {
  fullName: string;
  email: string;
  phone: string;
  dni: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  workSeniorityYears: string;
  creditHistory: "good" | "regular" | "bad" | "none";
  downPayment: string;
  termMonths: "12" | "24" | "36" | "48" | "60";
};

const initialFormState: CreditFormState = {
  fullName: "",
  email: "",
  phone: "",
  dni: "",
  monthlyIncome: "",
  monthlyExpenses: "",
  workSeniorityYears: "",
  creditHistory: "good",
  downPayment: "",
  termMonths: "24",
};

export default function CreditApplicationModal({
  vehicle,
  selectedInventory,
  isOpen,
  onClose,
}: CreditApplicationModalProps) {
  const [formState, setFormState] = useState<CreditFormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof CreditFormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefill email if available in localStorage
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setSubmitSuccess(false);
      setErrors({});
      const savedEmail = localStorage.getItem("email") ?? "";
      setFormState({
        ...initialFormState,
        email: savedEmail,
      });
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [isOpen]);

  const carPrice = useMemo(() => {
    if (selectedInventory) return selectedInventory.precio;
    if (vehicle && vehicle.inventory.length > 0) return vehicle.inventory[0].precio;
    return 0;
  }, [vehicle, selectedInventory]);

  // Dynamic calculations for the loan preview
  const downPaymentVal = Number(formState.downPayment) || 0;
  const loanAmount = Math.max(0, carPrice - downPaymentVal);
  const termMonthsVal = Number(formState.termMonths);

  const estimatedMonthlyPayment = useMemo(() => {
    if (loanAmount <= 0 || termMonthsVal <= 0) return 0;
    // Simple mock interest rate layout: 12% annual interest (1% monthly)
    const monthlyRate = 0.01;
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonthsVal)) / 
                    (Math.pow(1 + monthlyRate, termMonthsVal) - 1);
    return Math.round(payment);
  }, [loanAmount, termMonthsVal]);

  if ((!isOpen && !isClosing) || !vehicle) return null;

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  const handleChange = (field: keyof CreditFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreditFormState, string>> = {};

    if (!formState.fullName.trim()) newErrors.fullName = "El nombre completo es requerido";
    if (!formState.email.trim() || !/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }
    if (!formState.phone.trim()) newErrors.phone = "El teléfono de contacto es requerido";
    if (!formState.dni.trim()) newErrors.dni = "El documento de identidad es requerido";
    
    const incomeNum = Number(formState.monthlyIncome);
    if (!formState.monthlyIncome || isNaN(incomeNum) || incomeNum <= 0) {
      newErrors.monthlyIncome = "Ingresa un ingreso mensual válido mayor a $0";
    }

    const expensesNum = Number(formState.monthlyExpenses);
    if (!formState.monthlyExpenses || isNaN(expensesNum) || expensesNum < 0) {
      newErrors.monthlyExpenses = "Ingresa un egreso mensual válido";
    } else if (expensesNum >= incomeNum && incomeNum > 0) {
      newErrors.monthlyExpenses = "Los egresos no pueden superar a tus ingresos";
    }

    const seniorityNum = Number(formState.workSeniorityYears);
    if (!formState.workSeniorityYears || isNaN(seniorityNum) || seniorityNum < 0) {
      newErrors.workSeniorityYears = "Ingresa la antigüedad laboral (0 si es menor a un año)";
    }

    if (downPaymentVal < 0) {
      newErrors.downPayment = "El pie o enganche no puede ser menor a $0";
    } else if (downPaymentVal >= carPrice) {
      newErrors.downPayment = `El pie no puede ser igual o mayor al valor del vehículo ($${carPrice.toLocaleString()})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API credit analysis loading
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 2000);
  };

  return (
    <div className={isClosing ? styles.overlayClosing : styles.overlay}>
      <div
        className={isClosing ? styles.backdropClosing : styles.backdrop}
        onClick={handleClose}
      />
      <div className={isClosing ? styles.modalClosing : styles.modal}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.kicker}>estudio de financiamiento</span>
            <h2 className={styles.title}>Solicitud de Crédito</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={handleClose}>
            &times;
          </button>
        </div>

        {submitSuccess ? (
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>✓</div>
            <h3>Solicitud Recibida</h3>
            <p>
              Hemos registrado tus datos correctamente. Próximamente se habilitará el análisis 
              automatizado para ver si eres apto para el <strong>{vehicle.brand} {vehicle.model}</strong> y las 
              opciones personalizadas de financiamiento.
            </p>
            <button type="button" className={styles.actionButtonPrimary} onClick={handleClose}>
              Entendido
            </button>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {/* Left Side: Car details & credit preview */}
            <div className={styles.carSummary}>
              <div className={styles.carCard}>
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className={styles.carImage}
                />
                <div className={styles.carInfo}>
                  <h4>{vehicle.brand} {vehicle.model}</h4>
                  {selectedInventory && (
                    <p className={styles.carColor}>
                      Color: {selectedInventory.color} · {selectedInventory.kilometraje.toLocaleString()} km
                    </p>
                  )}
                  <p className={styles.carPrice}>
                    Valor: <span>${carPrice.toLocaleString("en-US")}</span>
                  </p>
                </div>
              </div>

              <div className={styles.previewBox}>
                <h5>Resumen del Crédito</h5>
                <div className={styles.previewRow}>
                  <span>Precio del vehículo:</span>
                  <span>${carPrice.toLocaleString("en-US")}</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Pie / Enganche:</span>
                  <span>${downPaymentVal.toLocaleString("en-US")}</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Monto a Financiar:</span>
                  <span>${loanAmount.toLocaleString("en-US")}</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Plazo de pago:</span>
                  <span>{termMonthsVal} meses</span>
                </div>
                <div className={`${styles.previewRow} ${styles.highlightRow}`}>
                  <span>Pago Mensual Estimado:</span>
                  <span className={styles.highlightPrice}>
                    ${estimatedMonthlyPayment.toLocaleString("en-US")}/mes
                  </span>
                </div>
                <p className={styles.disclaimer}>
                  * Tasa fija referencial del 1% mensual. Sujeto a aprobación crediticia.
                </p>
              </div>
            </div>

            {/* Right Side: The Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <h4 className={styles.formTitle}>Información Financiera y Personal</h4>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Nombre Completo</label>
                  <input
                    type="text"
                    id="fullName"
                    value={formState.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Ej. John Doe"
                    className={errors.fullName ? styles.inputError : ""}
                  />
                  {errors.fullName && <span className={styles.errorMessage}>{errors.fullName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="dni">Documento de Identidad (RUT/Cédula)</label>
                  <input
                    type="text"
                    id="dni"
                    value={formState.dni}
                    onChange={(e) => handleChange("dni", e.target.value)}
                    placeholder="Ej. 12.345.678-9"
                    className={errors.dni ? styles.inputError : ""}
                  />
                  {errors.dni && <span className={styles.errorMessage}>{errors.dni}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    value={formState.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={errors.email ? styles.inputError : ""}
                  />
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formState.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Ej. +56 9 1234 5678"
                    className={errors.phone ? styles.inputError : ""}
                  />
                  {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="monthlyIncome">Ingresos Mensuales Líquidos ($)</label>
                  <input
                    type="number"
                    id="monthlyIncome"
                    value={formState.monthlyIncome}
                    onChange={(e) => handleChange("monthlyIncome", e.target.value)}
                    placeholder="Ej. 1500000"
                    min="0"
                    className={errors.monthlyIncome ? styles.inputError : ""}
                  />
                  {errors.monthlyIncome && <span className={styles.errorMessage}>{errors.monthlyIncome}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="monthlyExpenses">Egresos Mensuales (Alquiler, deudas, etc) ($)</label>
                  <input
                    type="number"
                    id="monthlyExpenses"
                    value={formState.monthlyExpenses}
                    onChange={(e) => handleChange("monthlyExpenses", e.target.value)}
                    placeholder="Ej. 400000"
                    min="0"
                    className={errors.monthlyExpenses ? styles.inputError : ""}
                  />
                  {errors.monthlyExpenses && <span className={styles.errorMessage}>{errors.monthlyExpenses}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="workSeniorityYears">Antigüedad Laboral (Años)</label>
                  <input
                    type="number"
                    id="workSeniorityYears"
                    value={formState.workSeniorityYears}
                    onChange={(e) => handleChange("workSeniorityYears", e.target.value)}
                    placeholder="Ej. 2"
                    min="0"
                    className={errors.workSeniorityYears ? styles.inputError : ""}
                  />
                  {errors.workSeniorityYears && <span className={styles.errorMessage}>{errors.workSeniorityYears}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="creditHistory">Historial Crediticio</label>
                  <select
                    id="creditHistory"
                    value={formState.creditHistory}
                    onChange={(e) => handleChange("creditHistory", e.target.value as any)}
                  >
                    <option value="good">Excelente / Bueno (Sin deudas vencidas)</option>
                    <option value="regular">Regular (Alguna demora previa)</option>
                    <option value="bad">Malo (Deudas vencidas / Dicom)</option>
                    <option value="none">Sin historial financiero previo</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="downPayment">Pie / Enganche ($)</label>
                  <input
                    type="number"
                    id="downPayment"
                    value={formState.downPayment}
                    onChange={(e) => handleChange("downPayment", e.target.value)}
                    placeholder="Ej. 5000000"
                    min="0"
                    className={errors.downPayment ? styles.inputError : ""}
                  />
                  {errors.downPayment && <span className={styles.errorMessage}>{errors.downPayment}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="termMonths">Plazo del Crédito</label>
                  <select
                    id="termMonths"
                    value={formState.termMonths}
                    onChange={(e) => handleChange("termMonths", e.target.value as any)}
                  >
                    <option value="12">12 Meses</option>
                    <option value="24">24 Meses</option>
                    <option value="36">36 Meses</option>
                    <option value="48">48 Meses</option>
                    <option value="60">60 Meses</option>
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={handleClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Analizando Perfil..." : "Enviar a Análisis"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
