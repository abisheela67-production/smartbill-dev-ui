import { Injectable } from '@angular/core';
import { environment } from '../../config';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductComponent } from '../master/product/product.component';
import { ProductStockPrice, BusinessType,GstTransactionType } from './models/sales-model';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private baseUrl = `${environment.apiBaseUrl}/Sales`;
  constructor(private http: HttpClient) {}

getSalesProducts(
  companyId?: number,
  branchId?: number,
  businessTypeId?: number
): Observable<ApiResponse<ProductStockPrice[]>> {
  
  let params = new HttpParams();

  if (companyId) params = params.append('companyId', companyId);
  if (branchId) params = params.append('branchId', branchId);
  if (businessTypeId) params = params.append('businessTypeId', businessTypeId);

  return this.http.get<ApiResponse<ProductStockPrice[]>>(
    `${this.baseUrl}/SalesProducts`,
    { params }
  );
}

  getAllBusinessTypes() {
    return this.http.get<ApiResponse<BusinessType[]>>(
      `${this.baseUrl}/GetAllBusinessTypes`
    );
  }

  getAllGstTypes() {
  return this.http.get<ApiResponse<GstTransactionType[]>>(
    `${this.baseUrl}/GetAllGstType`
  );
}

}
