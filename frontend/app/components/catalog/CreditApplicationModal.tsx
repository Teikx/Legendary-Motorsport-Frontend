"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { VehicleDetail, InventoryItem } from "./types";
import styles from "./CreditApplicationModal.module.css";

type CreditApplicationModalProps = {
  vehicle: VehicleDetail | null;
  selectedInventory: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRecommendCheaperVehicle?: () => void;
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

type RequestStatus = "sent" | "inProgress" | "completed";

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
  onRecommendCheaperVehicle,
}: CreditApplicationModalProps) {
  const [formState, setFormState] = useState<CreditFormState>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof CreditFormState, string>>>({});
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('sent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carPrice = useMemo(() => {
    if (selectedInventory) return selectedInventory.precio;
    if (vehicle && vehicle.inventory.length > 0) return vehicle.inventory[0].precio;
    return 0;
  }, [vehicle, selectedInventory]);

  const suggestedDownPayment = useMemo(() => {
    return carPrice > 0 ? Math.round(carPrice * 0.25) : 0;
  }, [carPrice]);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setRequestStatus('sent');
    }
  }, [isOpen]);

  // Prefill email and a suggested down payment when the modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setSubmitSuccess(false);
      setErrors({});
      const savedEmail = localStorage.getItem("email") ?? "";
      setFormState({
        ...initialFormState,
        email: savedEmail,
        downPayment: String(suggestedDownPayment),
      });
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [isOpen, suggestedDownPayment]);

  // Dynamic calculations for the loan preview
  const downPaymentVal = Number(formState.downPayment) || 0;
  const loanAmount = Math.max(0, carPrice - downPaymentVal);
  const termMonthsVal = Number(formState.termMonths);

  const estimatedMonthlyPayment = useMemo(() => {
    if (loanAmount <= 0 || termMonthsVal <= 0) return 0;
    const monthlyRate = 0.01;
    const payment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonthsVal)) /
                    (Math.pow(1 + monthlyRate, termMonthsVal) - 1);
    return Math.round(payment);
  }, [loanAmount, termMonthsVal]);

  const monthlyAvailable = useMemo(() => {
    const income = Number(formState.monthlyIncome) || 0;
    const expenses = Number(formState.monthlyExpenses) || 0;
    return Math.max(0, income - expenses);
  }, [formState.monthlyIncome, formState.monthlyExpenses]);

  const affordabilityCheck = useMemo(() => {
    if (!estimatedMonthlyPayment || monthlyAvailable <= 0) return null;
    const recommendedMonthlyLimit = monthlyAvailable * 0.4;
    const needsAdvice = estimatedMonthlyPayment > recommendedMonthlyLimit;
    const recommendedDownPayment = Math.max(downPaymentVal, Math.round(carPrice * 0.25));
    const targetLoanAmount = Math.round(
      recommendedMonthlyLimit * ((Math.pow(1 + 0.01, termMonthsVal) - 1) / (0.01 * Math.pow(1 + 0.01, termMonthsVal))),
    );
    const targetVehiclePrice = Math.max(0, targetLoanAmount + recommendedDownPayment);

    return {
      needsAdvice,
      recommendedMonthlyLimit,
      recommendedDownPayment,
      targetVehiclePrice,
    };
  }, [carPrice, downPaymentVal, estimatedMonthlyPayment, monthlyAvailable, termMonthsVal]);

  const progressSteps = ["Enviando", "En proceso", "Enviado"];
  const currentStepIndex = requestStatus === "sent" ? 0 : requestStatus === "inProgress" ? 1 : 2;

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

  const handleApplyHigherDownPayment = () => {
    if (!affordabilityCheck) return;
    setFormState((prev) => ({
      ...prev,
      downPayment: String(affordabilityCheck.recommendedDownPayment),
    }));
    setSubmitSuccess(false);
    setRequestStatus('sent');
  };

  const handleApplyCheaperVehicle = () => {
    if (onRecommendCheaperVehicle) {
      onRecommendCheaperVehicle();
      return;
    }

    if (!affordabilityCheck) return;
    setFormState((prev) => ({
      ...prev,
      downPayment: String(Math.max(Number(prev.downPayment) || 0, Math.round(carPrice * 0.25))),
      termMonths: "36",
    }));
    setSubmitSuccess(false);
    setRequestStatus('sent');
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
    setRequestStatus('sent');
    // Simulate sending request
    setTimeout(() => setRequestStatus('inProgress'), 1500);
    // Simulate analysis completion
    setTimeout(() => {
      setRequestStatus('completed');
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 3000);
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
            <div className={styles.sportyBadge}>Pit stop financiero</div>
            <h2 className={styles.title}>Solicitud de crédito</h2>
            <p className={styles.summary}>Tu solicitud fue enviada con éxito. Aquí tienes un resumen ordenado con el análisis de tu perfil y el vehículo elegido.</p>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}><strong>Nombre completo</strong><span>{formState.fullName}</span></div>
              <div className={styles.summaryCard}><strong>Email</strong><span>{formState.email}</span></div>
              <div className={styles.summaryCard}><strong>Teléfono</strong><span>{formState.phone}</span></div>
              <div className={styles.summaryCard}><strong>Documento ID</strong><span>{formState.dni}</span></div>
              <div className={styles.summaryCard}><strong>Ingresos mensuales</strong><span>${formState.monthlyIncome}</span></div>
              <div className={styles.summaryCard}><strong>Egresos mensuales</strong><span>${formState.monthlyExpenses}</span></div>
              <div className={styles.summaryCard}><strong>Antigüedad laboral</strong><span>{formState.workSeniorityYears} años</span></div>
              <div className={styles.summaryCard}><strong>Historial crediticio</strong><span>{formState.creditHistory}</span></div>
              <div className={styles.summaryCard}><strong>Pie / Enganche</strong><span>${formState.downPayment}</span></div>
              <div className={styles.summaryCard}><strong>Plazo</strong><span>{formState.termMonths} meses</span></div>
            </div>

            {affordabilityCheck?.needsAdvice ? (
              <div className={styles.adviceCard}>
                <div className={styles.adviceHeading}>Asesoría deportiva recomendada</div>
                <p>Tu capacidad actual deja muy poco margen para este pago. Te recomendamos ajustar una de estas dos opciones para que te quede más cómodo:</p>
                <ul className={styles.adviceList}>
                  <li>Subir el pie de enganche a <strong>${affordabilityCheck.recommendedDownPayment.toLocaleString("en-US")}</strong>.</li>
                  <li>Elegir un vehículo más cercano a <strong>${affordabilityCheck.targetVehiclePrice.toLocaleString("en-US")}</strong> para proteger tu presupuesto mensual.</li>
                </ul>
                <div className={styles.adviceActions}>
                  <button type="button" className={styles.secondaryActionButton} onClick={handleApplyHigherDownPayment}>Subir pie de enganche</button>
                  <button type="button" className={styles.secondaryActionButton} onClick={handleApplyCheaperVehicle}>Ver opción más económica</button>
                </div>
              </div>
            ) : (
              <div className={styles.adviceCardPositive}>
                <div className={styles.adviceHeading}>Análisis favorable</div>
                <p>Tu perfil muestra un margen saludable para este crédito. Puedes seguir con el proceso con confianza y, si quieres, ajustar el plazo para bajar aún más la cuota mensual.</p>
              </div>
            )}

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Estado de la solicitud</span>
                <strong>Enviado</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '100%' }}></div>
              </div>
            </div>
            <button type="button" className={styles.actionButtonPrimary} onClick={handleClose}>Cerrar</button>
          </div>
        ) : isSubmitting ? (
          <div className={styles.successScreen}>
            <div className={styles.sportyBadge}>Pit stop financiero</div>
            <h2 className={styles.title}>Procesando solicitud</h2>
            <p className={styles.summary}>Estamos analizando tu perfil y el crédito del vehículo para darte una respuesta ordenada y clara.</p>
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Estado de la solicitud</span>
                <strong>{requestStatus === 'sent' ? 'Enviando' : requestStatus === 'inProgress' ? 'En proceso' : 'Enviado'}</strong>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: requestStatus === 'sent' ? '33%' : requestStatus === 'inProgress' ? '66%' : '100%' }}></div>
              </div>
              <div className={styles.stepper}>
                {progressSteps.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isComplete = index < currentStepIndex;
                  return (
                    <div
                      key={step}
                      className={`${styles.stepChip} ${isComplete ? styles.stepChipComplete : ''} ${isActive ? styles.stepChipActive : ''}`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>
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
                  {!errors.downPayment && (
                    <span className={styles.helperText}>Sugerido automáticamente: ${suggestedDownPayment.toLocaleString("en-US")}</span>
                  )}
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
