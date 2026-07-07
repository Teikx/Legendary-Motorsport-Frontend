"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
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

  // Load initial IDs from query parameter on mount
  useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const parsedIds = idsParam
        .split(",")
        .map((idStr) => {
          const id = Number(idStr.trim());
          return isNaN(id) ? null : id;
        })
        .filter((id): id is number => id !== null);

      const newSelected: (number | null)[] = [null, null, null];
      parsedIds.slice(0, 3).forEach((id, index) => {
        newSelected[index] = id;
        void fetchVehicleDetail(id);
      });
      setSelectedIds(newSelected);
    }
    // Only run on mount to initialize selected IDs from URL query params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        {/* Tabla Detallada de Comparación (Solo si hay al menos un vehículo seleccionado) */}
        {selectedIds.some((id) => id !== null) && (
          <div className={styles.specsTableContainer}>
            <h2 className={styles.tableTitle}>Especificaciones Comparativas</h2>
            
            <div className={styles.tableGrid}>
              {/* HEADER DE FILA: Potencia */}
              <div className={styles.rowHeader}>Potencia (HP)</div>
              {selectedIds.map((selectedId, idx) => {
                if (!selectedId || !vehicleDetails[selectedId]) {
                  return <div key={idx} className={styles.emptyCell}>--</div>;
                }
                const detail = vehicleDetails[selectedId];
                const specs = getPerformanceSpecs(detail.brand, detail.model);
                
                // Determinar si es el ganador de potencia
                const isWinner = selectedIds.every(id => {
                  if (!id || !vehicleDetails[id]) return true;
                  const otherSpecs = getPerformanceSpecs(vehicleDetails[id].brand, vehicleDetails[id].model);
                  return specs.horsepower >= otherSpecs.horsepower;
                });

                return (
                  <div key={idx} className={`${styles.specCell} ${isWinner ? styles.winnerCell : ""}`}>
                    <span className={styles.specValue}>{specs.horsepower} HP</span>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.barFill} 
                        style={{ width: `${(specs.horsepower / 1000) * 100}%` }}
                      />
                    </div>
                    {isWinner && <span className={styles.winnerBadge}>Líder</span>}
                  </div>
                );
              })}

              {/* HEADER DE FILA: Velocidad Máxima */}
              <div className={styles.rowHeader}>Velocidad Máxima</div>
              {selectedIds.map((selectedId, idx) => {
                if (!selectedId || !vehicleDetails[selectedId]) {
                  return <div key={idx} className={styles.emptyCell}>--</div>;
                }
                const detail = vehicleDetails[selectedId];
                const specs = getPerformanceSpecs(detail.brand, detail.model);
                
                const isWinner = selectedIds.every(id => {
                  if (!id || !vehicleDetails[id]) return true;
                  const otherSpecs = getPerformanceSpecs(vehicleDetails[id].brand, vehicleDetails[id].model);
                  return specs.topSpeed >= otherSpecs.topSpeed;
                });

                return (
                  <div key={idx} className={`${styles.specCell} ${isWinner ? styles.winnerCell : ""}`}>
                    <span className={styles.specValue}>{specs.topSpeed} km/h</span>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.barFill} 
                        style={{ width: `${(specs.topSpeed / 450) * 100}%`, backgroundColor: "#38bdf8" }}
                      />
                    </div>
                    {isWinner && <span className={styles.winnerBadge}>Líder</span>}
                  </div>
                );
              })}

              {/* HEADER DE FILA: Aceleración 0-100 */}
              <div className={styles.rowHeader}>Aceleración (0-100 km/h)</div>
              {selectedIds.map((selectedId, idx) => {
                if (!selectedId || !vehicleDetails[selectedId]) {
                  return <div key={idx} className={styles.emptyCell}>--</div>;
                }
                const detail = vehicleDetails[selectedId];
                const specs = getPerformanceSpecs(detail.brand, detail.model);
                
                // Menor tiempo es mejor
                const isWinner = selectedIds.every(id => {
                  if (!id || !vehicleDetails[id]) return true;
                  const otherSpecs = getPerformanceSpecs(vehicleDetails[id].brand, vehicleDetails[id].model);
                  return specs.acceleration <= otherSpecs.acceleration;
                });

                return (
                  <div key={idx} className={`${styles.specCell} ${isWinner ? styles.winnerCell : ""}`}>
                    <span className={styles.specValue}>{specs.acceleration} segundos</span>
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.barFill} 
                        style={{ width: `${(100 - ((specs.acceleration - 2) / 3) * 100)}%`, backgroundColor: "#f43f5e" }}
                      />
                    </div>
                    {isWinner && <span className={styles.winnerBadge}>Líder</span>}
                  </div>
                );
              })}

              {/* HEADER DE FILA: Inventario y Opciones de Compra */}
              <div className={styles.rowHeader}>Opciones en Inventario</div>
              {selectedIds.map((selectedId, idx) => {
                if (!selectedId || !vehicleDetails[selectedId]) {
                  return <div key={idx} className={styles.emptyCell}>--</div>;
                }
                const detail = vehicleDetails[selectedId];
                
                return (
                  <div key={idx} className={styles.inventoryCell}>
                    {detail.inventory.length === 0 ? (
                      <p className={styles.outOfStock}>Sin unidades en inventario</p>
                    ) : (
                      <div className={styles.inventoryList}>
                        {detail.inventory.map((item) => (
                          <div key={item.idProducto} className={styles.inventoryItemCard}>
                            <div className={styles.invHeader}>
                              <span className={styles.invColor}>{item.color}</span>
                              <span className={item.kilometraje === 0 ? styles.pillNew : styles.pillUsed}>
                                {item.kilometraje === 0 ? "Nuevo" : `${item.kilometraje.toLocaleString("en-US")} km`}
                              </span>
                            </div>
                            <div className={styles.invFooter}>
                              <span className={styles.invPrice}>${item.precio.toLocaleString("en-US")}</span>
                              <span className={styles.invStock}>Stock: {item.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper para obtener especificaciones de performance Premium mockeadas para el wow factor
type PerformanceSpecs = {
  horsepower: number;
  topSpeed: number;
  acceleration: number; // en segundos
};

function getPerformanceSpecs(brand: string, model: string): PerformanceSpecs {
  const full = `${brand} ${model}`.toLowerCase();
  if (full.includes("pegassi")) {
    return { horsepower: 740, topSpeed: 350, acceleration: 2.8 };
  } else if (full.includes("lamborghini")) {
    return { horsepower: 770, topSpeed: 355, acceleration: 2.7 };
  } else if (full.includes("truffade")) {
    return { horsepower: 1000, topSpeed: 400, acceleration: 2.5 };
  } else if (full.includes("grotti")) {
    return { horsepower: 800, topSpeed: 340, acceleration: 2.9 };
  }
  return { horsepower: 550, topSpeed: 310, acceleration: 3.5 };
}

