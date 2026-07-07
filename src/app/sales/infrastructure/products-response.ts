import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

// El backend devuelve un array plano — BaseApiEndpoint lo maneja antes de llegar aquí
export interface ProductsResponse extends BaseResponse {}

// Mantenido para compatibilidad con BaseAssembler
export interface ProductResource extends BaseResource {
  id: number;
  name: string;
  unitPrice: number;
  isWeighted: boolean;
  availableStock: number;
}

// ===== Sales catalog (GET /api/v1/sales-products) =====
// Producto vendible con su stock ya calculado por el contexto de Inventario.
export interface SalesProductResource {
  name: string;
  price: number;
  byWeight: boolean;
  stock: number;
}
