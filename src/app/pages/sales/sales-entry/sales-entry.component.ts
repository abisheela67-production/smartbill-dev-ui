import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { Company, Branch } from '../../models/common-models/companyMaster';
import { CommonserviceService } from '../../../services/commonservice.service';
import { MasterService } from '../../../services/master.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { Router } from '@angular/router';
import { ProductStockPrice, SalesInvoice } from '../models/sales-model';
import {
  SubCategory,
  Category,
  Status,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
  Supplier,
  PaymentMode,
} from '../../models/common-models/master-models/master';
import { forkJoin, of } from 'rxjs';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { SalesService } from '../sales.service';
import { SmallGridComponent } from '../../components/small-grid/small-grid.component';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';

@Component({
  selector: 'app-sales-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    SmallGridComponent,
    InputDataGridComponent,
  ],
  templateUrl: './sales-entry.component.html',
  styleUrls: ['./sales-entry.component.css'],
})
export class SalesEntryComponent {
  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;

  companies: Company[] = [];
  branches: Branch[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  paymentModes: PaymentMode[] = [];
  suppliers: Supplier[] = [];
  statuses: Status[] = [];
  accountingYear: any;
  products: ProductStockPrice[] = [];
  productList: ProductStockPrice[] = [];
  activeProductRow: number | null = null;

  // Flags
  smallGridVisible = true;
  salesEntries: SalesInvoice[] = [];

  // CUSTOMER INFO
  customer: string = 'Walk-in Customer';
  customerGST: string = '';
  smallGridData: ProductStockPrice[] = [];

  totalGrossAmount: number = 0;
  totalDiscAmount: number = 0;
  totalTaxableAmount: number = 0;
  totalGstAmount: number = 0;
  totalCessAmount: number = 0;
  totalNetAmount: number = 0;
  totalInvoiceAmount: number = 0;
  totalPaidAmount: number = 0;
  totalBalanceAmount: number = 0;
  totalRoundOff: number = 0;
  billingType: 'RETAIL' | 'WHOLESALE' = 'RETAIL';
  gstType: 'IN_STATE' | 'OTHER_STATE' = 'IN_STATE';

  // TOTALS
  grossAmount = 0;
  discountAmount = 0;
  taxableAmount = 0;
  gstAmount = 0;
  invoiceTotal = 0;
  columns = [
    {
      field: 'sno',
      header: 'S.No',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'invoiceID',
      header: 'Invoice ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'invoiceNumber',
      header: 'Invoice Number',
      type: 'text',
      visible: false,
    },
    {
      field: 'invoiceDate',
      header: 'Invoice Date',
      type: 'date',
      visible: false,
    },

    {
      field: 'companyID',
      header: 'Company ID',
      type: 'number',
      visible: false,
    },
    { field: 'companyName', header: 'Company', type: 'text', visible: false },

    { field: 'branchID', header: 'Branch ID', type: 'number', visible: false },
    { field: 'branchName', header: 'Branch', type: 'text', visible: false },

    {
      field: 'customerID',
      header: 'Customer ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'customerName',
      header: 'Customer Name',
      type: 'text',
      visible: false,
    },

    {
      field: 'productCode',
      header: 'PCODE',
      type: 'text',
      visible: true,
      readOnly: true,
    },
    {
      field: 'productName',
      header: 'PRODUCT NAME',
      type: 'text',
      visible: true,
    },

    {
      field: 'quantity',
      header: 'QTY',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },

    {
      field: 'retailPrice',
      header: 'Retail Price',
      type: 'number',
      visible: false,
    },
    { field: 'saleRate', header: 'Sale Rate', type: 'number', visible: true },
    { field: 'mrp', header: 'MRP', type: 'number', visible: false },

    {
      field: 'gstPercentage',
      header: 'GST %',
      type: 'number',
      visible: false,
      readOnly: false,
    },
    {
      field: 'gstAmount',
      header: 'GST Amount',
      type: 'number',
      visible: false,
      readOnly: false,
    },

    {
      field: 'grossAmount',
      header: 'Gross Amount',
      type: 'number',
      visible: false,
      readOnly: false,
    },
    {
      field: 'netAmount',
      header: 'Net Amount',
      type: 'number',
      visible: true,
      readOnly: true,
    },
    {
      field: 'grandTotal',
      header: 'Grand Total',
      type: 'number',
      visible: false,
    },

    // Hidden technical & audit fields
    { field: 'barcode', header: 'Barcode', type: 'text', visible: false },
    { field: 'brandID', header: 'Brand ID', type: 'number', visible: false },
    {
      field: 'categoryID',
      header: 'Category ID',
      type: 'number',
      visible: false,
    },
    { field: 'hsnid', header: 'HSN ID', type: 'number', visible: false },
    { field: 'unitID', header: 'Unit ID', type: 'number', visible: false },

    {
      field: 'discountPercentage',
      header: 'Discount %',
      type: 'number',
      visible: false,
    },
    {
      field: 'discountAmount',
      header: 'Discount Amount',
      type: 'number',
      visible: false,
    },

    { field: 'cgstRate', header: 'CGST %', type: 'number', visible: false },
    { field: 'sgstRate', header: 'SGST %', type: 'number', visible: false },
    { field: 'igstRate', header: 'IGST %', type: 'number', visible: false },

    { field: 'createdBy', header: 'Created By', type: 'text', visible: false },
    {
      field: 'createdDate',
      header: 'Created Date',
      type: 'date',
      visible: false,
    },
    { field: 'updatedBy', header: 'Updated By', type: 'text', visible: false },
    {
      field: 'updatedDate',
      header: 'Updated Date',
      type: 'date',
      visible: false,
    },

    { field: 'remarks', header: 'Remarks', type: 'text', visible: false },
  ];

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code' },
    { field: 'productName', header: 'Product Name' },
    { field: 'retailPrice', header: 'Retail Price' },
    { field: 'wholesalePrice', header: 'Wholesale Price' },
    { field: 'currentStock', header: 'Stock' },



    /*
    { field: 'purchaseDate', header: 'Last Purchase Date' },
    { field: 'supplierName', header: 'Supplier' },
    { field: 'poNumber', header: 'PO Number' },
    { field: 'gstPercentage', header: 'GST %' },
    { field: 'saleRate', header: 'Sale Rate' },




*/
  ];

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private salesservice: SalesService,

