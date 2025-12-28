import { NgModule } from '@angular/core';
import {
  LucideAngularModule,
  // ===== CORE / COMMON =====
  Settings,
  Search,
  Download,
  Plus,
  Save,
  ChevronDown,
  X,

  // ===== USER / AUTH =====
  User,
  Users,
  UserRound,
  IdCard,
  ShieldCheck,
  LockKeyhole,

  // ===== BUSINESS / COMPANY =====
  Building2,
  Landmark,
  Briefcase,

  // ===== INVENTORY / PRODUCT =====
  Package,
  Box,
  Tag,
  Truck,
  ShoppingCart,

  // ===== LAYOUT =====
  Grid,
  LayoutGrid,
  Hash,

  // ===== FINANCE / TAX =====
  DollarSign,
  Percent,
  Calculator,
  IndianRupee,
  Wallet,
  CreditCard,

  // ===== FILE / EXPORT =====
  FilePlus,
  FileX,
  FilePlus2,
  FileX2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Receipt,
  BarChart,
  BarChart2,
  AlertCircle,
  AlertTriangle,
  Menu,
        


  // ===== DASHBOARD / CHARTS =====
  Calendar,
  PieChart,
  TrendingUp,
  ArrowRightLeft,
  RefreshCw,

  // ===== MEASUREMENT =====
  Ruler,
  Droplet
} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({

      // CORE
      Settings,
      Search,
      Download,
      Plus,
      Save,
      ChevronDown,
      X,

      // USER / AUTH
      User,
      Users,
      UserRound,
      IdCard,
      ShieldCheck,
      LockKeyhole,

      // BUSINESS
      Building2,
      Landmark,
      Briefcase,

      // INVENTORY
      Package,
      Box,
      Tag,
      Truck,
      ShoppingCart,

      // LAYOUT
      Grid,
      LayoutGrid,
      Hash,

      // FINANCE / TERMINAL DASHBOARD
      DollarSign,
      Percent,
      Calculator,
      IndianRupee,
      Wallet,
      CreditCard,
      Receipt,

      // FILE / EXPORT
      FilePlus,
      FileX,
      FilePlus2,
      FileX2,
      FileSpreadsheet,
      FileCode,
      FileText,

      // DASHBOARD / CHARTS
      Calendar,
      PieChart,
      TrendingUp,
      ArrowRightLeft,
      RefreshCw,
      AlertTriangle,

      // MEASUREMENT
      Ruler,
      Droplet,
      BarChart,
      BarChart2,
      AlertCircle,
      Menu,
    })
  ],
  exports: [LucideAngularModule]
})
export class IconsModule {}
