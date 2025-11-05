import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-entry.component.html',
  styleUrls: ['./sales-entry.component.css']
})
export class SalesEntryComponent {
    company = {
    name: 'My Company',
    address: '123 Street, City'
  };

  customer = {
    name: 'John Doe',
    address: '456 Another St, City'
  };

  invoice = {
    number: 'INV-1001',
    date: new Date(),
    taxRate: 10, // %
    items: [
      { name: 'Product 1', quantity: 2, unitPrice: 50 },
      { name: 'Product 2', quantity: 1, unitPrice: 100 },
    ]
  };

  getSubtotal() {
    return this.invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  getTax() {
    return this.getSubtotal() * (this.invoice.taxRate / 100);
  }

  getTotal() {
    return this.getSubtotal() + this.getTax();
  }
}