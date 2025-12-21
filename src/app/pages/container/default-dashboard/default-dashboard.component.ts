import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonserviceService as CommonService } from '../../../services/commonservice.service';
import { CompanyDashboardResponseDto } from '../../models/common-models/companyMaster';
import { LucideAngularModule } from "lucide-angular";
@Component({
  selector: 'app-default-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './default-dashboard.component.html',
  styleUrl: './default-dashboard.component.css'
})
export class DefaultDashboardComponent implements OnInit {

  dashboardData!: CompanyDashboardResponseDto;
  loading = false;
  errorMessage = '';

  // TEMP – later you can bind from auth/session
  companyId = 10;

  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    const fromDate = '2025-12-01';
    const toDate   = '2025-12-31';

    this.commonService.getCompanyDashboard(
      this.companyId,
      fromDate,
      toDate
    ).subscribe({
      next: (res) => {
        this.dashboardData = res;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }
}
