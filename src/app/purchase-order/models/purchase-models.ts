export interface PurchaseOrderEntry {
  sno: number;

  poid: number | null;

  companyID: number | null;
  companyName: string | null;

  branchID: number | null;
  branchName: string | null;

  poNumber: string | null;

  poDate: string | Date | null;
  expectedDeliveryDate: string | Date | null;

  supplierID: number | null;
  supplierName: string | null;

  statusID: number | null;
  statusName: string | null;

  totalAmount: number | null;
  poRemarks: string | null;

  productID: number | null;
  productCode: string | null;
  productName: string | null;

  productCategoryId: number | null;
  productCategoryName: string | null;

  productSubCategory: number | null;
  productSubCategoryName: string | null;

  poRate: number | null;
  orderedQty: number | null;
  approvedQty: number | null;

  productRemarks: string | null;

  isActive: boolean;

  createdByUserID: number | null;
  createdSystemName: string | null;
  createdAt: Date | null;

  updatedByUserID: number | null;
  updatedSystemName: string | null;
  updatedAt: Date | null;

  cancelledDate: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;

  accountingYear: string | null;
}
