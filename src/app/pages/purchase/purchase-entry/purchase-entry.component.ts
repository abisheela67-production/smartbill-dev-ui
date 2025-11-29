import {
  Component,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { SmallGridComponent } from '../../components/small-grid/small-grid.component';
GroupBoxComponent;
import {
  Company,
  Branch,
  ApiResponse,
} from '../../models/common-models/companyMaster';
import {
  Category,
  Status,
  SubCategory,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
  Supplier,
  Product,
  PaymentMode,
} from '../../models/common-models/master-models/master';
Router;
import { forkJoin, of } from 'rxjs';
import { MasterService } from '../../../services/master.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { AuthService } from '../../../authentication/auth-service.service';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import {
  PurchaseEntry,
  PurchaseOrderEntry,
} from '../../../purchase-order/models/purchase-models';
import { CommonserviceService } from '../../../services/commonservice.service';
import { GroupBoxComponent } from '../../../shared/group-box/group-box.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-entry',
  imports: [
    InputDataGridComponent,
    FormsModule,
    CommonModule,
    SmallGridComponent,
    FocusOnKeyDirective,
  ],
  templateUrl: './purchase-entry.component.html',
  styleUrl: './purchase-entry.component.css',
})
export class PurchaseEntryComponent {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(SmallGridComponent) smallGrid!: SmallGridComponent;

