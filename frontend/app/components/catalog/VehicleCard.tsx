import { CatalogVehicle } from "./types";
import styles from "./VehicleCard.module.css";

type VehicleCardProps = {
  vehicle: CatalogVehicle;
  onOpenDetail: (vehicle: CatalogVehicle) => void;
  isCompared: boolean;
  onToggleCompare: () => void;
};

export default function VehicleCard({ 
  vehicle, 
  onOpenDetail, 
  isCompared, 
  onToggleCompare 
}: VehicleCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardInner}>
        {/* Botón de comparación flotante sobre la imagen */}
        <div className={styles.compareCheckboxArea}>
          <label className={styles.compareLabel}>
            <input
              type="checkbox"
              checked={isCompared}
              onChange={onToggleCompare}
              className={styles.checkboxInput}
            />
            <span>Comparar</span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => onOpenDetail(vehicle)}
          className={styles.cardButton}
        >
          <div className={styles.media}>
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className={styles.image}
              loading="lazy"
            />
            <span className={styles.yearBadge}>Disponible</span>
          </div>
          <div className={styles.body}>
            <div>
              <h3 className={styles.brand}>{vehicle.brand}</h3>
              <p className={styles.model}>{vehicle.model}</p>
            </div>
            <div className={styles.priceRow}>
              <p className={styles.price}>
                ${vehicle.minPrice.toLocaleString("en-US")}
              </p>
              <p className={styles.stock}>Stock: {vehicle.stockTotal}</p>
            </div>
            <div className={styles.metaList}>
              <span className={styles.metaPill}>
                Desde {vehicle.minPrice.toLocaleString("en-US")}
              </span>
              <span className={styles.metaPill}>
                {vehicle.colorsAvailable} colores
              </span>
            </div>
          </div>
        </button>
      </div>
    </article>
  );
}

