import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';

import {
  Product,
  Category,
  SubCategory,
  Brand,
  Unit,
  HSN,
  Tax,
  Cess,
} from '../../models/common-models/master-models/master';
import { Company } from '../../models/common-models/companyMaster';

interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, InputDataGridComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit, AfterViewInit {
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;

  products: Product[] = [];
  companies: Company[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  brands: Brand[] = [];
  units: Unit[] = [];
  hsnCodes: HSN[] = [];
  taxes: Tax[] = [];
  cesses: Cess[] = [];

  columns = [
    { field: 'sno', header: 'S.NO', type: 'text', width: '60px' },
    { field: 'barcode', header: 'BARCODE', type: 'text' },
    { field: 'productCode', header: 'PRODUCT CODE', type: 'text' },
    { field: 'productName', header: 'PRODUCT NAME', type: 'text' },
    { field: 'productDescription', header: 'DESCRIPTION', type: 'text' },
    { field: 'isService', header: 'IS SERVICE', type: 'boolean' },

    // Categorization
    {
      field: 'categoryID',
      header: 'CATEGORY',
      type: 'select',
      options: 'categories',
      optionLabel: 'categoryName',
      optionValue: 'categoryID',
    },
    {
      field: 'subCategoryID',
      header: 'SUB CATEGORY',
      type: 'select',
      options: 'subCategories',
      optionLabel: 'subCategoryName',
      optionValue: 'subCategoryID',
    },
    {
      field: 'brandID',
      header: 'BRAND',
      type: 'select',
      options: 'brands',
      optionLabel: 'brandName',
      optionValue: 'brandID',
    },
    {
      field: 'unitID',
      header: 'UNIT',
      type: 'select',
      options: 'units',
      optionLabel: 'unitName',
      optionValue: 'unitID',
    },
    {
      field: 'secondaryUnitID',
      header: 'SECONDARY UNIT',
      type: 'select',
      options: 'units',
      optionLabel: 'unitName',
      optionValue: 'unitID',
    },

    // Taxation
    {
      field: 'hsnid',
      header: 'HSN CODE',
      type: 'select',
      options: 'hsnCodes',
      optionLabel: 'hsnCode',
      optionValue: 'hsnid',
    },
    {
      field: 'taxID',
      header: 'TAX NAME',
      type: 'select',
      options: 'taxes',
      optionLabel: 'taxName',
      optionValue: 'taxID',
    },
    {
      field: 'cessID',
      header: 'CESS NAME',
      type: 'select',
      options: 'cesses',
      optionLabel: 'cessName',
      optionValue: 'cessID',
    },
    {
      field: 'companyID',
      header: 'COMPANY',
      type: 'select',
      options: 'companies',
      optionLabel: 'companyName',
      optionValue: 'companyID',
    },

    // Pricing
    { field: 'purchaseRate', header: 'PURCHASE RATE', type: 'number' },
    { field: 'mrp', header: 'MRP', type: 'number' },
    { field: 'retailPrice', header: 'RETAIL PRICE', type: 'number' },
    { field: 'wholesalePrice', header: 'WHOLESALE PRICE', type: 'number' },
    { field: 'saleRate', header: 'SALE RATE', type: 'number' },
    { field: 'discountPercentage', header: 'DISCOUNT %', type: 'number' },
    { field: 'discountAmount', header: 'DISCOUNT AMOUNT', type: 'number' },

    // Stock & Attributes
    { field: 'openingStock', header: 'OPENING STOCK', type: 'number' },
    { field: 'reorderLevel', header: 'REORDER LEVEL', type: 'number' },
    { field: 'currentStock', header: 'CURRENT STOCK', type: 'number' },
    { field: 'expiryDate', header: 'EXPIRY DATE', type: 'date' },
    { field: 'color', header: 'COLOR', type: 'text' },
    { field: 'size', header: 'SIZE', type: 'text' },
    { field: 'weight', header: 'WEIGHT', type: 'number' },
    { field: 'volume', header: 'VOLUME', type: 'number' },
    { field: 'material', header: 'MATERIAL', type: 'text' },
    { field: 'finishType', header: 'FINISH TYPE', type: 'text' },
    { field: 'shadeCode', header: 'SHADE CODE', type: 'text' },
    { field: 'capacity', header: 'CAPACITY', type: 'text' },
    { field: 'modelNumber', header: 'MODEL NUMBER', type: 'text' },

    // Meta Info
    { field: 'isActive', header: 'ACTIVE', type: 'boolean' },
    { field: 'createdAt', header: 'CREATED AT', type: 'datetime' },
    { field: 'updatedAt', header: 'UPDATED AT', type: 'datetime' },
  ];

  constructor(
    private readonly masterService: MasterService,
    private readonly validationService: ValidationService,
    private readonly commonService: CommonserviceService,
    private readonly swall: SweetAlertService
  ) {}

  // ==========================================================
  // Lifecycle
  // ==========================================================
  ngOnInit(): void {
    this.loadDropdowns();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.focusFirstGridCell(), 300);
  }

  // ==========================================================
  // Grid Logic
  // ==========================================================
  onCellValueChanged(event: any): void {
    const { row, col, value } = event;
    const field = this.columns[col].field;
    this.products[row][field] = value;
  }

  onRowAdded(): void {
    this.products.push(this.newProduct());
    this.focusLastRow();
  }

  private focusFirstGridCell(): void {
    if (this.grid && this.products.length > 0) {
      this.grid.focusCell(0, 3);
    }
  }

  addNewProduct(): void {
    const newProd = this.newProduct();
    this.products.push(newProd);
    this.focusLastRow();
  }

  private focusLastRow(): void {
    setTimeout(() => {
      const rowIndex = this.products.length - 1;
      if (this.grid) this.grid.focusCell(rowIndex, 3);
    }, 200);
  }

  loadDropdowns(): void {
    this.commonService.getCompanies().subscribe((res) => (this.companies = res ?? []));
    this.masterService.getCategories().subscribe((res) => (this.categories = res ?? []));
    this.masterService.getSubCategories().subscribe((res) => (this.subCategories = res ?? []));
    this.masterService.getBrands().subscribe((res) => (this.brands = res ?? []));
    this.masterService.getUnits().subscribe((res) => (this.units = res ?? []));
    this.masterService.getHSNCodes().subscribe((res) => (this.hsnCodes = res ?? []));
    this.masterService.getTaxes().subscribe((res) => (this.taxes = res ?? []));
    this.masterService.getCesses().subscribe((res) => (this.cesses = res ?? []));
  }

  // ==========================================================
  // Default Product Factory
  // ==========================================================
  private newProduct(): Product {
    const now = new Date().toISOString();
    const userId = this.commonService.getCurrentUserId();

    return {
      productID: 0,
      productName: '',
      productCode: '',
      categoryID: 0,
      subCategoryID: 0,
      brandID: 0,
      unitID: 0,
      hsnid: 0,
      taxID: 0,
      cessID: 0,
      purchaseRate: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      saleRate: 0,
      mrp: 0,
      discountAmount: 0,
      discountPercentage: 0,
      openingStock: 0,
      reorderLevel: 0,
      currentStock: 0,
      barcode: '',
      isService: false,
      productDescription: '',
      productImage: '',
      companyID: 10, // ✅ Default company ID
      branchID: 12, // ✅ Default branch ID
      isActive: true,
      createdByUserID: userId,
      createdSystemName: 'AngularApp',
      createdAt: now,
      updatedByUserID: userId,
      updatedSystemName: 'AngularApp',
      updatedAt: now,
      color: '',
      size: '',
      weight: 0,
      volume: 0,
      material: '',
      finishType: '',
      shadeCode: '',
      capacity: '',
      modelNumber: '',
      expiryDate: now,
      secondaryUnitID: 0,
      taxType: '',
      isGSTInclusive: false,
      taxableValue: 0,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      cessRate: 0,
      cessAmount: 0,
    };
  }

  // ==========================================================
  // Save Logic
  // ==========================================================
  saveAllProducts(): void {
    if (!this.products?.length) {
      this.swall.warning('Warning', 'No products to save!');
      return;
    }

    const invalidRows = this.products.filter(
      (p) => !p.productName?.trim() || !p.categoryID
    );

    if (invalidRows.length > 0) {
      this.swall.warning(
        'Validation',
        `Please fill required fields in ${invalidRows.length} row(s)`
      );
      return;
    }

    const userId = this.commonService.getCurrentUserId();
    let successCount = 0;
    let errorCount = 0;

    this.products.forEach((p, index) => {
      const payload: Product = {
        ...p,
        companyID: p.companyID || 10,
        branchID: p.branchID || 12,
        createdByUserID: p.createdByUserID || userId,
        updatedByUserID: userId,
      };

      this.masterService.saveProduct(payload).subscribe({
        next: (res: ApiResponse) => {
          if (res.success) successCount++;
          else errorCount++;

          if (successCount + errorCount === this.products.length) {
            this.showSaveSummary(successCount, errorCount);
          }
        },
        error: (err) => {
          console.error(`Save failed for product ${index + 1}:`, err);
          errorCount++;
          if (successCount + errorCount === this.products.length) {
            this.showSaveSummary(successCount, errorCount);
          }
        },
      });
    });
  }

  private showSaveSummary(successCount: number, errorCount: number): void {
    if (errorCount === 0) {
      this.swall.success('Success', 'All products saved successfully!');
    } else if (successCount > 0) {
      this.swall.warning(
        'Partial Success',
        `${successCount} product(s) saved, ${errorCount} failed.`
      );
    } else {
      this.swall.error('Error', 'All products failed to save.');
    }
  }
}
