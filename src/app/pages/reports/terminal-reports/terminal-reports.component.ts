import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { ReportService } from '../report.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { ViewDatatableComponent } from '../../components/view-datatable/view-datatable.component';
import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../authentication/auth-service.service';

@Component({
  selector: 'app-terminal-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ViewDatatableComponent,
    IconsModule
  ],
  templateUrl: './terminal-reports.component.html',
  styleUrl: './terminal-reports.component.css'
})
export class TerminalReportsComponent implements OnInit {

  loading = false;

  filters = {
    fromDate: '',
    toDate: '',
    companyId: null as number | null,
    branchId: null as number | null,
    createdBy: null as string | null
  };

  companies: any[] = [];
  branches: any[] = [];
  users: any[] = [];

  summary: any = {};
  bills: any[] = [];

columns = [
  { header: 'Terminal User', field: 'terminalUser', visible: true },

  { header: 'Total Bills', field: 'totalBills', visible: true },
  { header: 'Total Qty', field: 'totalQuantity', visible: false },

  { header: 'Gross Sales', field: 'grossSales', visible: true },
  { header: 'Discount', field: 'discountAmount', visible: false },
  { header: 'Taxable Amount', field: 'taxableAmount', visible: false },

  { header: 'CGST', field: 'cgst', visible: false },
  { header: 'SGST', field: 'sgst', visible: false },
  { header: 'IGST', field: 'igst', visible: false },
  { header: 'CESS', field: 'cess', visible: false },
  { header: 'Total GST', field: 'totalGST', visible: true },

  { header: 'Net Sales', field: 'netSales', visible: true },

  { header: 'Cash', field: 'cashTotal', visible: true },
  { header: 'Card', field: 'cardTotal', visible: true },
  { header: 'UPI', field: 'upiTotal', visible: true },
  { header: 'Advance', field: 'advanceTotal', visible: false },

  { header: 'Paid', field: 'totalPaid', visible: false },
  { header: 'Balance', field: 'balanceAmount', visible: true },

  { header: 'Cancelled Bills', field: 'cancelledBills', visible: false },
  { header: 'Cancelled Amount', field: 'cancelledAmount', visible: false }
];


  constructor(
    private reportService: ReportService,
    private commonService: CommonserviceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.filters.fromDate = today;
    this.filters.toDate = today;
    this.filters.companyId = this.authService.companyId;

    this.loadDropdowns();
    this.loadReport();
  }

  /* -------------------- DROPDOWNS -------------------- */
  loadDropdowns(): void {
    const companyId = this.filters.companyId;

    forkJoin({
      companies: this.commonService.getCompanies(),
      branches: companyId
        ? this.commonService.getBranchesByCompany(companyId)
        : of([]),
      users: this.commonService.getUsers()
    }).subscribe(res => {
      this.companies = res.companies ?? [];
      this.branches = res.branches ?? [];
      this.users = res.users ?? [];
    });
  }

  onCompanyChange(): void {
    this.filters.branchId = null;
    this.filters.createdBy = null;

    if (this.filters.companyId) {
      this.commonService
        .getBranchesByCompany(this.filters.companyId)
        .subscribe(b => (this.branches = b ?? []));
    }

    this.loadReport();
  }

  onFilterChange(): void {
    this.loadReport();
  }

  /* -------------------- REPORT -------------------- */
  loadReport(): void {
    if (!this.filters.companyId) return;

    this.loading = true;

    this.reportService.getTerminalReport(
      this.filters.fromDate,
      this.filters.toDate,
      this.filters.companyId,
      this.filters.branchId ?? undefined,
      this.filters.createdBy ?? undefined
    ).subscribe({
      next: res => {
        // 🔥 FIXES
        res.totalBills = Number(res.totalBills || 0);

        this.summary = res;

        // API RETURNS SINGLE ROW → TABLE NEEDS ARRAY
        this.bills = [res];

        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  /* -------------------- KPI -------------------- */
  avgBill(): number {
    if (!this.summary?.totalBills) return 0;
    return this.summary.netSales / this.summary.totalBills;
  }
  get visibleColumns() {
  return this.columns.filter(c => c.visible !== false);
}

}
