import { NgModule } from '@angular/core';
import {
  LucideAngularModule,
  Settings, Building2, Landmark, Users, IdCard, User,
  ShieldCheck, LockKeyhole,
  Package, Tag, Grid, UserRound, Hash, Box, Briefcase,
  LayoutGrid, Truck, Percent, Ruler, Droplet,
  ShoppingCart, FilePlus, FileText, FileX,
  DollarSign, FilePlus2, FileX2,ChevronDown,Search
} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({
      Settings, Building2, Landmark, Users, IdCard, User,
      ShieldCheck, LockKeyhole,
      Package, Tag, Grid, UserRound, Hash, Box, Briefcase,
      LayoutGrid, Truck, Percent, Ruler, Droplet,
      ShoppingCart, FilePlus, FileText, FileX,
      DollarSign, FilePlus2, FileX2,ChevronDown,Search
    }),
  ],
  exports: [LucideAngularModule],
})
export class IconsModule {}
