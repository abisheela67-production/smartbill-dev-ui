import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SalesService } from '../sales.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-sales-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-view.component.html',
  styleUrl: './sales-view.component.css',
})
export class SalesViewComponent {
  pageSizes = [
    { label: "A4", value: "a4" },
    { label: "A5", value: "a5" },
    { label: "A6", value: "a6" }
  ];

  selectedPageSize = "a4";
  orientation = "portrait";

  company: any = {};
  customer: any = {};
  invoice: any = { items: [] };
  summary: any = {};
  taxSummary: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) this.load(id);
  }

  load(id: string) {
    this.salesService.getSalesEntries(null, null, id).subscribe(rows => {

      if (!rows || rows.length === 0) return;

      const h = rows[0];

      this.company = {
        name: h.companyName,
        email: "support@smartbillpro.com",
        phone: "+91 9876543210",
        taxId: h.companyGSTIN
      };

      this.customer = {
        name: h.customerName,
        address: h.customerState,
        gstin: h.customerGSTIN
      };

      this.invoice = {
        number: h.invoiceNumber,
        date: h.invoiceDate,
        placeOfSupply: h.companyState,
        items: rows.map(x => ({
          name: x.productName,
          hsn: x.hsnid,
          quantity: x.quantity,
          rate: x.saleRate,
          gstRate: x.gstPercentage,
          gstAmount: x.gstAmount,
          total: x.netAmount
        }))
      };

      this.summary = {
        subTotal: rows.reduce((a, b) => a + b.taxableAmount, 0),
        totalGST: rows.reduce((a, b) => a + b.gstAmount, 0),
        totalCESS: rows.reduce((a, b) => a + b.cessAmount, 0),
        grandTotal: h.totalInvoiceAmount
      };

      this.taxSummary = this.buildTaxTable(rows);
    });
  }

  buildTaxTable(rows: any[]) {
    const map: { [key: string]: any } = {};
    rows.forEach(r => {
      const rate = r.gstPercentage;
      if (!map[rate]) map[rate] = { rate, taxable: 0, taxAmount: 0 };
      map[rate].taxable += r.taxableAmount;
      map[rate].taxAmount += r.gstAmount;
    });
    return Object.values(map);
  }

  downloadPDF() {
    const container = document.getElementById("invoicePDF");
    if (!container) return;

    html2canvas(container, { scale: 3 }).then(canvas => {
      const img = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: this.orientation as "portrait" | "p" | "l" | "landscape",
        unit: "mm",
        format: this.selectedPageSize as "a4" | "a5" | "a6"
      });

      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;

      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(`Invoice-${this.invoice.number}.pdf`);
    });
  }
}
