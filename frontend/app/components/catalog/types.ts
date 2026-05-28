export type Vehicle = {
  id: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  year: number;
  mileage: number;
  image: string;
  colors: string[];
  uploadedAt: string;
};

export type CartItem = {
  id: string;
  vehicleId: string;
  brand: string;
  model: string;
  price: number;
  color: string;
  quantity: number;
  image: string;
};
