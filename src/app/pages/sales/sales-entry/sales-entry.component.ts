import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-sales-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-entry.component.html',
  styleUrls: ['./sales-entry.component.css']
})
export class SalesEntryComponent {
  company = {
    logo: 'assets/logo.png',
    name: 'My Company Pvt Ltd',
    address: '123, MG Road, Mumbai, India',
    gstin: '27AAAAA0000A1Z5',
    contact: '+91-9876543210',
    bankDetails: 'Bank: XYZ Bank, A/C: 1234567890, IFSC: XYZB0000123'
  };

  customer = {
    name: 'John Doe',
    address: '456, Linking Road, Mumbai, India',
    gstin: '27BBBBB1111B1Z2'
  };

  invoice = {
    number: 'INV-1001',
    date: new Date(),
    placeOfSupply: 'Maharashtra',
    items: [
      { name: 'Product A', hsn: '1001', quantity: 2, unit: 'pcs', rate: 500, gst: 18, cess: 2 },
      { name: 'Product B', hsn: '1002', quantity: 1, unit: 'pcs', rate: 300, gst: 12, cess: 0 },
    ]
  };

  pageSizes = ['a4', 'a5', 'letter']; // user-selectable

  selectedPageSize: string = 'a4';

  getSubtotal() {
    return this.invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  }

  getGSTTotal() {
    return this.invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate * item.gst / 100), 0);
  }

  getCessTotal() {
    return this.invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate * item.cess / 100), 0);
  }

  getGrandTotal() {
    return this.getSubtotal() + this.getGSTTotal() + this.getCessTotal();
  }

  downloadPDF() {
    const data = document.getElementById('invoicePDF') as HTMLElement;
    if (!data) return;

    html2canvas(data, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: this.selectedPageSize // 'a4', 'a5', etc.
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${this.invoice.number}.pdf`);
    });
  }
}