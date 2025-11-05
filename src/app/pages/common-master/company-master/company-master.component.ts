import { Component,ViewChild } from '@angular/core';
import { Company } from '../../models/common-models/companyMaster'
import { CommonserviceService } from '../../../services/commonservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FocusOnKeyDirective } from '../../../directives/focus-on-key.directive';
import { InputRestrictDirective } from '../../../directives/input-restrict.directive';
import { SweetAlertService } from '../../../services/properties/sweet-alert.service';
import { InputDataGridComponent } from '../../components/input-data-grid/input-data-grid.component';
import { group } from 'console';
import { GroupBoxComponent } from '../../../shared/group-box/group-box.component';

InputDataGridComponent
@Component({
  selector: 'app-company-master',
  imports: [
    CommonModule,
    FormsModule,
    FocusOnKeyDirective,
    InputRestrictDirective,
    GroupBoxComponent   
  ],
  templateUrl: './company-master.component.html',
  styleUrls: ['./company-master.component.css']
})
export class CompanyMasterComponent {
  selectedLogoFile: File | null = null;
  selectedImageFile: File | null = null;
  @ViewChild(GroupBoxComponent) groupBox!: GroupBoxComponent;
  companies: Company[] = [];
  company: Company = {} as Company;
  constructor(private commonservice: CommonserviceService,
    private swallservice:SweetAlertService
  ) { }
  ngOnInit(): void {
    this.resetForm();
    this.loadCompanies();
  } 

  async saveOrDeleteCompany() {
  if (!this.company.companyName) {
    this.swallservice.error("Validation Error", "Company Name is required!");
    return;
  }

  if (this.selectedLogoFile) {
    this.company.companyLogo = await this.fileToByteArray(this.selectedLogoFile);
  }
  if (this.selectedImageFile) {
    this.company.companyImage = await this.fileToByteArray(this.selectedImageFile);
  }

  this.commonservice.saveCompany(this.company).subscribe({
    next: (response: any) => {
      if (response) {
        this.swallservice.success(
          "Success",
          this.company.companyID > 0 ? "Company updated!" : "Company created!"
        );
        this.loadCompanies();
        this.resetForm();
        this.selectedLogoFile = null;
        this.selectedImageFile = null;
      } else {
        this.swallservice.error("Error", "No response from server!");
      }
    },
    error: (err) => {
      console.error("Error saving company:", err);
      this.swallservice.error("Error", "Unable to save company!");
    }
  });
}

  editCompany(c: Company) {
    this.company = { ...c }; // populate form for editing
  }

  deleteCompany(c: Company) {
    if (!confirm(`Are you sure you want to delete ${c.companyName}?`)) {
      return;
    }

    c.isActive = false; // soft delete
    this.commonservice.saveCompany(c).subscribe({
      next: id => {
        console.log('Company deleted (soft delete), ID:', id);
        this.swallservice.success("Success", "Company deleted successfully!");
        this.loadCompanies();
      },
      error: err => {
        console.error(' Error deleting company:', err);
        this.swallservice.error("Error", "Error deleting company.");
      }
    });
  }

  loadCompanies() {
    this.commonservice.getCompanies().subscribe({
      next: res => this.companies = res,
      error: err => console.error(err)
    });
  }
  resetForm() {
    this.company = {
      companyID: 0,
      companyCode: '',
      companyName: '',
      phone: '',
      alternatePhone: '',
      email: '',
      website: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      addressLine4: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      gstNumber: '',
      panNumber: '',
      cinNumber: '',
      bankName: '',
      bankAccountNumber: '',
      ifscCode: '',
      companyLogo: null,
      companyImage: null,
      isActive: true,
      createdByUserID: this.commonservice.getCurrentUserId(),
      createdSystemName: 'AngularApp'
    };
  }
  onFileSelected(event: any, type: 'logo' | 'image') {
    const file: File = event.target.files[0];
    if (file) {
      if (type === 'logo') this.selectedLogoFile = file;
      else this.selectedImageFile = file;
    }
  }
private fileToByteArray(file: File): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result.split(',')[1]; // remove data:image/...;base64,
      const byteArray = Array.from(atob(base64), c => c.charCodeAt(0));
      resolve(byteArray);
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}


}
