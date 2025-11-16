import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { MasterService } from '../../../services/master.service';
import { ValidationService } from '../../../services/properties/validation.service';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { CommonserviceService } from '../../../services/commonservice.service';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { saveAs } from 'file-saver';
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
import { IconsModule } from '../../../shared/icons.module';
import { icons } from 'lucide-angular';
import { GroupBoxComponent } from '../../../shared/group-box/group-box.component';

interface ApiResponse {
  success: boolean;
  message?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [FormsModule, CommonModule, InputDataGridComponent, SharedModule, IconsModule, GroupBoxComponent],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit, AfterViewInit {
  [key: string]: any; // Add index signature
  @ViewChild(InputDataGridComponent) grid!: InputDataGridComponent;
  @ViewChild(GroupBoxComponent) groupBox!: GroupBoxComponent;


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
  { field: 'sno', header: 'S.NO', type: 'text', width: '30px', visible: true ,readOnly: true,},
  { field: 'barcode', header: 'BARCODE', type: 'text', visible: false, },
  { field: 'productCode', header: 'PRODUCT CODE', type: 'text', visible: false },
  { field: 'productName', header: 'PRODUCT NAME', type: 'text', visible: true, requiredForNextRow: true},
  { field: 'productDescription', header: 'DESCRIPTION', type: 'text', visible: false },
  { field: 'isService', header: 'IS SERVICE', type: 'boolean', visible: false },

  // Categorization
  {
    field: 'categoryID',
    header: 'CATEGORY',
    type: 'select',
    options: 'categories',
    optionLabel: 'categoryName',
    optionValue: 'categoryID',
    visible: true,
     allowUploadFill: true
  },
  {
    field: 'subCategoryID',
    header: 'SUB CATEGORY',
    type: 'select',
    options: 'subCategories',
    optionLabel: 'subCategoryName',
    optionValue: 'subCategoryID',
    visible: true,
    allowUploadFill: true,
  }
  ,
  {
    field: 'brandID',
    header: 'BRAND',
    type: 'select',
    options: 'brands',     
    optionLabel: 'brandName',
    optionValue: 'brandID',
    visible: false,
  },
  {
    field: 'unitID',
    header: 'UNIT',
    type: 'select',
    options: 'units',
    optionLabel: 'unitName',
    optionValue: 'unitID',
    visible: true,
  },
  {
    field: 'secondaryUnitID',
    header: 'SECONDARY UNIT',
    type: 'select',
    options: 'units',
    optionLabel: 'unitName',
    optionValue: 'unitID',
    visible: false,
  },

  // Taxation
  {
    field: 'hsnid',
    header: 'HSN CODE',
    type: 'select',
    options: 'hsnCodes',
    optionLabel: 'hsnCode',
    optionValue: 'hsnid',
    visible: false,
  },
  {
    field: 'taxID',
    header: 'TAX NAME',
    type: 'select',
    options: 'taxes',
    optionLabel: 'taxName',
    optionValue: 'taxID',
    visible: false,
  },
  {
    field: 'cessID',
    header: 'CESS NAME',
    type: 'select',
    options: 'cesses',
    optionLabel: 'cessName',
    optionValue: 'cessID',
    visible: false,
  },

  { field: 'purchaseRate', header: 'PURCHASE RATE', type: 'number', visible: false },
  { field: 'mrp', header: 'MRP', type: 'number', visible: true },
  { field: 'retailPrice', header: 'RETAIL PRICE', type: 'number', visible: false },
  { field: 'saleRate', header: 'SALE RATE', type: 'number', visible: true },

  { field: 'wholesalePrice', header: 'WHOLESALE PRICE', type: 'number', visible: true },
  { field: 'discountPercentage', header: 'DISCOUNT %', type: 'number', visible: false },
  { field: 'discountAmount', header: 'DISCOUNT AMOUNT', type: 'number', visible: false },
  { field: 'openingStock', header: 'OPENING STOCK', type: 'number', visible: false },
  { field: 'reorderLevel', header: 'REORDER LEVEL', type: 'number', visible: false },
  { field: 'currentStock', header: 'CURRENT STOCK', type: 'number', visible: false },
  { field: 'expiryDate', header: 'EXPIRY DATE', type: 'date', visible: false },
  { field: 'color', header: 'COLOR', type: 'text', visible: false },
  { field: 'size', header: 'SIZE', type: 'text', visible: false },
  { field: 'weight', header: 'WEIGHT', type: 'number', visible: false },
  { field: 'volume', header: 'VOLUME', type: 'number', visible: false },
  { field: 'material', header: 'MATERIAL', type: 'text', visible: false },
  { field: 'finishType', header: 'FINISH TYPE', type: 'text', visible: false },
  { field: 'shadeCode', header: 'SHADE CODE', type: 'text', visible: false },
  { field: 'capacity', header: 'CAPACITY', type: 'text', visible: false },
  { field: 'modelNumber', header: 'MODEL NUMBER', type: 'text', visible: false },
  { field: 'isActive', header: 'ACTIVE', type: 'boolean', visible: true },
  { field: 'createdAt', header: 'CREATED AT', type: 'datetime', visible: false },
  { field: 'updatedAt', header: 'UPDATED AT', type: 'datetime', visible: false },
    {
    field: 'companyID',
    header: 'COMPANY',
    type: 'select',
    options: 'companies',
    optionLabel: 'companyName',
    optionValue: 'companyID',
    visible: true,
     readOnly: true,
  },

];
  filteredSubCategories: any;

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


get visibleColumns() {
  return (this.columns || []).filter(col => col.visible);
}@HostListener('window:keydown', ['$event'])
handleKeyboardShortcuts(e: KeyboardEvent) {
  if (e.shiftKey && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    this.addNewProduct();
    return;
  }

  if (e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    this.saveAllProducts();
    return;
  }

  // 🟢 ENTER → Only act in Wholesale Price column
  if (e.key === 'Enter' && this.grid?.currentCell && typeof this.grid.currentCell === 'object') {
    const { row, col } = this.grid.currentCell;
    const field = this.columns[col]?.field;

    if (field === 'wholesalePrice') {
      const currentRow = this.products[row];
      if (!currentRow) return;

      // ✅ Trim and validate
      const name = (currentRow.productName || '').trim();
      const hasName = name.length > 0;
      const hasRate =
        (currentRow.wholesalePrice && currentRow.wholesalePrice > 0) ||
        (currentRow.saleRate && currentRow.saleRate > 0);

      // 🚫 Don’t add if product name is empty or only spaces, or rate is 0
      if (!hasName || !hasRate) return;

      // ✅ Add new row if valid
      e.preventDefault();
      this.addNewProduct();
    }
  }
}
onCellValueChanged(event: any): void {
  const { row, col, value } = event;
  const field = this.columns[col].field;
  const trimmedValue = (value ?? '').toString().trim();

  // Always store trimmed value
  this.products[row][field] = trimmedValue;

  // ✅ Only add a new row if productName has a valid (non-empty) value
  if (field === 'productName') {
    const isLastRow = row === this.products.length - 1;
    const hasValidValue = trimmedValue !== '';

    if (isLastRow && hasValidValue) {
      this.addNewProduct();
    }
  }
}



