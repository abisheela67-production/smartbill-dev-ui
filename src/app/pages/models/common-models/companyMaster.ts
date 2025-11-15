export interface Company {
  companyID: number;
  companyCode: string;
  companyName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  companyLogo: number[] | null; // ✅ changed from string
  companyImage: number[] | null; // ✅ changed from string
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  updatedByUserID?: number;
  updatedSystemName?: string;
}
export interface Branch {
  branchID: number;
  companyID: number;
  branchCode: string;
  branchName: string;
  address: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Department {
  departmentID: number;
  branchID: number;
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}
export interface Role {
  roleID: number;
  roleCode: string;
  roleName: string;
  isActive: boolean;
  createdByUserID: number;
  createdSystemName: string;
  createdAt: string;
  updatedByUserID: number;
  updatedSystemName: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
}