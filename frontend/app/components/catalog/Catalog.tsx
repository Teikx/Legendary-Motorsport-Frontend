"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import VehicleDetailModal from "./VehicleDetailModal";
import VehicleCard from "./VehicleCard";
import { vehicles } from "./data";
import { CartItem, Vehicle } from "./types";
import styles from "./Catalog.module.css";

type SortOption = "price-desc" | "price-asc" | "newest";

export default function Catalog() {
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const sortedVehicles = useMemo(() => {
    const list = [...vehicles];
    switch (sortOption) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
      default:
        return list.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
    }
  }, [sortOption]);

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );

  const openVehicleDetail = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailOpen(true);
  };

  const closeVehicleDetail = () => {
    setIsDetailOpen(false);
  };

  const handleAddToCart = (vehicle: Vehicle, color: string, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.vehicleId === vehicle.id && item.color === color,
      );
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: `${vehicle.id}-${color}`,
          vehicleId: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          price: vehicle.price,
          color,
          quantity,
          image: vehicle.image,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (vehicle: Vehicle, color: string, quantity: number) => {
    handleAddToCart(vehicle, color, quantity);
    closeVehicleDetail();
    handleProceedToCheckout();
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className={styles.shell}>
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
        {sortedVehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onOpenDetail={openVehicleDetail}
          />
        ))}
      </section>

      <VehicleDetailModal
        vehicle={selectedVehicle}
        isOpen={isDetailOpen}
        onClose={closeVehicleDetail}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        subtotal={subtotal}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
}
