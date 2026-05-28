import { CartItem } from "./types";
import styles from "./CartDrawer.module.css";

type CartDrawerProps = {
  isOpen: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onProceedToCheckout: () => void;
};

export default function CartDrawer({
  isOpen,
  items,
  subtotal,
  onClose,
  onUpdateQuantity,
  onProceedToCheckout,
}: CartDrawerProps) {
  return (
    <div
      className={
        isOpen ? styles.drawerOpen : styles.drawerClosed
      }
    >
      <div
        className={
          isOpen ? styles.overlayVisible : styles.overlayHidden
        }
        onClick={onClose}
      />
      <aside
        className={
          isOpen ? styles.panelOpen : styles.panelClosed
        }
      >
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Carrito</h3>
            <p className={styles.count}>{items.length} items</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            Cerrar
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              Tu carrito esta vacio. Agrega un vehiculo para comenzar.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={styles.item}
              >
                <img
                  src={item.image}
                  alt={`${item.brand} ${item.model}`}
                  className={styles.itemImage}
                />
                <div className={styles.itemBody}>
                  <div>
                    <p className={styles.itemTitle}>
                      {item.brand} {item.model}
                    </p>
                    <p className={styles.itemMeta}>Color: {item.color}</p>
                  </div>
                  <div className={styles.itemRow}>
                    <p className={styles.itemPrice}>
                      ${item.price.toLocaleString("en-US")}
                    </p>
                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className={styles.quantityButton}
                      >
                        -
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span className={styles.subtotalValue}>
              ${subtotal.toLocaleString("en-US")}
            </span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={onProceedToCheckout}
            className={styles.checkoutButton}
          >
            Proceder al Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}
