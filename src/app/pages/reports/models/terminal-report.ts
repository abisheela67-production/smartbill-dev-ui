export interface TerminalReport {
  bills: never[];
  fromDate: string;
  toDate: string;

  companyID: number;
  branchID: number;
  terminalUser: string;

  totalBills: number;
  totalQuantity: number;

  grossSales: number;
  discountAmount: number;
  taxableAmount: number;

  cgst: number;
  sgst: number;
  igst: number;
  cess: number;

  totalGST: number;
  netSales: number;

  cashTotal: number;
  cardTotal: number;
  upiTotal: number;
  advanceTotal: number;
  totalPaid: number;
  balanceAmount: number;

  cancelledBills: number;
  cancelledAmount: number;
}
