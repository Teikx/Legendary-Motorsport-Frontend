"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "../header/Header";
import { CatalogVehicle, VehicleDetail } from "../catalog/types";
import styles from "./ComparePage.module.css";

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

export default function ComparePage() {
  const router = useRouter();
  const [catalogList, setCatalogList] = useState<CatalogVehicle[]>([]);
  const [selectedIds, setSelectedIds] = useState<(number | null)[]>([null, null, null]);
  const [vehicleDetails, setVehicleDetails] = useState<Record<number, VehicleDetail>>({});
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Cargar lista completa de vehículos para el dropdown selector
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoadingList(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalogo`);
        if (!response.ok) {
          throw new Error("No se pudo conectar con el catálogo de vehículos.");
        }
        const data = await response.json().catch(() => []);
        setCatalogList(Array.isArray(data) ? data.map(formatCatalogVehicle) : []);
      } catch (err: any) {
        setError("Error de conexión: No se pudo cargar la lista de vehículos desde el servidor.");
      } finally {
        setIsLoadingList(false);
      }
    };
    void fetchCatalog();
  }, []);

  // Cargar detalle del vehículo cuando se selecciona uno en una ranura (slot)
  const fetchVehicleDetail = useCallback(async (id: number) => {
    if (vehicleDetails[id]) return; // Evitar llamadas repetidas si ya está en caché local

    setLoadingDetails((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/catalogo/${id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener detalles del vehículo #${id}`);
      }
      const data = await response.json();
      const detail = formatVehicleDetail(data);
      setVehicleDetails((prev) => ({ ...prev, [id]: detail }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [id]: false }));
    }
  }, [vehicleDetails]);

  // Manejar cambio en un selector de columna
  const handleSelectSlot = async (slotIndex: number, idStr: string) => {
    const newSelectedIds = [...selectedIds];
    if (!idStr) {
      newSelectedIds[slotIndex] = null;
      setSelectedIds(newSelectedIds);
      return;
    }

    const id = Number(idStr);
    newSelectedIds[slotIndex] = id;
    setSelectedIds(newSelectedIds);

    await fetchVehicleDetail(id);
  };

  // Quitar un auto de una columna de comparación
  const handleClearSlot = (slotIndex: number) => {
    const newSelectedIds = [...selectedIds];
    newSelectedIds[slotIndex] = null;
    setSelectedIds(newSelectedIds);
  };

  return (
    <div className={styles.shell}>
      <Header />
      
      <main className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTitle}>
            <p className={styles.kicker}>Comparador</p>
            <h1 className={styles.title}>Comparar Vehículos</h1>
            <p className={styles.subtitle}>
              Elige hasta 3 vehículos del catálogo para comparar sus especificaciones, precios y colores en tiempo real.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => router.push("/catalog")} 
            className={styles.backButton}
          >
            Volver al Catálogo
          </button>
        </header>

        {error && (
          <div className={styles.errorMessage} role="alert">
            <p>{error}</p>
            <p className={styles.errorSub}>La comparación se visualizará con ranuras vacías hasta que se conecte la base de datos.</p>
          </div>
        )}

        <section className={styles.slotsGrid}>
          {selectedIds.map((selectedId, idx) => {
            const detail = selectedId ? vehicleDetails[selectedId] : null;
            const isLoading = selectedId ? loadingDetails[selectedId] : false;
            
            // Opciones disponibles para este dropdown (excluyendo los ya elegidos en otros slots para que no se dupliquen)
            const availableOptions = catalogList.filter(
              (item) => !selectedIds.includes(item.id) || item.id === selectedId
            );

            return (
              <div key={idx} className={styles.slotCard}>
                <div className={styles.slotSelectorArea}>
                  <label className={styles.selectorLabel}>
                    Vehículo #{idx + 1}
                    <select
                      value={selectedId ?? ""}
                      onChange={(e) => handleSelectSlot(idx, e.target.value)}
                      className={styles.selectInput}
                      disabled={isLoadingList}
                    >
                      <option value="">-- Seleccionar vehículo --</option>
                      {availableOptions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.brand} {v.model}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className={styles.slotContent}>
                  {isLoading ? (
                    <div className={styles.loadingSpinner}>Cargando especificaciones...</div>
                  ) : detail ? (
                    <div className={styles.vehicleData}>
                      <div className={styles.imageWrapper}>
                        <img 
                          src={detail.imageUrl} 
                          alt={`${detail.brand} ${detail.model}`} 
                          className={styles.vehicleImage}
                        />
                        <button
                          type="button"
                          onClick={() => handleClearSlot(idx)}
                          className={styles.clearButton}
                          title="Remover de la comparación"
                        >
                          ✕ Quitar
                        </button>
                      </div>
                      
                      <div className={styles.vehicleBasicInfo}>
                        <h3 className={styles.brand}>{detail.brand}</h3>
                        <p className={styles.model}>{detail.model}</p>
                        
                        <div className={styles.priceBadge}>
                          Desde ${detail.inventory.length > 0 
                            ? Math.min(...detail.inventory.map(i => i.precio)).toLocaleString("en-US") 
                            : "N/A"
                          }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptySlot}>
                      <div className={styles.emptySlotIcon}>+</div>
                      <p>Ranura disponible</p>
                      <p className={styles.emptySlotSub}>Selecciona un vehículo arriba para empezar</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
