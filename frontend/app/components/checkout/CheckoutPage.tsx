/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../header/Header";
import styles from "./CheckoutPage.module.css";
import { CreditCard } from "./CreditCard";

type Address = {
  id: number;
  label: string;
  line1: string;
  city: string;
  region: string;
  zip: string;
  country: string;
};

type Card = {
  id: number;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
  number: string;
  cvv: string;
};

type VehicleItem = {
  idProducto: number;
  model: string;
  color: string;
  mileage: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string;
};

type CheckoutItem = {
  idProducto: number;
  cantidad: number;
  precio: number;
  subtotal: number;
};

type CheckoutResponse = {
  idCompra: number;
  total: number;
  items: CheckoutItem[];
};

const API_BASE_URL = "http://localhost:5035";

const mockCustomer = {
  name: "",
  email: "",
  phone: "",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(mockCustomer);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(
    0,
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<number>(0);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    id: 0,
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
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<VehicleItem[]>([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutResponse | null>(
    null,
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState<number | null>(null);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems],
  );
  const transferFee = useMemo(() => Math.round(subtotal * 0.018), [subtotal]);
  const taxes = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = useMemo(
    () => subtotal + transferFee + taxes,
    [subtotal, transferFee, taxes],
  );

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const validatePhone = (value: string) => value.replace(/\D/g, "").length >= 9;

  const fetchWithAuth = useCallback(async (input: RequestInfo, init?: RequestInit) => {
    const token = localStorage.getItem("authToken");
    const headers = new Headers(init?.headers ?? {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }, []);

  const loadCustomer = useCallback(
    async (clientId: number) => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/clientes/${clientId}`,
        );
        const data = await response.json().catch(() => null);
        if (!response.ok || !data) {
          throw new Error("No se pudo cargar el cliente");
        }
        const firstName = data.nombre ?? data.Nombre ?? "";
        const lastName = data.apellido ?? data.Apellido ?? "";
        const phone = data.telefono ?? data.Telefono ?? "";
        setCustomer((prev) => ({
          ...prev,
          name: `${firstName} ${lastName}`.trim(),
          phone,
        }));
      } catch (err) {
        setProfileError("No se pudo cargar la informacion del cliente");
      }
    },
    [fetchWithAuth],
  );

  const loadAddresses = useCallback(
    async (clientId: number) => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/direcciones/cliente/${clientId}`,
        );
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error("No se pudieron cargar las direcciones");
        }
        const mapped: Address[] = (Array.isArray(data) ? data : []).map(
          (item: any) => ({
            id: item.idDire ?? item.IdDire,
            label: item.nombre ?? item.Nombre,
            line1: item.direccion ?? item.Direccion,
            city: item.ciudad ?? item.Ciudad,
            region: item.region ?? item.Region,
            zip: item.codigo_postal ?? item.Codigo_postal ?? item.codigoPostal,
            country: item.pais ?? item.Pais,
          }),
        );
        setAddresses(mapped);
        // Use functional update to avoid stale closure — don't add selectedAddressId as dep
        setSelectedAddressId((prev) => {
          if (mapped.length > 0 && (!prev || !mapped.some((item) => item.id === prev))) {
            return mapped[0].id;
          }
          return prev;
        });
      } catch (err) {
        setProfileError("No se pudieron cargar las direcciones");
      }
    },
    [fetchWithAuth],
  );

  const loadCards = useCallback(
    async (clientId: number) => {
      try {
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/tarjetas/cliente/${clientId}`,
        );
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error("No se pudieron cargar las tarjetas");
        }
        const mapped: Card[] = (Array.isArray(data) ? data : []).map((item: any) => {
          const rawNumber = String(item.numero ?? item.Numero ?? "");
          const last4 = rawNumber.slice(-4) || String(item.last4 ?? "");
          return {
            id: item.idTarjeta ?? item.IdTarjeta,
            brand: "Tarjeta",
            last4,
            holder: item.nombre ?? item.Nombre ?? "",
            expiry: item.expiracion ?? item.Expiracion ?? "",
            number: rawNumber,
            cvv: String(item.ccv ?? item.CCV ?? ""),
          };
        });
        setCards(mapped);
        // Use functional update to avoid stale closure — don't add selectedPaymentId as dep
        setSelectedPaymentId((prev) => {
          if (mapped.length > 0 && (!prev || !mapped.some((item) => item.id === prev))) {
            return mapped[0].id;
          }
          return prev;
        });
      } catch (err) {
        setProfileError("No se pudieron cargar las tarjetas");
      }
    },
    [fetchWithAuth],
  );

  const loadCart = useCallback(async () => {
    setIsCartLoading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/activo`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error("No se pudo cargar el carrito");
      }
      const rawItems = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.Items)
          ? data.Items
          : [];
      const items: VehicleItem[] = rawItems.map((item: any) => ({
        idProducto: item.idProducto ?? item.IdProducto,
        model: `${item.marca ?? item.Marca ?? ""} ${item.modelo ?? item.Modelo ?? ""}`.trim(),
        color: item.color ?? item.Color ?? "",
        mileage: item.kilometraje ?? item.Kilometraje ?? 0,
        quantity: item.cantidad ?? item.Cantidad ?? 0,
        unitPrice: item.precio ?? item.Precio ?? 0,
        subtotal: item.subtotal ?? item.Subtotal ?? 0,
        imageUrl: item.imagenUrl ?? item.ImagenUrl ?? "",
      }));
      setCartItems(items);
    } catch (err) {
      setCheckoutError("No se pudo cargar el carrito.");
      setCartItems([]);
    } finally {
      setIsCartLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    const email = localStorage.getItem("email") ?? "";
    const storedClientId = Number(localStorage.getItem("idCliente") ?? "0");
    
    setTimeout(() => {
      setCustomer((prev) => ({ ...prev, email }));
      if (storedClientId) {
        setIdCliente(storedClientId);
      } else {
        setProfileError("No se encontro el cliente autenticado");
      }
    }, 0);

    if (storedClientId) {
      void loadCustomer(storedClientId);
      void loadAddresses(storedClientId);
      void loadCards(storedClientId);
    }
    void loadCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount — functions are stable (no reactive state in deps)

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

    if (!idCliente) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    const payload = {
      IdCliente: idCliente,
      Nombre: newAddress.label.trim(),
      DetalleDireccion: newAddress.line1.trim(),
      ciudad: newAddress.city.trim(),
      region: newAddress.region.trim(),
      CodigoPostal: newAddress.zip.trim(),
      pais: newAddress.country.trim(),
    };

    fetchWithAuth(`${API_BASE_URL}/api/direcciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo guardar la direccion");
        }
        await loadAddresses(idCliente);
        setShowNewAddress(false);
        setNewAddress({
          id: 0,
          label: "",
          line1: "",
          city: "",
          region: "",
          zip: "",
          country: "Peru",
        });
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo guardar la direccion");
      });
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setShowNewAddress(true);
    setNewAddress(address);
  };

  const handleCancelAddressEdit = () => {
    setEditingAddressId(null);
    setShowNewAddress(false);
    setNewAddress({
      id: 0,
      label: "",
      line1: "",
      city: "",
      region: "",
      zip: "",
      country: "Peru",
    });
  };

  const handleUpdateAddress = () => {
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

    if (!idCliente || !editingAddressId) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    const payload = {
      IdDire: editingAddressId,
      IdCliente: idCliente,
      Nombre: newAddress.label.trim(),
      DetalleDireccion: newAddress.line1.trim(),
      ciudad: newAddress.city.trim(),
      region: newAddress.region.trim(),
      CodigoPostal: newAddress.zip.trim(),
      pais: newAddress.country.trim(),
    };

    fetchWithAuth(`${API_BASE_URL}/api/direcciones`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo actualizar la direccion");
        }
        await loadAddresses(idCliente);
        setEditingAddressId(null);
        setShowNewAddress(false);
        setNewAddress({
          id: 0,
          label: "",
          line1: "",
          city: "",
          region: "",
          zip: "",
          country: "Peru",
        });
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo actualizar la direccion");
      });
  };

  const handleDeleteAddress = (addressId: number) => {
    if (!idCliente) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    fetchWithAuth(`${API_BASE_URL}/api/direcciones/${addressId}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo eliminar la direccion");
        }
        await loadAddresses(idCliente);
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo eliminar la direccion");
      });
  };

  const handleAddCard = () => {
    const draftErrors: Record<string, string> = {};
    if (!newCard.number.trim()) draftErrors.cardNumber = "Numero requerido";
    if (!newCard.expiry.trim()) draftErrors.cardExpiry = "Expiracion requerida";
    if (!newCard.cvv.trim()) draftErrors.cardCvv = "CVV requerido";
    if (!newCard.holder.trim()) draftErrors.cardHolder = "Titular requerido";

    if (Object.keys(draftErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...draftErrors }));
      return;
    }

    if (!idCliente) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    const payload = {
      Numero: newCard.number.trim(),
      Expiracion: newCard.expiry.trim(),
      CCV: newCard.cvv.trim(),
      Nombre: newCard.holder.trim(),
      IdCliente: idCliente,
    };

    fetchWithAuth(`${API_BASE_URL}/api/tarjetas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo guardar la tarjeta");
        }
        await loadCards(idCliente);
        setShowNewCard(false);
        setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo guardar la tarjeta");
      });
  };

  const handleEditCard = (card: Card) => {
    setEditingCardId(card.id);
    setShowNewCard(true);
    setNewCard({
      number: card.number,
      expiry: card.expiry,
      cvv: card.cvv,
      holder: card.holder,
    });
  };

  const handleCancelCardEdit = () => {
    setEditingCardId(null);
    setShowNewCard(false);
    setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
  };

  const handleUpdateCard = () => {
    const draftErrors: Record<string, string> = {};
    if (!newCard.number.trim()) draftErrors.cardNumber = "Numero requerido";
    if (!newCard.expiry.trim()) draftErrors.cardExpiry = "Expiracion requerida";
    if (!newCard.cvv.trim()) draftErrors.cardCvv = "CVV requerido";
    if (!newCard.holder.trim()) draftErrors.cardHolder = "Titular requerido";

    if (Object.keys(draftErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...draftErrors }));
      return;
    }

    if (!idCliente || !editingCardId) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    const payload = {
      IdTarjeta: editingCardId,
      Numero: newCard.number.trim(),
      Expiracion: newCard.expiry.trim(),
      CCV: newCard.cvv.trim(),
      Nombre: newCard.holder.trim(),
      IdCliente: idCliente,
    };

    fetchWithAuth(`${API_BASE_URL}/api/tarjetas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo actualizar la tarjeta");
        }
        await loadCards(idCliente);
        setEditingCardId(null);
        setShowNewCard(false);
        setNewCard({ number: "", expiry: "", cvv: "", holder: "" });
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo actualizar la tarjeta");
      });
  };

  const handleDeleteCard = (cardId: number) => {
    if (!idCliente) {
      setProfileError("No se encontro el cliente autenticado");
      return;
    }

    fetchWithAuth(`${API_BASE_URL}/api/tarjetas/${cardId}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error ?? "No se pudo eliminar la tarjeta");
        }
        await loadCards(idCliente);
      })
      .catch((err) => {
        setProfileError(err?.message ?? "No se pudo eliminar la tarjeta");
      });
  };

  const handleCancelCheckout = () => {
    router.push("/catalog");
  };

  const handleSubmit = () => {
    const draftErrors: Record<string, string> = {};
    setCheckoutError(null);
    if (!customer.name.trim()) draftErrors.customerName = "Nombre requerido";
    if (!validateEmail(customer.email)) draftErrors.customerEmail = "Email invalido";
    if (!validatePhone(customer.phone)) draftErrors.customerPhone = "Telefono invalido";

    if (!selectedAddressId) draftErrors.address = "Selecciona una direccion";

    if (!selectedPaymentId) draftErrors.payment = "Selecciona un metodo de pago";

    setErrors(draftErrors);
    if (Object.keys(draftErrors).length > 0) return;

    if (!cartItems.length) {
      setCheckoutError("El carrito no tiene items.");
      return;
    }

    setIsSubmitting(true);

    fetchWithAuth(`${API_BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idTarjeta: selectedPaymentId,
        idDireccion: selectedAddressId,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudo completar el checkout");
        }
        const checkoutData = data as CheckoutResponse;
        setCheckoutSummary(checkoutData);
        setOrderNumber(String(checkoutData.idCompra));
        setOrderSuccess(true);
      })
      .catch((err) => {
        setCheckoutError(err?.message ?? "No se pudo conectar con el servidor");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (orderSuccess) {
    return (
      <div className={styles.shell}>
        <Header />
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
              <p className={styles.summaryText}>
                Total pagado: {formatCurrency(checkoutSummary?.total ?? total)}
              </p>
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
              {(checkoutSummary?.items ?? []).map((item) => (
                <div key={item.idProducto} className={styles.summaryItem}>
                  <div>
                    <p className={styles.summaryItemTitle}>
                      Producto #{item.idProducto}
                    </p>
                    <p className={styles.summaryText}>
                      {item.cantidad} unidad(es)
                    </p>
                  </div>
                  <p className={styles.summaryItemValue}>
                    {formatCurrency(item.subtotal)}
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
      <Header />
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
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.cancelCheckoutButton}
              onClick={handleCancelCheckout}
            >
              Retroceder y cancelar
            </button>
            <div className={styles.infoBadge}>
              Integracion activa con ASP.NET Core Web API
            </div>
          </div>
        </div>
        {profileError && <p className={styles.error}>{profileError}</p>}

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
                  onClick={() =>
                    editingAddressId
                      ? handleCancelAddressEdit()
                      : setShowNewAddress((prev) => !prev)
                  }
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
                      <div className={styles.choiceActions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => handleEditAddress(address)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Eliminar
                        </button>
                      </div>
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
                      onClick={editingAddressId ? handleUpdateAddress : handleAddAddress}
                    >
                      {editingAddressId ? "Guardar cambios" : "Guardar direccion"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>Metodo de pago</h2>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() =>
                    editingCardId
                      ? handleCancelCardEdit()
                      : setShowNewCard((prev) => !prev)
                  }
                >
                  {showNewCard ? "Cancelar" : "Anadir tarjeta"}
                </button>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", overflow: "hidden" }}>
                      <CreditCard
                        company={card.brand}
                        cardNumber={
                          card.number && card.number.length >= 15
                            ? card.number.replace(/(.{4})/g, "$1 ").trim()
                            : `**** **** **** ${card.last4}`
                        }
                        cardHolder={card.holder || "TITULAR"}
                        cardExpiration={card.expiry || "MM/AA"}
                        width={250}
                        type={card.id % 2 === 0 ? "brand-dark" : "gray-dark"}
                      />
                      <div className={styles.choiceActions}>
                        <button
                          type="button"
                          className={styles.actionButton}
                          onClick={() => handleEditCard(card)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.payment && (
                <p className={`${styles.error} ${styles.errorMargin}`}>
                  {errors.payment}
                </p>
              )}

              {showNewCard && (
                <div className={`${styles.panelFormBlock} ${styles.animatedFormBlock}`}>
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
                  <div className={styles.formBlockAction}>
                    <button
                      type="button"
                      className={styles.panelButton}
                      onClick={editingCardId ? handleUpdateCard : handleAddCard}
                    >
                      {editingCardId ? "Guardar cambios" : "Guardar tarjeta"}
                    </button>
                  </div>
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
                {isCartLoading ? (
                  <div className={styles.item}>Cargando detalle del carrito...</div>
                ) : cartItems.length === 0 ? (
                  <div className={styles.item}>No hay items en el carrito.</div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.idProducto} className={styles.item}>
                      <div>
                        <p className={styles.itemTitle}>{item.model}</p>
                        <p className={styles.itemMeta}>
                          {item.color} · {item.mileage.toLocaleString("en-US")} km · {item.quantity} unidad(es)
                        </p>
                      </div>
                      <p className={styles.itemValue}>
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  ))
                )}
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
              {checkoutError && (
                <p className={styles.error}>{checkoutError}</p>
              )}
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
