import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';
import { PurchaseOrderEntry } from '../models/purchase-models';
import { ApiResponse } from '../../pages/models/common-models/companyMaster'; 
@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderServiceService {

  private baseUrl = `${environment.apiBaseUrl}/Purchase`;

  constructor(private http: HttpClient) {}

  savePurchaseOrder(purchaseorder: PurchaseOrderEntry): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/purchaseorder`, purchaseorder);
  }

}
