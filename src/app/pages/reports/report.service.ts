import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../config';
import { TerminalReport } from './models/terminal-report';


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
}
