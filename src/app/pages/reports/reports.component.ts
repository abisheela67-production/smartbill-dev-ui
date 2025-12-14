import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportdashboardComponent } from './reportdashboard/reportdashboard.component';
import { TerminalReportsComponent } from './terminal-reports/terminal-reports.component';

declare const lucide: any;

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportdashboardComponent,
    TerminalReportsComponent
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements AfterViewInit {

  activeTab: 'dashboard' | 'sales' | 'purchase' | 'gst' = 'dashboard';

  setTab(tab: 'dashboard' | 'sales' | 'purchase' | 'gst'): void {
    this.activeTab = tab;

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
