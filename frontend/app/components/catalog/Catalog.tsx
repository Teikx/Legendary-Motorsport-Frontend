"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import VehicleDetailModal from "./VehicleDetailModal";
import VehicleCard from "./VehicleCard";
import { Cart, CartItem, CatalogVehicle, VehicleDetail } from "./types";
import styles from "./Catalog.module.css";
import Header from "../header/Header";

type SortOption = "price-desc" | "price-asc" | "newest";

const API_BASE_URL = "http://localhost:5035";

const formatCatalogVehicle = (item: any): CatalogVehicle => ({
  id: item.idVehiculo,
  brand: item.marca,
  model: item.modelo,
  imageUrl: item.imagenUrl,
  minPrice: item.precioMinimo,
  stockTotal: item.stockTotal,
  colorsAvailable: item.coloresDisponibles,
});

const formatVehicleDetail = (item: any): VehicleDetail => ({
  id: item.idVehiculo,
  brand: item.marca,
  model: item.modelo,
  imageUrl: item.imagenUrl,
  inventory: (item.inventario ?? []).map((inv: any) => ({
    idProducto: inv.idProducto,
    color: inv.color,
    kilometraje: inv.kilometraje,
    precio: inv.precio,
    stock: inv.stock,
  })),
});

const formatCart = (cart: any): Cart => ({
  idCarrito: cart.idCarrito,
  idCliente: cart.idCliente,
  total: cart.total,
  estado: cart.estado,
  items: (cart.items ?? []).map((item: any) => ({
    idDetalleCarrito: item.idDetalleCarrito,
    idProducto: item.idProducto,
    quantity: item.cantidad,
    price: item.precio,
    subtotal: item.subtotal,
    brand: item.marca,
    model: item.modelo,
    color: item.color,
    mileage: item.kilometraje,
    imageUrl: item.imagenUrl,
  })),
});

export default function Catalog() {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetail | null>(null);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockWarning, setStockWarning] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();
  const updateTimers = useRef<Record<number, ReturnType<typeof setTimeout> | null>>(
    {},
  );
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWithAuth = useCallback(async (input: RequestInfo, init?: RequestInit) => {
    const token = localStorage.getItem("authToken");
    const headers = new Headers(init?.headers ?? {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }, []);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/catalogo`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error("No se pudo cargar el catalogo");
      }
      setVehicles(Array.isArray(data) ? data.map(formatCatalogVehicle) : []);
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/activo`);
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) return;
      const formatted = formatCart(data);
      setCartItems(formatted.items);
    } catch (err) {
      // ignore cart loading errors for now
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadCatalog();
    void loadCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount — both functions have stable deps

  useEffect(() => {
    return () => {
      Object.values(updateTimers.current).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
      if (warningTimer.current) clearTimeout(warningTimer.current);
    };
  }, []);

  const showStockWarning = (message: string) => {
    setStockWarning(message);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    warningTimer.current = setTimeout(() => {
      setStockWarning(null);
    }, 4200);
  };

  const sortedVehicles = useMemo(() => {
    const list = [...vehicles];
    switch (sortOption) {
      case "price-asc":
        return list.sort((a, b) => a.minPrice - b.minPrice);
      case "price-desc":
        return list.sort((a, b) => b.minPrice - a.minPrice);
      case "newest":
      default:
        return list.sort((a, b) => b.id - a.id);
    }
  }, [sortOption, vehicles]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.subtotal, 0),
    [cartItems],
  );

  const openVehicleDetail = async (vehicle: CatalogVehicle) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/catalogo/${vehicle.id}`,
      );
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error("No se pudo cargar el detalle");
      }
      setSelectedVehicle(formatVehicleDetail(data));
      setIsDetailOpen(true);
    } catch (err) {
      setError("No se pudo cargar el detalle del vehiculo");
    }
  };

  const closeVehicleDetail = () => {
    setIsDetailOpen(false);
  };

  const handleAddToCart = async (productId: number, quantity: number) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idProducto: productId, cantidad: quantity }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
              ? data.error
              : null;
        if (response.status === 409 || /stock/i.test(message ?? "")) {
          showStockWarning(
            message ?? "No hay stock disponible para esta configuracion.",
          );
          return;
        }
        throw new Error("No se pudo agregar al carrito");
      }
      const formatted = formatCart(data);
      setCartItems(formatted.items);
      setIsCartOpen(true);
    } catch (err) {
      setError("No se pudo agregar el producto al carrito");
    }
  };

  const handleBuyNow = async (productId: number, quantity: number) => {
    await handleAddToCart(productId, quantity);
    closeVehicleDetail();
    handleProceedToCheckout();
  };

  const updateCartQuantity = async (productId: number, quantity: number) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/carrito/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idProducto: productId, cantidad: quantity }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
              ? data.error
              : null;
        if (response.status === 409 || /stock/i.test(message ?? "")) {
          showStockWarning(
            message ?? "No hay stock disponible para esta cantidad.",
          );
          void loadCart(); // Revertir los cambios locales con la data real
          return;
        }
        throw new Error("No se pudo actualizar el carrito");
      }
      const formatted = formatCart(data);
      setCartItems(formatted.items);
    } catch (err) {
      setError("No se pudo actualizar el carrito");
      void loadCart(); // Revertir en caso de cualquier error
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.idProducto === productId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item,
      ),
    );
    const existingTimer = updateTimers.current[productId];
    if (existingTimer) clearTimeout(existingTimer);
    updateTimers.current[productId] = setTimeout(() => {
      void updateCartQuantity(productId, quantity);
    }, 450);
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/carrito/items/${productId}`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error("No se pudo eliminar el item");
      }
      const formatted = formatCart(data);
      setCartItems(formatted.items);
    } catch (err) {
      setError("No se pudo eliminar el item del carrito");
    }
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className={styles.shell}>
      {stockWarning && (
        <div className={styles.stockToast} role="alert">
          <div className={styles.stockToastInner}>
            <span className={styles.stockIcon}>!</span>
            <div>
              <p className={styles.stockTitle}>Sin stock disponible</p>
              <p className={styles.stockMessage}>{stockWarning}</p>
            </div>
            <button
              type="button"
              onClick={() => setStockWarning(null)}
              className={styles.stockClose}
            >
              Ok
            </button>
          </div>
        </div>
      )}
      <div className={isDetailOpen ? styles.contentBlur : styles.content}>
        <Header />
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>
              catalogo
            </p>
            <h1 className={styles.title}>
              Vehiculos premium disponibles
            </h1>
            <p className={styles.subtitle}>
              Selecciona el modelo ideal, define su color y agregalo al carrito para
              continuar con el checkout.
            </p>
            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <div className={styles.actions}>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as SortOption)}
              className={styles.sortSelect}
            >
              <option value="newest">Mas recientes</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="price-asc">Precio: menor a mayor</option>
            </select>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={styles.cartButton}
            >
              Carrito
              {cartItems.length > 0 && (
                <span className={styles.cartBadge}>
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </header>

        <section className={styles.grid}>
          {isLoading ? (
            <div className={styles.loadingCard}>Cargando catalogo...</div>
          ) : (
            sortedVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onOpenDetail={openVehicleDetail}
              />
            ))
          )}
        </section>

        {(!isDetailOpen || isCartOpen) && (
          <CartDrawer
            isOpen={isCartOpen}
            items={cartItems}
            subtotal={subtotal}
            onClose={() => setIsCartOpen(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}
      </div>

      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailOpen}
        onClose={closeVehicleDetail}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
