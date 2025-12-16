import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportdashboardComponent } from './reportdashboard/reportdashboard.component';
import { TerminalReportsComponent } from './terminal-reports/terminal-reports.component';
import { GstReportComponent } from './gst-report/gst-report.component';
import { SalesReportsComponent } from './sales-reports/sales-reports.component';

declare const lucide: any;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportdashboardComponent,
    TerminalReportsComponent,
    SalesReportsComponent,
    GstReportComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit {

  activeTab: 'dashboard' | 'terminal' | 'sales' | 'gst' = 'dashboard';

  setTab(tab: 'dashboard' | 'terminal' | 'sales' | 'gst'): void {
    this.activeTab = tab;

    // Re-render lucide icons
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}
