import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';
import { TerminalReport ,SalesReportCommon,GSTFiling} from './models/terminal-report';



@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTerminalReport(
    fromDate: string,
    toDate: string,
    companyId: number,
    branchId?: number,
    createdBy?: string
  ): Observable<TerminalReport> {

    let params = new HttpParams()
      .set('fromDate', fromDate)   // yyyy-MM-dd
      .set('toDate', toDate)
      .set('companyId', companyId.toString());

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    if (createdBy) {
      params = params.set('createdBy', createdBy);
    }

    return this.http.get<TerminalReport>(
      `${this.baseUrl}/reports/terminal/terminal-report`,
      { params }
    );
  }

    getGSTFiling(
    companyId: number,
    gstFileType: 'B2B' | 'B2C' | 'HSN',
    branchId?: number,
    fromDate?: string,   // yyyy-MM-dd
    toDate?: string
  ): Observable<GSTFiling[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('gstFileType', gstFileType);

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<GSTFiling[]>(
      `${this.baseUrl}/reports/sales/GstFiling`,
      { params }
    );
  }

  
  /* ================= SALES REPORTS (COMMON) ================= */
  getSalesReport(
    companyId: number,
    reportType: 'SUMMARY' | 'DETAILED' | 'PAYMODE' | 'CUSTOMER' | 'AREA',
    fromDate?: string,
    toDate?: string,
    branchId?: number
  ): Observable<SalesReportCommon[]> {

    let params = new HttpParams()
      .set('companyId', companyId.toString())
      .set('reportType', reportType);

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (branchId !== undefined) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<SalesReportCommon[]>(
      `${this.baseUrl}/reports/sales/SalesReports`,
      { params }
    );
  }
}