  private updateSerialNumbers(): void {
  this.products.forEach((p, index) => {
    p.sno = index + 1;
  });
}

refreshGrid(): void {
  this.products = [];              // clear all rows
  this.products.push(this.newProduct()); // add one empty row
  this.updateSerialNumbers();      // reassign S.No
}

  private focusFirstGridCell(): void {
    if (this.grid && this.products.length > 0) {
      this.grid.focusCell(0, 1);
    }
  }

  addNewProduct(): void {
    const newProd = this.newProduct();
    this.products.push(newProd);
    this.focusLastRow();
      this.updateSerialNumbers();
  }

  private focusLastRow(): void {
    setTimeout(() => {
      const rowIndex = this.products.length - 1;
      if (this.grid) this.grid.focusCell(rowIndex, 1);
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
            this.refreshGrid();
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
async downloadTemplate() {
  try {
    // ✅ Step 1: Visible columns only
    const visibleCols = this.columns.filter(col => col.visible);

    // ✅ Step 2: Load master data safely
    const masterData: any = {
      categories: this.categories?.length ? this.categories : await this.masterService.getCategories().toPromise() || [],
      subCategories: this.subCategories?.length ? this.subCategories : await this.masterService.getSubCategories().toPromise() || [],
      brands: this.brands?.length ? this.brands : await this.masterService.getBrands().toPromise() || [],
      units: this.units?.length ? this.units : await this.masterService.getUnits().toPromise() || [],
      hsnCodes: this.hsnCodes?.length ? this.hsnCodes : await this.masterService.getHSNCodes().toPromise() || [],
      taxes: this.taxes?.length ? this.taxes : await this.masterService.getTaxes().toPromise() || [],
      cesses: this.cesses?.length ? this.cesses : await this.masterService.getCesses().toPromise() || [],
      companies: this.companies?.length ? this.companies : await this.commonService.getCompanies().toPromise() || [],
    };

    // ✅ Step 3: Workbook setup
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Product Template');

    // ✅ Step 4: Header row
    const headers = visibleCols.map(col => col.header);
    sheet.addRow(headers);

    // ✅ Step 5: Map field → column letter
    const colMap = new Map<string, string>();
    visibleCols.forEach((col, index) => {
      const letter = sheet.getColumn(index + 1).letter;
      colMap.set(col.field, letter);
    });

    // ✅ Step 6: Master dropdown lists
    const categoryList = (masterData.categories ?? []).map((x: any) => x.categoryName);
    const subCategoryList = (masterData.subCategories ?? []).map((x: any) => x.subCategoryName);
    const brandList = (masterData.brands ?? []).map((x: any) => x.brandName);
    const unitList = (masterData.units ?? []).map((x: any) => x.unitName);
    const hsnList = (masterData.hsnCodes ?? []).map((x: any) => x.hsnCode);
    const taxList = (masterData.taxes ?? []).map((x: any) => x.taxName);
    const cessList = (masterData.cesses ?? []).map((x: any) => x.cessName);
    const companyList = (masterData.companies ?? []).map((x: any) => x.companyName);

    // ✅ Step 7: Apply validations + styles + S.No fill
    for (let i = 2; i <= 200; i++) {
      for (const col of visibleCols) {
        const letter = colMap.get(col.field)!;
        const cell = sheet.getCell(`${letter}${i}`);

        // 🔹 Auto-fill S.No
        if (col.field === 'sno') {
          cell.value = i - 1;
          cell.alignment = { horizontal: 'center' };
          cell.protection = { locked: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }, // light gray
          };
          continue;
        }

        // 🔹 Product Name always editable (no restriction)
        if (col.field === 'productName') {
          cell.protection = { locked: false };
          // Optional: highlight editable column
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF99' }, // light yellow
          };
          continue;
        }

        // 🔹 Dropdown lists
        if (col.type === 'select') {
          let list: string[] = [];
          switch (col.field) {
            case 'categoryID': list = categoryList; break;
            case 'subCategoryID': list = subCategoryList; break;
            case 'brandID': list = brandList; break;
            case 'unitID':
            case 'secondaryUnitID': list = unitList; break;
            case 'hsnid': list = hsnList; break;
            case 'taxID': list = taxList; break;
            case 'cessID': list = cessList; break;
            case 'companyID': list = companyList; break;
          }
          if (list.length > 0) {
            cell.dataValidation = {
              type: 'list',
              allowBlank: true,
              formulae: [`"${list.join(',')}"`],
            };
          }
        }

        // 🔹 Boolean dropdown
        if (col.type === 'boolean') {
          cell.dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"TRUE,FALSE"'],
          };
        }

        // 🔹 Numeric columns
        if (col.type === 'number') {
          cell.dataValidation = {
            type: 'decimal',
            operator: 'greaterThanOrEqual',
            allowBlank: true,
            formulae: [0],
          };
        }

        // 🔹 Read-only columns
        if (col.readOnly) {
          cell.protection = { locked: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }, // gray
          };
        } else {
          cell.protection = { locked: false };
        }
      }
    }

    // ✅ Step 8: Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D1160' } };
    sheet.columns.forEach(col => (col.width = 20));

    // ✅ Step 9: Protect and Save
    sheet.protect('protected', { selectLockedCells: true, selectUnlockedCells: true });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'ProductVisibleTemplate.xlsx');

