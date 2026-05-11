import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

// JSON-Server devuelve array plano — BaseApiEndpoint lo maneja antes de llegar aquí
export interface ProductsResponse extends BaseResponse {}

// Mantenido para compatibilidad con BaseAssembler
export interface ProductResource extends BaseResource {
  id: number;
  name: string;
  unitPrice: number;
  isWeighted: boolean;
  availableStock: number;
}

// ===== Inventory BC =====

export interface UnitProductResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  codeQR: string;
  productType: 'unit';
  price: number;
  weightGrams: number;
  brand: string;
}

export interface WeightProductResource extends BaseResource {
  id: number;
  name: string;
  description: string;
  codeQR: string;
  productType: 'weight';
  pricePerKg: number;
}

export interface UnitLotResource {
  id: number;
  productId: number;
  lotType: 'unit';
  quantity: number;
}

export interface WeightLotResource {
  id: number;
  productId: number;
  lotType: 'weight';
  quantityKg: number;
}
