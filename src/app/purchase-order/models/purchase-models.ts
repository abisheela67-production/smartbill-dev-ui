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

  // Product
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

  // ⭐ ADDED FOR GRN SCREEN
  receivedQty?: number | null;
  acceptedQty?: number | null;
  rejectedQty?: number | null;

  // System fields
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
export interface GRNEntry {

  grnEntryID: number;
  grnNumber: string;
  grnDate: string | Date;

  poid: number;
  poDetailID: number;
  purchaseID: number;

  supplierID: number;
  supplierName: string;

  companyID: number;
  branchID: number;

  invoiceNumber: string;
  invoiceDate: string | Date | null;

  transportName: string;
  vehicleNumber: string;

  receivedBy: string;

  productID: number;
  productCode: string;
  productName: string;

  unitID: number;

  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  orderedQty: number;

  purchaseRate: number;

  taxPercentage: number;
  taxAmount: number;

  totalAmount: number;

  remarks: string;

  isApproved: boolean;
  statusID: number;
  statusName: string;

  approvedBy: number;
  approvedAt: string | Date | null;

  isActive: boolean;

  createdBy: number | string;
  createdAt: string | Date | null;

  updatedBy: number | string;
  updatedAt: string | Date | null;
}
