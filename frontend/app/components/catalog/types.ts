export type CatalogVehicle = {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  minPrice: number;
  stockTotal: number;
  colorsAvailable: number;
};

export type InventoryItem = {
  idProducto: number;
  color: string;
  kilometraje: number;
  precio: number;
  stock: number;
};

export type VehicleDetail = {
  id: number;
  brand: string;
  model: string;
  imageUrl: string;
  inventory: InventoryItem[];
};

export type CartItem = {
  idDetalleCarrito: number;
  idProducto: number;
  brand: string;
  model: string;
  color: string;
  mileage: number;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
};

export type Cart = {
  idCarrito: number;
  idCliente: number;
  total: number;
  estado: string;
  items: CartItem[];
};