    this.swall.success('Template Downloaded', 'Excel template generated successfully with S.No and editable Product Name.');
  } catch (err) {
    console.error('Template download error:', err);
    this.swall.error('Error', 'Failed to generate template');
  }
}


/*
@HostListener('window:keydown', ['$event'])
handleKeyboardShortcuts(e: KeyboardEvent) {
  if (e.shiftKey && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    this.addNewProduct();
  }
  if (e.shiftKey && e.key.toLowerCase() === 's') {
    e.preventDefault();
    this.saveAllProducts();
  }






}
*/
isUploading: boolean = false;


private safeString(value: any): string {
  return String(value ?? '').trim();
}async onFileUpload(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    this.isUploading = true;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const sheet = wb.worksheets[0];
    const header = sheet.getRow(1).values as string[];

    // Map Excel header → field
    const fieldMap: Record<number, string> = {};
    this.visibleColumns.forEach((col) => {
      const idx = header.findIndex(
        (h: any) => String(h || '').trim().toLowerCase() === col.header.toLowerCase()
      );
      if (idx > 0) fieldMap[idx] = col.field;
    });

    const uploadedRows: any[] = [];
    sheet.eachRow((row, i) => {
      if (i === 1) return;
      const obj: any = {};
      row.eachCell((cell, j) => {
        const f = fieldMap[j];
        if (f) obj[f] = String(cell.value ?? '').trim();
      });
      if (obj.productName) uploadedRows.push(obj);
    });

    const mapValue = (list: any[], label: string, id: string, val: string) => {
      const match = list.find(
        (x) => String(x[label] ?? '').toLowerCase() === String(val).toLowerCase()
      );
      return match ? match[id] : 0;
    };

    // ✅ Merge logic (update if exists, else add new)
    for (const r of uploadedRows) {
      const existing = this.products.find(
        (p) => p.productName.trim().toLowerCase() === r.productName.trim().toLowerCase()
      );

      const mappedData: Product = {
        ...this.newProduct(),
        ...r,
        categoryID: mapValue(this.categories, 'categoryName', 'categoryID', r.categoryID),
        subCategoryID: mapValue(this.subCategories, 'subCategoryName', 'subCategoryID', r.subCategoryID),
        unitID: mapValue(this.units, 'unitName', 'unitID', r.unitID),
        companyID: mapValue(this.companies, 'companyName', 'companyID', r.companyID),
        isActive: (r.isActive || '').toString().toLowerCase() === 'true',
      };

      if (existing) {
        // 🔄 Update existing
        Object.assign(existing, mappedData);
      } else {
        // ➕ Add new
        this.products.push(mappedData);
      }
    }

    this.updateSerialNumbers();
    this.swall.success(
      'Upload Success',
      `${uploadedRows.length} records processed. Updated ${uploadedRows.filter(r =>
        this.products.some(p => p.productName.trim().toLowerCase() === r.productName.trim().toLowerCase())
      ).length} existing and added new ${uploadedRows.length} products.`
    );
  } catch (err) {
    console.error('Upload error', err);
    this.swall.error('Error', 'Excel upload failed');
  } finally {
    this.isUploading = false;
  }
}


}
