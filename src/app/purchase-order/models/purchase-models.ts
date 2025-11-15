export interface PurchaseOrderEntry {
  poid: number;
  companyID: number;
  companyName: string;

  branchID: number;
  branchName: string;

  poNumber: string;
  poDate: string

  supplierID: number;
  supplierName: string;

  statusID: number;
  statusName: string;

  totalAmount: number;
  poRemarks: string;

  productID: number;
  productCode: string;
  productName: string;

  productCategoryId: number;
  productCategoryName: string;

  productSubCategory: number;
  productSubCategoryName: string;

  poRate: number;
  orderedQty: number;
  approvedQty: number;

  expectedDeliveryDate: string; 
  productRemarks: string;

  isActive: boolean;

  createdByUserID: number;
  createdSystemName: string;
  createdAt: string; 
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;

  cancelledDate: string;
  cancelledBy: string;
  cancelReason: string;

  accountingYear: string;
}
