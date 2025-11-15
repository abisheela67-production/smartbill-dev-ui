import { Component, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
forkJoin
import { GroupBoxComponent } from '../../shared/group-box/group-box.component';
import { InputDataGridComponent } from '../../pages/components/input-data-grid/input-data-grid.component';

import {
  Company,
  ApiResponse,
} from '../../pages/models/common-models/companyMaster';
import {
  Category,
  SubCategory,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
  Supplier,
} from '../../pages/models/common-models/master-models/master';
import { PurchaseOrderEntry } from '../../purchase-order/models/purchase-models';

import { MasterService } from '../../services/master.service';
import { CommonserviceService } from '../../services/commonservice.service';
import { SweetAlertService } from '../../services/properties/sweet-alert.service';
import { ValidationService } from '../../services/properties/validation.service';
import { PurchaseOrderServiceService } from '../services/purchase-order-service.service';
import { AuthService } from '../../authentication/auth-service.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchsae-order-entry',
  standalone: true,
  imports: [GroupBoxComponent, InputDataGridComponent, FormsModule, CommonModule],
  templateUrl: './purchsae-order-entry.component.html',
  styleUrl: './purchsae-order-entry.component.css',
})
export class PurchsaeOrderEntryComponent {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(GroupBoxComponent) groupBox!: GroupBoxComponent;

  // Master Lists
  companies: Company[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];
  suppliers: Supplier[] = [];

  // Flags
  isUploading = false;

  // Selection Variables
  selectedCompanyId: number | null = null;
  selectedSupplierId: number | null = null;

  // Purchase Order Data
  purchaseOrderEntries: PurchaseOrderEntry[] = [];

