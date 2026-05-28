import { Vehicle } from "./types";
import styles from "./VehicleCard.module.css";

type VehicleCardProps = {
  vehicle: Vehicle;
  onOpenDetail: (vehicle: Vehicle) => void;
};

export default function VehicleCard({ vehicle, onOpenDetail }: VehicleCardProps) {
  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={() => onOpenDetail(vehicle)}
        className={styles.cardButton}
      >
        <div className={styles.media}>
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className={styles.image}
            loading="lazy"
          />
          <span className={styles.yearBadge}>
            {vehicle.year}
          </span>
        </div>
        <div className={styles.body}>
          <div>
            <h3 className={styles.brand}>{vehicle.brand}</h3>
            <p className={styles.model}>{vehicle.model}</p>
          </div>
          <div className={styles.priceRow}>
            <p className={styles.price}>
              ${vehicle.price.toLocaleString("en-US")}
            </p>
            <p className={styles.stock}>Stock: {vehicle.stock}</p>
          </div>
          <div className={styles.metaList}>
            <span className={styles.metaPill}>
              {vehicle.mileage.toLocaleString("en-US")} km
            </span>
            <span className={styles.metaPill}>
              {vehicle.colors.length} colores
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