    private swall: SweetAlertService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();

    const companyId = this.authService.companyId;

    if (companyId) {
      this.selectedCompanyId = companyId;

      this.loadProducts(companyId);
    }
  }

  // LOAD MASTER DROPDOWNS
  loadDropdowns(): void {
    const companyId = this.authService.companyId;

    forkJoin({
      companies: this.commonService.getCompanies(),
      branches: companyId
        ? this.commonService.getBranchesByCompany(companyId)
        : of([]),
      categories: this.masterService.getCategories(),
      subCategories: this.masterService.getSubCategories(),
      brands: this.masterService.getBrands(),
      units: this.masterService.getUnits(),
      hsnCodes: this.masterService.getHSNCodes(),
      taxes: this.masterService.getTaxes(),
      cesses: this.masterService.getCesses(),
      suppliers: this.masterService.getSuppliers(),
      statuses: this.masterService.getStatuses(),
      paymentModes: this.masterService.getPaymentModes(),
    }).subscribe((res) => {
      this.companies = res.companies ?? [];
      this.branches = res.branches ?? [];
      this.categories = res.categories ?? [];
      this.subCategories = res.subCategories ?? [];
      this.brands = res.brands ?? [];
      this.units = res.units ?? [];
      this.hsnCodes = res.hsnCodes ?? [];
      this.taxes = res.taxes ?? [];
      this.cesses = res.cesses ?? [];
      this.suppliers = res.suppliers ?? [];
      this.statuses = res.statuses ?? [];
      this.paymentModes = res.paymentModes ?? [];

      const comp = this.companies.find((c) => c.companyID === companyId);
      this.accountingYear = comp?.accountingYear || '';
    });
  }
  onCompanyChange(companyId: number) {
    this.selectedBranchId = null;
    this.branches = [];

    this.commonService
      .getBranchesByCompany(companyId)
      .subscribe((res: Branch[]) => {
        this.branches = res;
      });
  }

  // LOAD PRODUCTS
  loadProducts(companyId: number) {
    this.salesservice.getSalesProducts(companyId).subscribe((res) => {
      if (res && res.success) {
        this.products = res.data ?? [];
        this.smallGridData = [...this.products];
        console.log(this.products);
      } else {
        this.products = [];
        this.smallGridData = [];
      }
    });
  }
  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  // OPEN PRODUCT SMALL GRID
  showSmallGrid(rowIndex: number) {
    this.activeProductRow = rowIndex;

    setTimeout(() => {
      this.smallGridData = [...this.products];
      this.smallGridVisible = true;
    });
  }

  onGridRowAdded(e: any) {
    const newRow = e;

    this.applyTopSelectionsToRow(newRow);

    this.updateSerialNumbers();
  }

  applyTopSelectionsToRow(row: SalesInvoice) {
    row.companyID = this.selectedCompanyId ?? null;
    row.branchID = this.selectedBranchId ?? null;
    row.accountingYear = this.accountingYear ?? null;
    row.statusID = 3;
    row.isActive = true;
  }
  updateSerialNumbers() {
    this.salesEntries.forEach((row, index) => {
      row.sno = index + 1;
    });
  }

  onGridNumberChanged(event: any) {
    const { rowIndex, field } = event;
    const row = this.salesEntries[rowIndex];
    if (!row) return;

    if (['purchaseRate', 'quantity', 'gstPercentage'].includes(field)) {
      this.calculateRowTotals(row);
      this.calculateOverallTotals(); // <—— ADD THIS
    }
  }

  calculateRowTotals(row: SalesInvoice) {
    const rate = Number(row.saleRate || 0);
    const qty = Number(row.quantity || 0);
    const gst = Number(row.gstPercentage || 0);

    // Base value
    row.totalSaleRate = rate * qty;

    // GST amount
    row.gstAmount = (row.totalSaleRate * gst) / 100;

    // CGST / SGST split
    row.cgstRate = gst / 2;
    row.sgstRate = gst / 2;
    row.igstRate = 0;

    row.cgstAmount = (row.totalSaleRate * row.cgstRate) / 100;
    row.sgstAmount = (row.totalSaleRate * row.sgstRate) / 100;

    // Total including GST
    row.totalSaleRate = row.totalSaleRate + row.gstAmount;
  }
  calculateOverallTotals() {
    this.totalGrossAmount = 0;
    this.totalDiscAmount = 0;
    this.totalTaxableAmount = 0;
    this.totalGstAmount = 0;
    this.totalCessAmount = 0;
    this.totalNetAmount = 0;
    this.totalInvoiceAmount = 0;
    this.totalPaidAmount = 0;
    this.totalBalanceAmount = 0;

    for (const row of this.salesEntries) {
      this.totalGrossAmount += Number(row.totalSaleRate || 0);
      this.totalDiscAmount += Number(row.discountAmount || 0);
      this.totalTaxableAmount += Number(row.totalSaleRate || 0);
      this.totalGstAmount += Number(row.gstAmount || 0);
      this.totalCessAmount += Number(row.cessAmount || 0);
      this.totalNetAmount += Number(row.totalSaleRate || 0);
      this.totalInvoiceAmount += Number(row.totalSaleRate || 0);
      this.totalBalanceAmount += Number(row.totalSaleRate || 0);

      this.totalPaidAmount = Number(this.totalPaidAmount || 0);
    }
    this.totalBalanceAmount =
      this.totalInvoiceAmount - (this.totalPaidAmount || 0);
  }
}