  // ==========================================================
  // COLUMN CONFIGURATION
  // ==========================================================
  columns = [
    { field: 'sno', header: 'S.NO', type: 'text', width: '30px', visible: true, readOnly: true },
    { field: 'poNumber', header: 'PO NUMBER', type: 'text', visible: false, readOnly: true },
    { field: 'poDate', header: 'PO DATE', type: 'date', visible: false, readOnly: true },

    { field: 'supplierID', header: 'SUPPLIER', type: 'select', options: 'suppliers', optionLabel: 'supplierName', optionValue: 'supplierID', visible: true },
    { field: 'supplierName', header: 'SUPPLIER NAME', type: 'text', visible: false, readOnly: true },

    { field: 'productCode', header: 'PRODUCT CODE', type: 'text', visible: true, readOnly: true },
    { field: 'productName', header: 'PRODUCT NAME', type: 'text', visible: true, requiredForNextRow: true },
    { field: 'productCategoryId', header: 'CATEGORY', type: 'select', options: 'categories', optionLabel: 'productCategoryName', optionValue: 'productCategoryId', visible: true },
    { field: 'productSubCategory', header: 'SUB CATEGORY', type: 'select', options: 'subCategories', optionLabel: 'productSubCategoryName', optionValue: 'productSubCategory', visible: true },

    { field: 'poRate', header: 'RATE', type: 'number', visible: true },
    { field: 'orderedQty', header: 'ORDERED QTY', type: 'number', visible: true },
    { field: 'approvedQty', header: 'APPROVED QTY', type: 'number', visible: false, readOnly: true },
    { field: 'totalAmount', header: 'TOTAL AMOUNT', type: 'number', visible: true, readOnly: true },

    { field: 'expectedDeliveryDate', header: 'EXPECTED DELIVERY', type: 'date', visible: false },
    { field: 'productRemarks', header: 'REMARKS', type: 'text', visible: false },

    { field: 'companyID', header: 'COMPANY', type: 'select', options: 'companies', optionLabel: 'companyName', optionValue: 'companyID', visible: false },
    { field: 'branchID', header: 'BRANCH', type: 'select', options: 'branches', optionLabel: 'branchName', optionValue: 'branchID', visible: false },
    { field: 'statusID', header: 'STATUS', type: 'select', options: 'statuses', optionLabel: 'statusName', optionValue: 'statusID', visible: false },
    { field: 'isActive', header: 'ACTIVE', type: 'boolean', visible: false },
    { field: 'poRemarks', header: 'PO REMARKS', type: 'text', visible: false },
  ];

  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly commonService: CommonserviceService,
    private readonly swall: SweetAlertService,
    private readonly authService: AuthService,
    private readonly purchaseOrderService: PurchaseOrderServiceService
  ) {}

  // ==========================================================
  // LIFECYCLE
  // ==========================================================
  ngOnInit(): void {
    this.loadDropdowns();
    this.refreshGrid();

    // 🔹 Get logged-in user's company ID
    const companyId = this.authService.companyId;
    if (companyId) {
      this.selectedCompanyId = companyId;
      this.setCompanyForAllEntries(companyId);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focusFirstGridCell(), 300);
  }

  // ==========================================================
  // UI HELPERS
  // ==========================================================
  get visibleColumns() {
    return (this.columns || []).filter((col) => col.visible);
  }

  private focusFirstGridCell(): void {
    if (this.grid && this.purchaseOrderEntries.length > 0) {
      this.grid.focusCell(0, 1);
    }
  }

  private focusLastRow(): void {
    setTimeout(() => {
      const rowIndex = this.purchaseOrderEntries.length - 1;
      if (this.grid) this.grid.focusCell(rowIndex, 1);
    }, 200);
  }

  // ==========================================================
  // COMPANY HANDLING
  // ==========================================================
  private setCompanyForAllEntries(companyId: number): void {
    this.purchaseOrderEntries.forEach((entry) => {
      entry.companyID = companyId;
    });
  }

  // ==========================================================
  // GRID OPERATIONS
  // ==========================================================
  private newProduct(): PurchaseOrderEntry {
    const nextSno = this.purchaseOrderEntries.length + 1;
    return {
      sno: nextSno,
      poNumber: '',
      poDate: new Date(),
      supplierID: null,
      supplierName: '',
      productCode: '',
      productName: '',
      productCategoryId: null,
      productCategoryName: '',
      productSubCategory: null,
      poRate: 0,
      orderedQty: 0,
      approvedQty: 0,
      totalAmount: 0,
      expectedDeliveryDate: null,
      productRemarks: '',
      companyID: this.selectedCompanyId,
      statusID: null,
      isActive: true,
      poRemarks: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as PurchaseOrderEntry;
  }

  refreshGrid(): void {
    this.purchaseOrderEntries = [this.newProduct()];
  }

  addNewProduct(): void {
    const newProd = this.newProduct();
    this.purchaseOrderEntries.push(newProd);
    this.focusLastRow();
  }

  // ==========================================================
  // DROPDOWN LOADING
  // ==========================================================
loadDropdowns(): void {
  const companyId = this.authService.companyId;

  forkJoin({
    companies: this.commonService.getCompanies(),
    categories: this.masterService.getCategories(),
    subCategories: this.masterService.getSubCategories(),
    brands: this.masterService.getBrands(),
    units: this.masterService.getUnits(),
    hsnCodes: this.masterService.getHSNCodes(),
    taxes: this.masterService.getTaxes(),
    cesses: this.masterService.getCesses(),
    suppliers: this.masterService.getSuppliers(),
  }).subscribe((res) => {
    this.companies = res.companies ?? [];
    this.categories = res.categories ?? [];
    this.subCategories = res.subCategories ?? [];
    this.brands = res.brands ?? [];
    this.units = res.units ?? [];
    this.hsnCodes = res.hsnCodes ?? [];
    this.taxes = res.taxes ?? [];
    this.cesses = res.cesses ?? [];
    this.suppliers = res.suppliers ?? [];

    console.log('Suppliers Loaded:', this.suppliers);

    if (companyId) {
      this.selectedCompanyId = companyId;
      this.setCompanyForAllEntries(companyId);
    }

    this.refreshGrid(); // ensures dropdowns bind after data loads
  });
}


  // ==========================================================
  // SAVE PURCHASE ORDER
  // ==========================================================
  savePurchaseOrder(): void {
    if (!this.purchaseOrderEntries?.length) {
      this.swall.warning('Warning', 'No products to save!');
      return;
    }

    const invalidRows = this.purchaseOrderEntries.filter(
      (p) => !p.productName?.trim() || !p.productCategoryId
    );

    if (invalidRows.length > 0) {
      this.swall.warning('Validation', `Please fill required fields in ${invalidRows.length} row(s).`);
      return;
    }

    const userId = this.commonService.getCurrentUserId();
    let successCount = 0;
    let errorCount = 0;

    this.purchaseOrderEntries.forEach((p, index) => {
      const payload: PurchaseOrderEntry = {
        ...p,
        companyID: this.selectedCompanyId || p.companyID,
        createdByUserID: p.createdByUserID || userId,
        updatedByUserID: userId,
      };

      this.purchaseOrderService.savePurchaseOrder(payload).subscribe({
        next: (res: ApiResponse) => {
          if (res.success) successCount++;
          else errorCount++;

          if (successCount + errorCount === this.purchaseOrderEntries.length) {
            this.showSaveSummary(successCount, errorCount);
            this.refreshGrid();
          }
        },
        error: (err) => {
          console.error(`Save failed for row ${index + 1}:`, err);
          errorCount++;
          if (successCount + errorCount === this.purchaseOrderEntries.length) {
            this.showSaveSummary(successCount, errorCount);
            this.refreshGrid();
          }
        },
      });
    });
  }

  private showSaveSummary(successCount: number, errorCount: number): void {
    if (errorCount === 0)
      this.swall.success('Success', 'All products saved successfully!');
    else if (successCount > 0)
      this.swall.warning('Partial Success', `${successCount} saved, ${errorCount} failed.`);
    else this.swall.error('Error', 'All products failed to save.');
  }
}
