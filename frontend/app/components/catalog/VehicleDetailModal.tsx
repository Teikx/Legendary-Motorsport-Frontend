import { useMemo, useState, useEffect, useRef } from "react";
import { VehicleDetail, InventoryItem } from "./types";
import styles from "./VehicleDetailModal.module.css";

type VehicleDetailModalProps = {
  vehicle: VehicleDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: number, quantity: number) => void;
  onBuyNow: (productId: number, quantity: number) => void;
  onApplyCredit: (selectedInventory: InventoryItem | null) => void;
};

export default function VehicleDetailModal({
  vehicle,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onApplyCredit,
}: VehicleDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inventory = useMemo(() => vehicle?.inventory ?? [], [vehicle]);
  const availableColors = useMemo(
    () => Array.from(new Set(inventory.map((item) => item.color))),
    [inventory],
  );
  const inventoryForColor = useMemo(
    () => inventory.filter((item) => item.color === selectedColor),
    [inventory, selectedColor],
  );
  const selectedInventory = useMemo(() => {
    if (selectedProductId) {
      return inventory.find((item) => item.idProducto === selectedProductId) ?? null;
    }
    return inventoryForColor[0] ?? null;
  }, [inventory, inventoryForColor, selectedProductId]);
  const stockAvailable = selectedInventory?.stock ?? 0;

  useEffect(() => {
    setSelectedColor("");
    setSelectedProductId(null);
    setQuantity(1);
  }, [vehicle?.id]);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, [isOpen]);

  if ((!isOpen && !isClosing) || !vehicle) {
    return null;
  }

  const handleClose = () => {
    if (isClosing) return;
    setSelectedColor("");
    setSelectedProductId(null);
    setQuantity(1);
    setIsClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 320);
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  const canBuy = selectedColor.length > 0 && Boolean(selectedInventory) && quantity > 0;
  const maxQty = Math.max(1, stockAvailable);

  return (
    <div
      className={isClosing ? styles.overlayClosing : styles.overlay}
    >
      <div
        className={isClosing ? styles.backdropClosing : styles.backdrop}
        onClick={handleBackdropClick}
      />
      <div className={isClosing ? styles.modalClosing : styles.modal}>
        <div className={styles.layout}>
          <div className={styles.media}>
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className={styles.image}
            />
          </div>
          <div className={styles.content}>
            <div>
              <p className={styles.kicker}>
                detalle
              </p>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>
                  {vehicle.brand} {vehicle.model}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.closeButtonPrimary}
                >
                  Cerrar
                </button>
              </div>
              <p className={styles.subtitle}>
                ${selectedInventory?.precio.toLocaleString("en-US") ?? "--"} · Stock: {stockAvailable}
              </p>
            </div>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Ano</p>
                <p className={styles.statValue}>Actualizado</p>
              </div>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>Kilometraje</p>
                <p className={styles.statValue}>
                  {selectedInventory
                    ? `${selectedInventory.kilometraje.toLocaleString("en-US")} km`
                    : "--"}
                </p>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionLabel}>Selecciona color</p>
              <div className={styles.colorList}>
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color);
                      const nextItem = inventory.find((item) => item.color === color);
                      setSelectedProductId(nextItem?.idProducto ?? null);
                    }}
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

            {selectedColor && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Kilometraje disponible</p>
                <div className={styles.colorList}>
                  {inventoryForColor.map((item) => (
                    <button
                      key={item.idProducto}
                      type="button"
                      onClick={() => setSelectedProductId(item.idProducto)}
                      className={
                        selectedProductId === item.idProducto
                          ? styles.colorButtonActive
                          : styles.colorButton
                      }
                    >
                      {item.kilometraje.toLocaleString("en-US")} km
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                onClick={() =>
                  selectedInventory && onAddToCart(selectedInventory.idProducto, quantity)
                }
                className={styles.primaryButton}
              >
                Agregar al carrito
              </button>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() =>
                  selectedInventory && onBuyNow(selectedInventory.idProducto, quantity)
                }
                className={styles.secondaryButton}
              >
                Comprar ahora
              </button>
              <button
                type="button"
                onClick={() => onApplyCredit(selectedInventory)}
                className={styles.creditButton}
              >
                Solicitar Crédito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
