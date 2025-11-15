import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login';
import { DefaultLayoutComponent } from './pages/container/default-layout/default-layout.component';
import { CompanyMasterComponent } from './pages/common-master/company-master';
import { BranchMasterComponent } from './pages/common-master/branch-master/branch-master.component';
import { DepartmentMasterComponent } from './pages/common-master/department-master';
import { RoleMasterComponent } from './pages/common-master/role-master';
import { UsermasterComponent } from './authentication/usermaster/usermaster.component';
import { AuthenticationComponent } from './pages/authentication/authentication.component';
import { BrandComponent } from './pages/master/brand/brand.component';
import { CategoryComponent } from './pages/master/category/category.component';
import { CustomerComponent } from './pages/master/customer/customer.component';
import { HsnCodeComponent } from './pages/master/hsn-code/hsn-code.component';
import { ProductComponent } from './pages/master/product/product.component';
import { ServiceMasterComponent } from './pages/master/service-master/service-master.component';
import { SubCategoryComponent } from './pages/master/sub-category/sub-category.component';
import { SupplierComponent } from './pages/master/supplier/supplier.component';
import { TaxComponent } from './pages/master/tax/tax.component';
import { UnitComponent } from './pages/master/unit/unit.component';
import { MasterDashboardComponent } from './pages/master/master-dashboard/master-dashboard.component';
import { CessComponent } from './pages/master/cess/cess.component';
import { PurchaseEntryComponent } from './pages/purchase/purchase-entry/purchase-entry.component';
import { PurchaseViewComponent } from './pages/purchase/purchase-view/purchase-view.component';
import { PurchaseCancelComponent } from './pages/purchase/purchase-cancel/purchase-cancel.component';
import { SalesEntryComponent } from './pages/sales/sales-entry/sales-entry.component';
import { SalesViewComponent } from './pages/sales/sales-view/sales-view.component';
import { SalesEditComponent } from './pages/sales/sales-edit/sales-edit.component';
import { PurchsaeOrderEntryComponent } from './purchase-order/purchsae-order-entry/purchsae-order-entry.component';
import { PurchsaeOrderViewComponent } from './purchase-order/purchsae-order-view/purchsae-order-view.component';
import { GrnMasterComponent } from './purchase-order/grn-master/grn-master.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'default',
    component: DefaultLayoutComponent,
    children: [
      { path: 'master/company', component: CompanyMasterComponent },
      { path: 'master/branch', component: BranchMasterComponent },
      { path: 'master/department', component: DepartmentMasterComponent },
      { path: 'master/role', component: RoleMasterComponent },
      { path: 'master/user', component: UsermasterComponent },
      { path: '', redirectTo: 'master/company', pathMatch: 'full' },
    ],
  },
  {
    path: 'user',
    component: DefaultLayoutComponent,
    children: [
      { path: 'master/accesscontrol', component: AuthenticationComponent },
      { path: '', redirectTo: 'master/accesscontrol', pathMatch: 'full' },
    ],
  },

  {
    path: 'CommonProduct',
    component: DefaultLayoutComponent,
    children: [
      { path: 'brand', component: BrandComponent },
      { path: 'category', component: CategoryComponent },
      { path: 'cess', component: CessComponent },
      { path: 'customer', component: CustomerComponent },
      { path: 'hsnCode', component: HsnCodeComponent },
      { path: 'Product', component: ProductComponent },
      { path: 'ServiceMaster', component: ServiceMasterComponent },
      { path: 'subCategory', component: SubCategoryComponent },
      { path: 'supplier', component: SupplierComponent },
      { path: 'taxmaster', component: TaxComponent },
      { path: 'unit', component: UnitComponent },
      { path: '', redirectTo: 'brand', pathMatch: 'full' },
    ],
  },

  {
    path: 'Purchase',
    component: DefaultLayoutComponent,
    children: [
      { path: 'PurchaseEntry', component: PurchaseEntryComponent },
      { path: 'PurchaseView', component: PurchaseViewComponent },
      { path: 'PurchaseCancel', component: PurchaseCancelComponent },
      { path: 'PurchaseOrderEntry', component: PurchsaeOrderEntryComponent },
      { path: 'PurchaseOrderView', component: PurchsaeOrderViewComponent },
      { path: 'PurchaseOrderCancel', component: PurchaseCancelComponent },
      { path: 'GRNEntry', component: GrnMasterComponent },



      { path: '', redirectTo: 'PurchaseEntry', pathMatch: 'full' },
    ],
  },

  {
    path: 'Sales',
    component: DefaultLayoutComponent,
    children: [
      { path: 'SalesEntry', component: SalesEntryComponent },
      { path: 'SalesView', component: SalesViewComponent },
      { path: 'SalesCancel', component: SalesEditComponent },
      { path: '', redirectTo: 'SalesEntry', pathMatch: 'full' },
    ],
  },
];
