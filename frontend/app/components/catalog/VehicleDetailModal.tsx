import { useMemo, useState } from "react";
import { Vehicle } from "./types";
import styles from "./VehicleDetailModal.module.css";

type VehicleDetailModalProps = {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (vehicle: Vehicle, color: string, quantity: number) => void;
  onBuyNow: (vehicle: Vehicle, color: string, quantity: number) => void;
};

export default function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}: VehicleDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const stockAvailable = useMemo(() => vehicle?.stock ?? 0, [vehicle]);

  if (!isOpen || !vehicle) {
    return null;
  }

  const handleClose = () => {
    setSelectedColor("");
    setQuantity(1);
    onClose();
  };

  const canBuy = selectedColor.length > 0 && quantity > 0;
  const maxQty = Math.max(1, stockAvailable);

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={handleClose} />
      <div className={styles.modal}>
        <div className={styles.layout}>
          <div className={styles.media}>
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className={styles.image}
            />
            <button
              type="button"
              onClick={handleClose}
              className={styles.closeButton}
            >
              Cerrar
            </button>
          </div>
          <div className={styles.content}>
            <div>
              <p className={styles.kicker}>
                detalle
              </p>
              <h2 className={styles.title}>
                {vehicle.brand} {vehicle.model}
              </h2>
              <p className={styles.subtitle}>
                ${vehicle.price.toLocaleString("en-US")} · Stock: {vehicle.stock}
              </p>
            </div>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Ano</p>
                <p className={styles.statValue}>{vehicle.year}</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Kilometraje</p>
                <p className={styles.statValue}>
                  {vehicle.mileage.toLocaleString("en-US")} km
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>Selecciona color</p>
              <div className={styles.colorList}>
                {vehicle.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={
                      selectedColor === color
                        ? styles.colorButtonActive
                        : styles.colorButton
                    }
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.quantityRow}>
              <label className={styles.quantityLabel}>
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className={styles.quantityInput}
                />
              </label>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => onAddToCart(vehicle, selectedColor, quantity)}
                className={styles.primaryButton}
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => onBuyNow(vehicle, selectedColor, quantity)}
                className={styles.secondaryButton}
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