  // Master Lists
  companies: Company[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  paymentModes: PaymentMode[] = [];
  suppliers: Supplier[] = [];
  products: Product[] = [];
  branches: Branch[] = [];
  statuses: Status[] = [];
  purchaseOrderEntries: PurchaseOrderEntry[] = [];
  purchaseEntries: PurchaseEntry[] = [];

  smallGridData: Product[] = [];

  // Flags
  smallGridVisible = false;

  // Header Selections
  selectedCompanyId: number | null = null;
  selectedBranchId: number | null = null;
  selectedSupplierId: number | null = null;
  selectedPurchaseDate: string | null = null;
  selectedExpDeliveryDate: string | null = null;
  activeProductRow: number | null = null;
  accountingYear: any;
  validationLabel = '';
  columns = [
    {
      field: 'sno',
      header: 'S.NO',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'purchaseID',
      header: 'Purchase ID',
      type: 'number',
      visible: false,
      readOnly: true,
    },
    {
      field: 'poNumber',
      header: 'PO Number',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'purchaseDate',
      header: 'Purchase Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'companyID',
      header: 'Company ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'companyName',
      header: 'Company',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    { field: 'branchID', header: 'Branch ID', type: 'number', visible: false },
    {
      field: 'branchName',
      header: 'Branch',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    {
      field: 'supplierID',
      header: 'Supplier ID',
      type: 'number',
      visible: false,
    },
    {
      field: 'supplierName',
      header: 'Supplier',
      type: 'text',
      visible: false,
      readOnly: true,
    },

    { field: 'statusID', header: 'Status ID', type: 'number', visible: false },
    {
      field: 'statusName',
      header: 'Status',
      type: 'select',
      options: 'statuses',
      optionLabel: 'statusName',
      optionValue: 'statusID',
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
      field: 'supplierInvoiceNumber',
      header: 'Supplier Invoice No',
      type: 'text',
      visible: false,
    },
    {
      field: 'supplierInvoiceDate',
      header: 'Supplier Invoice Date',
      type: 'date',
      visible: false,
    },

    { field: 'brandID', header: 'Brand ID', type: 'number', visible: false },
    { field: 'unitID', header: 'Unit ID', type: 'number', visible: false },
    { field: 'hsnid', header: 'HSN ID', type: 'number', visible: false },

    {
      field: 'categoryID',
      header: 'Category',
      type: 'select',
      options: 'categories',
      optionLabel: 'categoryName',
      optionValue: 'categoryID',
      visible: false,
    },

    {
      field: 'subCategoryID',
      header: 'Sub Category',
      type: 'select',
      options: 'subCategories',
      optionLabel: 'subCategoryName',
      optionValue: 'subCategoryID',
      visible: false,
    },

    { field: 'barcode', header: 'Barcode', type: 'text', visible: false },
    {
      field: 'productCode',
      header: 'Product Code',
      type: 'text',
      visible: true,
      readOnly: true,
    },

    {
      field: 'productName',
      header: 'Product Name',
      type: 'text',
      openSmallGrid: true,
      visible: true,
    },

    {
      field: 'productRate',
      header: 'Product Rate',
      type: 'number',
      visible: false,
    },
    { field: 'quantity', header: 'Quantity', type: 'number', visible: true },

    {
      field: 'purchaseRate',
      header: 'Purchase Rate',
      type: 'number',
      visible: true,
    },
    {
      field: 'retailPrice',
      header: 'Retail Price',
      type: 'number',
      visible: true,
    },
    {
      field: 'wholesalePrice',
      header: 'Wholesale Price',
      type: 'number',
      visible: false,
    },
    { field: 'saleRate', header: 'Sale Rate', type: 'number', visible: false },
    { field: 'mrp', header: 'MRP', type: 'number', visible: true },

    {
      field: 'discountAmount',
      header: 'Discount Amount',
      type: 'number',
      visible: false,
    },
    {
      field: 'discountPercentage',
      header: 'Discount %',
      type: 'number',
      visible: false,
    },
    {
      field: 'inclusiveAmount',
      header: 'Inclusive Amount',
      type: 'number',
      visible: false,
    },
    {
      field: 'exclusiveAmount',
      header: 'Exclusive Amount',
      type: 'number',
      visible: false,
    },

    { field: 'gstPercentage', header: 'GST %', type: 'number', visible: false },
    {
      field: 'gstAmount',
      header: 'GST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'cgstRate', header: 'CGST %', type: 'number', visible: false },
    {
      field: 'cgstAmount',
      header: 'CGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'sgstRate', header: 'SGST %', type: 'number', visible: false },
    {
      field: 'sgstAmount',
      header: 'SGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'igstRate', header: 'IGST %', type: 'number', visible: false },
    {
      field: 'igstAmount',
      header: 'IGST Amount',
      type: 'number',
      visible: false,
    },

    { field: 'cessRate', header: 'CESS %', type: 'number', visible: false },
    {
      field: 'cessAmount',
      header: 'CESS Amount',
      type: 'number',
      visible: false,
    },

    {
      field: 'taxableValue',
      header: 'Taxable Value',
      type: 'number',
      visible: false,
    },
    {
      field: 'isGSTInclusive',
      header: 'GST Inclusive?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'orderedQuantity',
      header: 'Ordered Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'receivedQuantity',
      header: 'Received Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'returnedQuantity',
      header: 'Returned Qty',
      type: 'number',
      visible: false,
    },
    {
      field: 'remainingQuantity',
      header: 'Remaining Qty',
      type: 'number',
      visible: false,
    },

    {
      field: 'openingStock',
      header: 'Opening Stock',
      type: 'number',
      visible: false,
    },
    {
      field: 'reorderLevel',
      header: 'Reorder Level',
      type: 'number',
      visible: false,
    },
    {
      field: 'currentStock',
      header: 'Current Stock',
      type: 'number',
      visible: false,
    },

    { field: 'color', header: 'Color', type: 'text', visible: false },
    { field: 'size', header: 'Size', type: 'text', visible: false },
    { field: 'weight', header: 'Weight', type: 'number', visible: false },
    { field: 'volume', header: 'Volume', type: 'number', visible: false },
    { field: 'material', header: 'Material', type: 'text', visible: false },
    {
      field: 'finishType',
      header: 'Finish Type',
      type: 'text',
      visible: false,
    },
    { field: 'shadeCode', header: 'Shade Code', type: 'text', visible: false },
    { field: 'capacity', header: 'Capacity', type: 'text', visible: false },
    {
      field: 'modelNumber',
      header: 'Model Number',
      type: 'text',
      visible: false,
    },

    {
      field: 'expiryDate',
      header: 'Expiry Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'isService',
      header: 'Is Service?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'totalAmount',
      header: 'Total Amount',
      type: 'number',
      visible: true,
    },
    {
      field: 'taxAmount',
      header: 'Tax Amount',
      type: 'number',
      visible: false,
    },
    {
      field: 'grandTotal',
      header: 'Grand Total',
      type: 'number',
      visible: false,
    },

    { field: 'remarks', header: 'Remarks', type: 'text', visible: false },
    { field: 'isActive', header: 'Active', type: 'boolean', visible: false },

    {
      field: 'createdByUserID',
      header: 'Created By',
      type: 'number',
      visible: false,
    },
    {
      field: 'createdSystemName',
      header: 'Created From',
      type: 'text',
      visible: false,
    },
    { field: 'createdAt', header: 'Created At', type: 'date', visible: false },

    {
      field: 'updatedByUserID',
      header: 'Updated By',
      type: 'number',
      visible: false,
    },
    {
      field: 'updatedSystemName',
      header: 'Updated System',
      type: 'text',
      visible: false,
    },
    { field: 'updatedAt', header: 'Updated At', type: 'date', visible: false },

    { field: 'grnNumber', header: 'GRN Number', type: 'text', visible: false },
    { field: 'grnDate', header: 'GRN Date', type: 'date', visible: false },

    { field: 'poid', header: 'POID', type: 'number', visible: false },
    {
      field: 'poDetailID',
      header: 'PO Detail ID',
      type: 'number',
      visible: false,
    },

    {
      field: 'grnRemarks',
      header: 'GRN Remarks',
      type: 'text',
      visible: false,
    },
    {
      field: 'isGRNApproved',
      header: 'GRN Approved?',
      type: 'boolean',
      visible: false,
    },

    {
      field: 'approvedByUserID',
      header: 'Approved By',
      type: 'number',
      visible: false,
    },
    {
      field: 'approvedAt',
      header: 'Approved At',
      type: 'date',
      visible: false,
    },

    {
      field: 'paymentMode',
      header: 'Payment Mode',
      type: 'text',
      visible: false,
    },
    { field: 'paidDays', header: 'Paid Days', type: 'number', visible: false },

    {
      field: 'manufacturingDate',
      header: 'Mfg Date',
      type: 'date',
      visible: false,
    },

    { field: 'taxType', header: 'Tax Type', type: 'text', visible: false },
    {
      field: 'secondaryUnitID',
      header: 'Secondary Unit ID',
      type: 'number',
      visible: false,
    },

    {
      field: 'cancelledDate',
      header: 'Cancelled Date',
      type: 'date',
      visible: false,
    },
    {
      field: 'cancelledBy',
      header: 'Cancelled By',
      type: 'text',
      visible: false,
    },
    {
      field: 'cancelReason',
      header: 'Cancel Reason',
      type: 'text',
      visible: false,
    },

    {
      field: 'accountingYear',
      header: 'Accounting Year',
      type: 'text',
      visible: false,
    },
  ];

  // SMALL GRID COLUMNS (USED IN TEMPLATE)
  productGridColumns = [
    { field: 'productCode', header: 'Product Code' },
    { field: 'productName', header: 'Product Name' },
  ];
  selectedPaymentMode: any;
  invoiceNo: any;
  supplierInvoiceNo: any;
  selectedInvoiceDate: any;

  get visibleColumns() {
    return this.columns.filter((c) => c.visible);
  }

  constructor(
    private masterService: MasterService,
    private commonService: CommonserviceService,
    private swall: SweetAlertService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) {}

  // INIT
  ngOnInit(): void {
    this.selectedPurchaseDate = new Date().toISOString().split('T')[0];
    this.loadDropdowns();

    const companyId = this.authService.companyId;
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.loadProducts(companyId);
    }
  }

  // LOAD PRODUCTS
loadProducts(companyId: number) {
  this.masterService.getProducts(companyId).subscribe((res) => {
    setTimeout(() => {
      this.products = res ?? [];
      this.smallGridData = [...this.products];
    });
  });
}

  goBack() {
    this.router.navigate(['/Purchase/PurchaseOrderView']);
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

  // GRID HEADER UPDATE (TEMPLATE CALLS THIS)
  applyTopSelectionsToGrid() {
    this.purchaseOrderEntries.forEach((row) =>
      this.applyTopSelectionsToRow(row)
    );
  }

  applyTopSelectionsToRow(row: PurchaseOrderEntry) {
    row.companyID = this.selectedCompanyId ?? null;
    row.branchID = this.selectedBranchId ?? null;
    row.supplierID = this.selectedSupplierId ?? null;
    row.poDate = this.selectedPurchaseDate ?? null;
    row.expectedDeliveryDate = this.selectedExpDeliveryDate ?? null;
    row.accountingYear = this.accountingYear ?? null;
    row.statusID = 3;
    row.isActive = true;
  }
  onCompanyChange(companyId: number) {
    this.selectedBranchId = null;
    this.branches = [];

    this.commonService
      .getBranchesByCompany(companyId)
      .subscribe((res: Branch[]) => {
        this.branches = res;

        this.applyTopSelectionsToGrid();
      });
  }
  // PRODUCT SELECTED
  onProductSelected(product: Product) {
    if (this.activeProductRow !== null) {
      const row = this.purchaseEntries[this.activeProductRow];
      row.productCode = product.productCode;
      row.productName = product.productName;
      row.categoryID = product.categoryID ?? null;
      row.subCategoryID = product.subCategoryID ?? null;
    }

    this.smallGridVisible = false;
    setTimeout(() => this.grid.focusCell(this.activeProductRow!, 3), 50);
  }

  onGridNumberChanged(event: any) {
    const { rowIndex } = event;
    const row = this.purchaseOrderEntries[rowIndex];

    row.totalAmount = Number(row.poRate || 0) * Number(row.orderedQty || 0);
  }

  onGridRowAdded(e: any) {
    const newRow = e; // because rowAdded emits only newRow

    this.applyTopSelectionsToRow(newRow);

    this.updateSerialNumbers();
  }
  updateSerialNumbers() {
    this.purchaseEntries.forEach((row, index) => {
      row.sno = index+1;
    });
  }
  validateRowForNext(row: any): boolean {
    if (!row) return false;

    if (!row.productName || !row.productCode) return false;

    if (!row.poRate || Number(row.poRate) <= 0) return false;

    if (!row.orderedQty || Number(row.orderedQty) <= 0) return false;

    if (!row.totalAmount || Number(row.totalAmount) <= 0) return false;

    if (!row.productCategoryId) return false;

    if (!row.productSubCategory) return false;

    return true;
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
    if (!this.validateRequired('Branch', this.selectedBranchId)) return false;
    if (!this.validateRequired('Supplier', this.selectedSupplierId))
      return false;
    if (!this.validateRequired('Accounting Year', this.accountingYear))
      return false;

    return true;
  }

  private newProduct(): PurchaseEntry {
    return {
      sno :0,
      purchaseID: 0,

      poNumber: null,
      purchaseDate: this.selectedInvoiceDate ?? null,

      companyID: this.selectedCompanyId ?? 0,
      companyName: null,

      branchID: this.selectedBranchId ?? 0,
      branchName: null,

      supplierID: this.selectedSupplierId ?? 0,
      supplierName: null,

      statusID: 3, // Default status
      invoiceNumber: null,
      invoiceDate: null,

      supplierInvoiceNumber: this.supplierInvoiceNo ?? null,
      supplierInvoiceDate: null,

      brandID: 0,
      unitID: 0,
      hsnid: 0,

      categoryID: 0,
      subCategoryID: 0,

      barcode: null,
      productCode: null,
      productName: null,

      productRate: 0,
      quantity: 0,
      purchaseRate: 0,

      retailPrice: 0,
      wholesalePrice: 0,
      saleRate: 0,
      mrp: 0,

      discountAmount: 0,
      discountPercentage: 0,
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

      taxableValue: 0,
      isGSTInclusive: false,

      orderedQuantity: 0,
      receivedQuantity: 0,
      returnedQuantity: 0,
      remainingQuantity: 0,

      openingStock: 0,
      reorderLevel: 0,
      currentStock: 0,

      color: null,
      size: null,
      weight: 0,
      volume: 0,
      material: null,
      finishType: null,
      shadeCode: null,
      capacity: null,
      modelNumber: null,

      expiryDate: null,
      isService: false,

      statusName: null,

      totalAmount: 0,
      taxAmount: 0,
      grandTotal: 0,

      remarks: null,

      isActive: true,

      createdByUserID: 0,
      createdSystemName: 'AngularApp',
      createdAt: new Date(),

      updatedByUserID: 0,
      updatedSystemName: 'AngularApp',
      updatedAt: new Date(),

      grnNumber: null,
      grnDate: null,

      poid: null,
      poDetailID: null,

      grnRemarks: null,
      isGRNApproved: false,

      approvedByUserID: 0,
      approvedAt: null,

      paymentMode: null,
      paidDays: 0,

      manufacturingDate: null,

      taxType: null,

      secondaryUnitID: 0,

      cancelledDate: null,
      cancelledBy: null,
      cancelReason: null,

      accountingYear: this.accountingYear ?? null,
    };
  }

  // Add New Row
  addNewProduct(): void {
    const newProd = this.newProduct();
    this.purchaseEntries.push(newProd);

    this.updateSerialNumbers();
    this.grid.focusCell(0, 2);
  }
  // OPEN PRODUCT SMALL GRID
showSmallGrid(rowIndex: number) {
  this.activeProductRow = rowIndex;

  setTimeout(() => {
    this.smallGridData = [...this.products];
    this.smallGridVisible = true;
  });
}


  @HostListener('document:keydown', ['$event'])
  handleKeyEvents(event: KeyboardEvent) {
    // ============================
    // 1) CLOSE SMALL GRID ON ESC
    // ============================
    if (event.key === 'Escape') {
      event.preventDefault();

      // If small grid is open → CLOSE IT
      if (this.smallGridVisible) {
        this.smallGridVisible = false;
      }
      // If small grid is closed → OPEN IT (toggle)
      else {
        if (this.activeProductRow !== null) {
          this.showSmallGrid(this.activeProductRow);
        }
      }

      return;
    }
    // ============================
    // 2) ADD ROW (Shift + N)
    // ============================
    if (event.shiftKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();

      // 1) Validate HEADER before row creation
      if (!this.validateHeaderFields()) {
        return;
      }

      // 2) First row → allow
      if (this.purchaseOrderEntries.length === 0) {
        this.addNewProduct();
        return;
      }

      // 3) Validate last row
      const last = this.purchaseOrderEntries.length - 1;
      const row = this.purchaseOrderEntries[last];

      if (!this.validateRowForNext(row)) {
        this.swall.warning(
          'Validation',
          'Please fill Product, Rate, Qty & Amount before adding new row.'
        );
        return;
      }

      // 4) Add new row
      this.addNewProduct();
    }
  }


  
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.grid && this.purchaseEntries.length > 0) {
        this.grid.focusCell(0, 4);
      }
    }, 300);
  }

}
