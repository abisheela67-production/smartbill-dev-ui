import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '../sales.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MasterService } from '../../../services/master.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { Company } from '../../models/common-models/companyMaster';

@Component({
  selector: 'app-sales-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-view.component.html',
  styleUrl: './sales-view.component.css',
})
export class SalesViewComponent {

  selectedPageSize = 'a4';
  orientation = 'portrait';

  company: any = {};
  invoice: any = { items: [] };
  taxSummary: any[] = [];

  menuOpen = false;

  pageLabel = "";
  pageSizeText = "";

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService,
    private authService: AuthService,
    private commonService: CommonserviceService,
    private masterService: MasterService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);

    this.updateSizeInfo();
  }

  // ================================
  // LOAD INVOICE FROM API
  // ================================
  load(id: string) {
    this.salesService.getSalesEntries(null, null, id).subscribe((rows) => {
      if (!rows || rows.length === 0) return;

      const header = rows[0];
      this.invoice = header;

      this.commonService.getCompanyById(header.companyID).subscribe((c: Company) => {
        this.company = c;
      });

      this.invoice.items = rows.map(r => ({
        productName: r.productName,
        hsnid: r.hsnid,
        quantity: r.quantity,
        saleRate: r.saleRate,
        taxableAmount: r.taxableAmount,
        gstPercentage: r.gstPercentage,
        gstAmount: r.gstAmount ?? 0,
        netAmount: r.netAmount
      }));

      this.invoice.totalGrossAmount = header.totalGrossAmount;
      this.invoice.totalDiscAmount = header.totalDiscAmount;
      this.invoice.totalTaxableAmount = header.totalTaxableAmount;
      this.invoice.totalGstAmount = header.totalGstAmount;
      this.invoice.totalRoundOff = header.totalRoundOff;
      this.invoice.totalInvoiceAmount = header.totalInvoiceAmount;
      this.invoice.totalPaidAmount = header.totalPaidAmount;
    });
  }

  // ================================  
  // PRINT MENU
  // ================================
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  printInvoice() {
    window.print();
  }

  // ================================  
  // PAGE SIZE INFO
  // ================================
  updateSizeInfo() {
    switch (this.selectedPageSize) {

      case "a4":
        this.pageLabel = "A4 (" + this.orientation + ")";
        this.pageSizeText = this.orientation === "portrait"
          ? "210mm × 297mm"
          : "297mm × 210mm";
        break;

      case "a5":
        this.pageLabel = "A5 (" + this.orientation + ")";
        this.pageSizeText = this.orientation === "portrait"
          ? "148mm × 210mm"
          : "210mm × 148mm";
        break;

      case "a6":
        this.pageLabel = "A6 (" + this.orientation + ")";
        this.pageSizeText = this.orientation === "portrait"
          ? "105mm × 148mm"
          : "148mm × 105mm";
        break;

      case "thermal58":
        this.pageLabel = "58mm Thermal";
        this.pageSizeText = "58mm width × Auto Height";
        break;

      case "thermal80":
        this.pageLabel = "80mm Thermal";
        this.pageSizeText = "80mm width × Auto Height";
        break;

      case "thermal110":
        this.pageLabel = "110mm Thermal";
        this.pageSizeText = "110mm width × Auto Height";
        break;
    }
  }

  // ================================
  // PDF FORMAT MAP
  // ================================
  getPdfSize() {
    switch (this.selectedPageSize) {
      case "thermal58": return [58, 600];
      case "thermal80": return [80, 600];
      case "thermal110": return [110, 600];
      case "a5": return "a5";
      case "a6": return "a6";
      default: return "a4";
    }
  }

  // ================================
  // PDF DOWNLOAD
  // ================================
  downloadPDF() {
    const container = document.getElementById("invoicePDF");
    if (!container) return;

    html2canvas(container, { scale: 3 }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: this.orientation as "portrait" | "landscape",
        unit: "mm",
        format: this.getPdfSize(),
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${this.invoice.invoiceNumber}.pdf`);
    });
  }
}
