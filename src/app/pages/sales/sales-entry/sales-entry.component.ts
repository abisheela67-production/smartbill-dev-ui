import {
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  Component,
} from '@angular/core';
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

import { BusinessType, GstTransactionType } from '../models/sales-model';
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
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(SmallGridComponent) smallGrid!: SmallGridComponent;

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
  smallGridVisible = false;
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
  businessTypes: BusinessType[] = [];
  gstTypesList: GstTransactionType[] = [];
  selectedInvoiceDate: any;

  billMode: 'POS' | 'HOTKEY' = 'POS'; // default
  selectedPaymentMode: any;

  selectedBusinessType: BusinessType | null = null;
  selectedGstType: GstTransactionType | null = null;

  // TOTALS
  grossAmount = 0;
  discountAmount = 0;
  taxableAmount = 0;
  gstAmount = 0;
  invoiceTotal = 0;
  columns = [
    {
      field: 'sno',
      header: 'S.NO',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'invoiceID',
      header: 'Invoice ID',
      type: 'number',
      visible: false,
      readOnly: true,
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
      field: 'productCode',
      header: 'CODE',
      type: 'text',
      visible: true,
      readOnly: true,
    },
    {
      field: 'productName',
      header: 'ITEM',
      type: 'text',
      visible: true,
      openSmallGrid: true,
    },

    {
      field: 'retailPrice',
      header: 'Retail Price',
      type: 'number',
      visible: false,
    },
    {
      field: 'saleRate',
      header: 'PRICE',
      type: 'number',
      visible: true,
      readonly: true,
    },
    { field: 'mrp', header: 'MRP', type: 'number', visible: false },
    {
      field: 'quantity',
      header: 'QTY',
      type: 'number',
      visible: true,
      requiredForNextRow: true,
    },
    {
      field: 'gstPercentage',
      header: 'GST %',
      type: 'number',
      visible: false,
      readOnly: true,
    },
    {
      field: 'gstAmount',
      header: 'GST ₹',
      type: 'number',
      visible: false,
      readOnly: true,
    },
    { field: 'cgstRate', header: 'CGST %', type: 'number', visible: false },
    { field: 'sgstRate', header: 'SGST %', type: 'number', visible: false },
    { field: 'igstRate', header: 'IGST %', type: 'number', visible: false },

    {
      field: 'discountPercentage',
      header: 'DISC%',
      type: 'number',
      visible: true,
    },
    {
      field: 'discountAmount',
      header: 'DISC ₹',
      type: 'number',
      visible: true,
    },
    {
      field: 'netAmount',
      header: 'NET AMT',
      type: 'number',
      visible: true,
      readOnly: true,
    },
    {
      field: 'grossAmount',
      header: 'Gross Amount',
      type: 'number',
      visible: false,
      readOnly: false,
    },

    {
      field: 'grandTotal',
      header: 'Grand Total',
      type: 'number',
      visible: false,
    },
    { field: 'remarks', header: 'Remarks', type: 'text', visible: false },
  ];

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code', visible: true },
    { field: 'productName', header: 'Product Name', visible: true },
    { field: 'retailPrice', header: 'Retail Price', visible: false },
    { field: 'wholesalePrice', header: 'Wholesale Price', visible: false },
    { field: 'currentStock', header: 'Stock', visible: true },
  ];
  billTabs: any;
  activeBillIndex: number | undefined;

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
    this.loadBusinessTypes();
    this.loadGstTypes();

    const companyId = this.authService.companyId;

    if (companyId) {
      this.selectedCompanyId = companyId;
    }
  }

  onBusinessTypeChanged() {
    this.loadProducts();
  }
  onProductSelected(product: ProductStockPrice) {
    if (this.activeProductRow !== null) {
      const row = this.salesEntries[this.activeProductRow];

      row.productCode = product.productCode;
      row.productName = product.productName;
      row.retailPrice = product.retailPrice;
      row.wholesalePrice = product.wholesalePrice;

      if (this.selectedBusinessType?.businessTypeID === 1) {
        row.saleRate = product.retailPrice; // Retail
      } else if (this.selectedBusinessType?.businessTypeID === 2) {
        row.saleRate = product.wholesalePrice; // Wholesale
      } else {
        row.saleRate = product.retailPrice; // Default
      }

      // Recalculate totals for this row
      this.calculateOverallTotals();
    }

    // Close grid and refocus back to QTY column
    this.smallGridVisible = false;
    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 4), 50);
  }

  loadBusinessTypes() {
    this.salesservice.getAllBusinessTypes().subscribe((res) => {
      if (res && res.success) {
        this.businessTypes = res.data;

        const defaultBT = this.businessTypes.find(
          (x) => x.businessTypeID === 1
        );

        if (defaultBT) {
          this.selectedBusinessType = defaultBT;

          this.loadProducts();
        }
      }
    });
  }

  loadGstTypes() {
    this.salesservice.getAllGstTypes().subscribe((res) => {
      if (res && res.success) {
        this.gstTypesList = res.data;

        const defaultGst = this.gstTypesList.find(
          (x) => x.gstTransactionTypeID === 1
        );

        if (defaultGst) {
          this.selectedGstType = defaultGst;
        }
      }
    });
  }

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
  adjustColumnsForBusinessType() {
    const retail = this.productGridColumns.find(
      (c) => c.field === 'retailPrice'
    );
    const wholesale = this.productGridColumns.find(
      (c) => c.field === 'wholesalePrice'
    );

    if (!retail || !wholesale) return;

    if (this.selectedBusinessType?.businessTypeID === 1) {
      // RETAIL MODE
      retail.visible = true;
      wholesale.visible = false;
    } else if (this.selectedBusinessType?.businessTypeID === 2) {
      // WHOLESALE MODE
      retail.visible = false;
      wholesale.visible = true;
    } else {
      // DEFAULT (Show both)
      retail.visible = true;
      wholesale.visible = true;
    }

    // Refresh array (Angular change detection)
    this.productGridColumns = [...this.productGridColumns];
    this.productGridColumns = [...this.productGridColumns];
  }

  loadProducts() {
    const companyId = this.selectedCompanyId;
    const branchId = this.selectedBranchId;
    const businessTypeId = this.selectedBusinessType?.businessTypeID;

    if (!companyId) return;

    this.salesservice
      .getSalesProducts(
        companyId,
        branchId ?? undefined,
        businessTypeId ?? undefined
      )
      .subscribe((res) => {
        if (res && res.success) {
          this.products = res.data ?? [];
          this.smallGridData = [...this.products];

          this.adjustColumnsForBusinessType();
        } else {
          this.products = [];
          this.smallGridData = [];
        }
      });
  }

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  showSmallGrid(rowIndex: number) {
    this.activeProductRow = rowIndex;
    this.adjustColumnsForBusinessType();
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

    this.calculateRowTotals(row, field); // pass field name
    this.calculateOverallTotals();
  }

  calculateRowTotals(row: SalesInvoice, changedField: string) {
    const rate = Number(row.saleRate || 0);
    const qty = Number(row.quantity || 0);
    const gst = Number(row.gstPercentage || 0);

    let discPerc = Number(row.discountPercentage || 0);
    let discAmt = Number(row.discountAmount || 0);

    // 1) Base
    const baseAmount = rate * qty;

    // =======================================
    //   DISCOUNT REVERSE SYNC (Perfect)
    // =======================================
    if (changedField === 'discountPercentage') {
      // user typed %
      discAmt = (baseAmount * discPerc) / 100;
      row.discountAmount = discAmt;
    }

    if (changedField === 'discountAmount') {
      // user typed ₹
      discPerc = baseAmount > 0 ? (discAmt / baseAmount) * 100 : 0;
      row.discountPercentage = discPerc;
    }

    // 3) Taxable
    const taxableAmount = baseAmount - discAmt;
    row.taxableAmount = taxableAmount;

    // 4) GST
    const gstAmount = (taxableAmount * gst) / 100;
    row.gstAmount = gstAmount;

    row.cgstRate = gst / 2;
    row.sgstRate = gst / 2;
    row.cgstAmount = gstAmount / 2;
    row.sgstAmount = gstAmount / 2;

    // 5) Net
    row.netAmount = taxableAmount + gstAmount;

    // Save for totals
    row.grossAmount = baseAmount;
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

  nextBill() {
    // Create next bill index
    const newBillNo = this.billTabs.length + 1;

    // Push new bill
    this.billTabs.push({
      id: newBillNo,
      name: `Bill ${newBillNo}`,
      salesEntries: [],
      totals: {},
    });

    // Switch to new bill
    this.activeBillIndex = this.billTabs.length - 1;

    // Reset UI for this new bill
    this.salesEntries = [];
    this.totalGrossAmount = 0;
    this.totalInvoiceAmount = 0;
  }

  switchBill(i: number) {
    this.activeBillIndex = i;
    this.salesEntries = this.billTabs[i].salesEntries;
  }

  private newProduct(): SalesInvoice {
    return {
      sno: 0,

      invoiceID: 0,
      invoiceNumber: '',
      invoiceDate: this.selectedInvoiceDate ?? '',

      companyID: this.selectedCompanyId ?? null,
      companyName: '',

      branchID: this.selectedBranchId ?? null,
      branchName: '',

      customerID: 0,
      customerName: '',
      customerContact: '',
      customerGSTIN: '',
      customerState: '',
      companyState: '',

      accountingYear: this.accountingYear ?? '',
      billingType: '',
      isGSTApplicable: false,
      gstType: '',

      productID: 0,
      barcode: '',
      productCode: '',
      productName: '',

      brandID: 0,
      categoryID: 0,
      subCategoryID: 0,
      hsnid: 0,
      unitID: 0,
      secondaryUnitID: 0,
      statusID: null,

      color: '',
      size: '',
      weight: 0,
      volume: 0,
      material: '',
      finishType: '',
      shadeCode: '',
      capacity: '',
      modelNumber: '',

      expiryDate: '',
      manufacturingDate: '',

      quantity: 0,
      productRate: 0,
      saleRate: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      mrp: 0,

      discountPercentage: 0,
      discountAmount: 0,

      inclusiveAmount: 0,
      exclusiveAmount: 0,

      gstPercentage: 0,
      gstAmount: 0,

      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      cessRate: 0,
      cessAmount: 0,

      grossAmount: 0,
      customerDiscount: 0,
      netAmount: 0,
      taxableAmount: 0,
      grandTotal: 0,

      billingMode: '',
      cashAmount: 0,
      cardAmount: 0,
      upiAmount: 0,
      advanceAmount: 0,
      paidAmount: 0,
      balanceAmount: 0,

      status: '',
      isActive: true,
      isService: false,
      remarks: '',

      createdBy: 'AngularApp',
      createdDate: new Date().toISOString(),
      updatedBy: 'AngularApp',
      updatedDate: new Date().toISOString(),
      cancelledDate: '',
      cancelledBy: '',
      cancelReason: '',

      totalSaleRate: 0,
      totalDiscountAmount: 0,
      totalCGSTAmount: 0,
      totalSGSTAmount: 0,
      totalIGSTAmount: 0,
      totalCESSAmount: 0,

      totalGrossAmount: 0,
      totalDiscAmount: 0,
      totalTaxableAmount: 0,
      totalGstAmount: 0,
      totalNetAmount: 0,
      totalInvoiceAmount: 0,
      totalPaidAmount: 0,
      totalBalanceAmount: 0,
      totalRoundOff: 0,
      totalQuantity: 0,
    };
  }
  validateRequired(label: string, value: any): boolean {
    if (value === null || value === undefined || value === '') {
      this.swall.warning('Validation', `${label} is required.`);
      return false;
    }
    return true;
  }
  validateHeaderFields(): boolean {
    if (!this.validateRequired('Company', this.selectedCompanyId)) return false;

    return true;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent) {
    // ============================
    // SAVE PURCHASE (Shift + S)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault();
      return;
    }

    // ============================
    // FOCUS PAID AMOUNT (Shift + T)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 't') {
      event.preventDefault();

      const paidInput = document.getElementById(
        'paidAmountInput'
      ) as HTMLInputElement;

      if (paidInput) {
        paidInput.focus();
        paidInput.select();
      }
      return;
    }
    // ============================
    // 1) CLOSE / TOGGLE SMALL GRID (ESC)
    // ============================
    if (event.key === 'Escape') {
      event.preventDefault();

      if (this.smallGridVisible) {
        this.smallGridVisible = false; // Close
      } else {
        if (this.activeProductRow !== null) {
          this.showSmallGrid(this.activeProductRow); // Open again
        }
      }
      return;
    }


    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();

      if (!this.validateHeaderFields()) {
        return;
      }

      if (this.salesEntries.length === 0) {
        this.addNewProduct();
        setTimeout(() => {
          this.grid.focusCell(0, 2);
        }, 50);
        return;
      }

      const lastIndex = this.salesEntries.length - 1;
      const lastRow = this.salesEntries[lastIndex];

      if (!this.validateRowForNext(lastRow)) {
        this.swall.warning(
          'Validation Required',
          'Please fill Product, Category, Subcategory, Purchase Rate, Retail Price, Quantity & Amount before adding a new row.'
        );
        return;
      }

      this.addNewProduct();

      const newIndex = this.salesEntries.length - 1;
      setTimeout(() => {
        this.grid.focusCell(newIndex, 2);
      }, 50);
    }
  }

  addNewProduct(): void {
    const newProd = this.newProduct();
    this.salesEntries.push(newProd);
    this.updateSerialNumbers();

    setTimeout(() => {
      if (this.grid?.focusCell) {
        const index = this.salesEntries.length - 1;
        this.grid.focusCell(index, 2); // Product Name column
      }
    }, 50);
  }

  validateRowForNext(row: SalesInvoice): boolean {
    if (!row) return false;

    if (!row.productName || !row.productCode) return false;
    if (!row.productName || !row.productName) return false;
    if (!row.saleRate || Number(row.saleRate) <= 0) return false;
    if (!row.quantity || Number(row.quantity) <= 0) return false;
    if (!row.netAmount || Number(row.netAmount) <= 0) return false;
    return true;
  }
}
