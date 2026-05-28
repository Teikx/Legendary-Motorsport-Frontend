"use client";

import { useMemo, useState } from "react";
import styles from "./CheckoutPage.module.css";

type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
  region: string;
  zip: string;
  country: string;
};

type Card = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
};

type VehicleItem = {
  id: string;
  model: string;
  color: string;
  quantity: number;
  unitPrice: number;
};

const mockCustomer = {
  name: "Carlos Mendez",
  email: "carlos.mendez@autovista.com",
  phone: "+51 999 312 457",
};

const mockAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Casa",
    line1: "Av. Primavera 1120",
    city: "Surco",
    region: "Lima",
    zip: "15023",
    country: "Peru",
  },
  {
    id: "addr-2",
    label: "Trabajo",
    line1: "Jr. Los Laureles 580",
    city: "San Isidro",
    region: "Lima",
    zip: "15046",
    country: "Peru",
  },
];

const mockCards: Card[] = [
  {
    id: "card-1",
    brand: "Visa",
    last4: "4321",
    holder: "Carlos Mendez",
    expiry: "08/27",
  },
  {
    id: "card-2",
    brand: "Mastercard",
    last4: "1109",
    holder: "Carlos Mendez",
    expiry: "03/26",
  },
];

const mockCart: VehicleItem[] = [
  {
    id: "veh-1",
    model: "Aurus Sigma XR",
    color: "Negro Obsidiana",
    quantity: 1,
    unitPrice: 148900,
  },
  {
    id: "veh-2",
    model: "Vento Horizon 2025",
    color: "Azul Marino",
    quantity: 2,
    unitPrice: 86900,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutPage() {
  const [customer, setCustomer] = useState(mockCustomer);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [cards] = useState<Card[]>(mockCards);
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses[0]?.id ?? "",
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(cards[0]?.id ?? "");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    id: "new",
    label: "",
    line1: "",
    city: "",
    region: "",
    zip: "",
    country: "Peru",
  });
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holder: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = useMemo(
    () => mockCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [],
  );
  const transferFee = useMemo(() => Math.round(subtotal * 0.018), [subtotal]);
  const taxes = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = useMemo(
    () => subtotal + transferFee + taxes,
    [subtotal, transferFee, taxes],
  );

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validatePhone = (value: string) => value.replace(/\D/g, "").length >= 9;
  const validateCardNumber = (value: string) => value.replace(/\s/g, "").length >= 13;
  const validateExpiry = (value: string) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
  const validateCvv = (value: string) => /^\d{3,4}$/.test(value);

  const handleAddAddress = () => {
    const draftErrors: Record<string, string> = {};
    if (!newAddress.label.trim()) draftErrors.label = "Etiqueta requerida";
    if (!newAddress.line1.trim()) draftErrors.line1 = "Direccion requerida";
    if (!newAddress.city.trim()) draftErrors.city = "Ciudad requerida";
    if (!newAddress.region.trim()) draftErrors.region = "Region requerida";
    if (!newAddress.zip.trim()) draftErrors.zip = "Codigo requerido";

    if (Object.keys(draftErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...draftErrors }));
      return;
    }

    const created = { ...newAddress, id: `addr-${Date.now()}` };
    setAddresses((prev) => [...prev, created]);
    setSelectedAddressId(created.id);
    setShowNewAddress(false);
    setNewAddress({
      id: "new",
      label: "",
      line1: "",
      city: "",
      region: "",
      zip: "",
      country: "Peru",
    });
  };

  const handleSubmit = () => {
    const draftErrors: Record<string, string> = {};
    if (!customer.name.trim()) draftErrors.customerName = "Nombre requerido";
    if (!validateEmail(customer.email)) draftErrors.customerEmail = "Email invalido";
    if (!validatePhone(customer.phone)) draftErrors.customerPhone = "Telefono invalido";

    if (!selectedAddressId) draftErrors.address = "Selecciona una direccion";

    if (!selectedPaymentId) draftErrors.payment = "Selecciona un metodo de pago";
    if (selectedPaymentId === "new") {
      if (!validateCardNumber(newCard.number)) draftErrors.cardNumber = "Numero invalido";
      if (!validateExpiry(newCard.expiry)) draftErrors.cardExpiry = "Expiracion invalida";
      if (!validateCvv(newCard.cvv)) draftErrors.cardCvv = "CVV invalido";
      if (!newCard.holder.trim()) draftErrors.cardHolder = "Titular requerido";
    }

    setErrors(draftErrors);
    if (Object.keys(draftErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderNumber(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
      setOrderSuccess(true);
    }, 1400);
  };

  if (orderSuccess) {
    return (
      <div className={styles.shell}>
        <div className={`${styles.glow} ${styles.glowTop}`} />
        <div className={`${styles.glow} ${styles.glowBottom}`} />
        <main className={`${styles.card} ${styles.cardSuccess}`}>
          <p className={styles.kicker}>compra finalizada</p>
          <h1 className={styles.successTitle}>Gracias por tu compra</h1>
          <p className={styles.subtitle}>
            Tu orden fue registrada con exito. Este flujo esta listo para conectarse
            a ASP.NET Core Web API.
          </p>

          <div className={styles.successSummary}>
            <div>
              <p className={styles.summaryLabel}>Orden</p>
              <p className={styles.summaryValue}>{orderNumber}</p>
              <p className={styles.summaryText}>Total pagado: {formatCurrency(total)}</p>
            </div>
            <div>
              <p className={styles.summaryLabel}>Entrega</p>
              <p className={styles.summaryAddress}>
                {addresses.find((item) => item.id === selectedAddressId)?.line1}
              </p>
              <p className={styles.summaryText}>
                {addresses.find((item) => item.id === selectedAddressId)?.city},
                {" "}
                {addresses.find((item) => item.id === selectedAddressId)?.region}
              </p>
            </div>
          </div>

          <div className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>Resumen de vehiculos</h2>
            <div className={styles.summaryList}>
              {mockCart.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div>
                    <p className={styles.summaryItemTitle}>{item.model}</p>
                    <p className={styles.summaryText}>
                      {item.color} · {item.quantity} unidad(es)
                    </p>
                  </div>
                  <p className={styles.summaryItemValue}>
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={`${styles.glow} ${styles.glowTop}`} />
      <div className={`${styles.glow} ${styles.glowBottom}`} />

      <main className={`${styles.card} ${styles.cardMain}`}>
        <div className={styles.headerRow}>
          <div>
            <p className={styles.kicker}>checkout</p>
            <h1 className={styles.pageTitle}>Vista de pago vehicular</h1>
            <p className={styles.subtitle}>
              Revisa tu informacion y confirma el metodo de pago para finalizar la compra.
            </p>
          </div>
          <div className={styles.infoBadge}>
            Integracion futura con ASP.NET Core Web API
          </div>
        </div>

        <div className={styles.contentGrid}>
          <section className={styles.formColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Informacion del cliente</h2>
                <span className={styles.badge}>Autocompletado</span>
              </div>
              <div className={styles.panelGridThree}>
                <label className={styles.field}>
                  Nombre
                  <input
                    value={customer.name}
                    onChange={(event) =>
                      setCustomer((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className={styles.input}
                  />
                  {errors.customerName && (
                    <span className={styles.error}>{errors.customerName}</span>
                  )}
                </label>
                <label className={styles.field}>
                  Email
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      setCustomer((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className={styles.input}
                  />
                  {errors.customerEmail && (
                    <span className={styles.error}>{errors.customerEmail}</span>
                  )}
                </label>
                <label className={styles.field}>
                  Telefono
                  <input
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className={styles.input}
                  />
                  {errors.customerPhone && (
                    <span className={styles.error}>{errors.customerPhone}</span>
                  )}
                </label>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Direcciones vinculadas</h2>
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => setShowNewAddress((prev) => !prev)}
                >
                  {showNewAddress ? "Cancelar" : "Anadir nueva"}
                </button>
              </div>
              <div className={styles.panelGridTwo}>
                {addresses.map((address) => (
                  <label key={address.id} className={styles.choice}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div>
                      <p className={styles.choiceTitle}>{address.label}</p>
                      <p className={styles.choiceMeta}>{address.line1}</p>
                      <p className={styles.choiceMeta}>
                        {address.city}, {address.region}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.address && (
                <p className={`${styles.error} ${styles.errorMargin}`}>
                  {errors.address}
                </p>
              )}

              {showNewAddress && (
                <div className={styles.panelFormBlock}>
                  <label className={styles.field}>
                    Etiqueta
                    <input
                      value={newAddress.label}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, label: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.label && (
                      <span className={styles.error}>{errors.label}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Direccion
                    <input
                      value={newAddress.line1}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, line1: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.line1 && (
                      <span className={styles.error}>{errors.line1}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Ciudad
                    <input
                      value={newAddress.city}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, city: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.city && (
                      <span className={styles.error}>{errors.city}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Region
                    <input
                      value={newAddress.region}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, region: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.region && (
                      <span className={styles.error}>{errors.region}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Codigo postal
                    <input
                      value={newAddress.zip}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, zip: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.zip && (
                      <span className={styles.error}>{errors.zip}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Pais
                    <input
                      value={newAddress.country}
                      onChange={(event) =>
                        setNewAddress((prev) => ({ ...prev, country: event.target.value }))
                      }
                      className={styles.input}
                    />
                  </label>
                  <div className={styles.formBlockAction}>
                    <button
                      type="button"
                      className={styles.panelButton}
                      onClick={handleAddAddress}
                    >
                      Guardar direccion
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Metodo de pago</h2>
                <span className={styles.badge}>Tarjetas vinculadas</span>
              </div>
              <div className={styles.panelGridTwo}>
                {cards.map((card) => (
                  <label key={card.id} className={styles.choice}>
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPaymentId === card.id}
                      onChange={() => setSelectedPaymentId(card.id)}
                    />
                    <div>
                      <p className={styles.choiceTitle}>{card.brand}</p>
                      <p className={styles.choiceMeta}>
                        **** **** **** {card.last4}
                      </p>
                      <p className={styles.choiceMeta}>{card.holder}</p>
                    </div>
                  </label>
                ))}
                <label className={styles.choice}>
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPaymentId === "new"}
                    onChange={() => setSelectedPaymentId("new")}
                  />
                  <div>
                    <p className={styles.choiceTitle}>Nueva tarjeta</p>
                    <p className={styles.choiceMeta}>Agrega un metodo nuevo</p>
                  </div>
                </label>
              </div>
              {errors.payment && (
                <p className={`${styles.error} ${styles.errorMargin}`}>
                  {errors.payment}
                </p>
              )}

              {selectedPaymentId === "new" && (
                <div className={styles.panelFormBlock}>
                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    Numero de tarjeta
                    <input
                      value={newCard.number}
                      onChange={(event) =>
                        setNewCard((prev) => ({ ...prev, number: event.target.value }))
                      }
                      placeholder="4242 4242 4242 4242"
                      className={styles.input}
                    />
                    {errors.cardNumber && (
                      <span className={styles.error}>{errors.cardNumber}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    Expiracion (MM/AA)
                    <input
                      value={newCard.expiry}
                      onChange={(event) =>
                        setNewCard((prev) => ({ ...prev, expiry: event.target.value }))
                      }
                      placeholder="08/27"
                      className={styles.input}
                    />
                    {errors.cardExpiry && (
                      <span className={styles.error}>{errors.cardExpiry}</span>
                    )}
                  </label>
                  <label className={styles.field}>
                    CVV
                    <input
                      value={newCard.cvv}
                      onChange={(event) =>
                        setNewCard((prev) => ({ ...prev, cvv: event.target.value }))
                      }
                      placeholder="123"
                      className={styles.input}
                    />
                    {errors.cardCvv && (
                      <span className={styles.error}>{errors.cardCvv}</span>
                    )}
                  </label>
                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    Nombre del titular
                    <input
                      value={newCard.holder}
                      onChange={(event) =>
                        setNewCard((prev) => ({ ...prev, holder: event.target.value }))
                      }
                      className={styles.input}
                    />
                    {errors.cardHolder && (
                      <span className={styles.error}>{errors.cardHolder}</span>
                    )}
                  </label>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.sideColumn}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Detalle de compra</h2>
                <span className={styles.badge}>Vehiculos</span>
              </div>
              <div className={styles.panelStack}>
                {mockCart.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div>
                      <p className={styles.itemTitle}>{item.model}</p>
                      <p className={styles.itemMeta}>
                        {item.color} · {item.quantity} unidad(es)
                      </p>
                    </div>
                    <p className={styles.itemValue}>
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>Desglose financiero</h2>
              <div className={styles.summaryRows}>
                <div className={styles.row}>
                  <span className={styles.muted}>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.muted}>Gastos de gestion</span>
                  <span>{formatCurrency(transferFee)}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.muted}>Impuestos (IGV)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className={styles.divider} />
                <div className={`${styles.row} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={styles.payButton}
              >
                {isSubmitting ? "Procesando..." : "Finalizar compra"}
              </button>
              <p className={styles.helperText}>
                Al confirmar se generara la orden y se enviara el resumen al cliente.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
