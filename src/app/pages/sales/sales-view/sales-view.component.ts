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

    // ✅ PAYMENT FIELD MAPPING (IMPORTANT)
    this.invoice.cash = header.cashAmount ?? 0;
    this.invoice.upi = header.upiAmount ?? 0;
    this.invoice.card = header.cardAmount ?? 0;

    this.invoice.totalPaid = header.paidAmount ?? 0;
    this.invoice.customerGiven =
      (header.cashAmount ?? 0) +
      (header.upiAmount ?? 0) +
      (header.cardAmount ?? 0);

    this.invoice.balance = header.balanceAmount ?? 0;

    // Company
    this.commonService.getCompanyById(header.companyID).subscribe((c: Company) => {
      this.company = c;
    });

    // Items
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

// ================= TOTALS =================
this.invoice.totalQuantity        = header.totalQuantity ?? 0;
this.invoice.totalGrossAmount     = header.totalGrossAmount ?? 0;
this.invoice.totalDiscAmount      = header.totalDiscAmount ?? 0;
this.invoice.totalTaxableAmount   = header.totalTaxableAmount ?? 0;

this.invoice.totalCGSTAmount      = header.totalCGSTAmount ?? 0;
this.invoice.totalSGSTAmount      = header.totalSGSTAmount ?? 0;
this.invoice.totalIGSTAmount      = header.totalIGSTAmount ?? 0;
this.invoice.totalCESSAmount      = header.totalCESSAmount ?? 0;
this.invoice.totalGstAmount       = header.totalGstAmount ?? 0;

this.invoice.totalNetAmount       = header.totalNetAmount ?? 0;
this.invoice.totalInvoiceAmount   = header.totalInvoiceAmount ?? 0;
this.invoice.totalRoundOff        = header.totalRoundOff ?? 0;

// ================= PAYMENTS =================
this.invoice.cash = header.cashAmount ?? 0;
this.invoice.card = header.cardAmount ?? 0;
this.invoice.upi  = header.upiAmount ?? 0;

this.invoice.totalPaid = header.totalPaidAmount ?? header.paidAmount ?? 0;
this.invoice.customerGiven =
  this.invoice.cash + this.invoice.card + this.invoice.upi;

this.invoice.balance = header.totalBalanceAmount ?? header.balanceAmount ?? 0;

  });
  console.log('Loaded Invoice:', this.invoice);
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



getPdfSize() {
  switch (this.selectedPageSize) {
    case "thermal58": return [58, 300];
    case "thermal80": return [80, 300];
    case "thermal110": return [110, 300];
    case "a5": return "a5";
    case "a6": return "a6";
    default: return "a4";
  }
}

downloadPDF() {
  const element = document.getElementById("invoicePDF");
  if (!element) return;

  html2canvas(element, {
    scale: 3,
    useCORS: true
  }).then(canvas => {

    const pdf = new jsPDF({
      orientation: this.orientation as "portrait" | "landscape",
      unit: "mm",
      format: this.getPdfSize()
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight
    );

    pdf.save(`Invoice-${this.invoice.invoiceNumber}.pdf`);
  });
}


}
