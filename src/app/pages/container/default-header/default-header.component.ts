import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonserviceService } from '../../../services/commonservice.service';
import { NavItem } from '../nav';
import { SharedModule } from '../../../shared/shared.module';
@Component({
  selector: 'app-default-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.css']
})
export class DefaultHeaderComponent implements OnInit {
  navItems: NavItem[] = [];
  userDropdownOpen = false;

  constructor(
    private router: Router,
    private commonService: CommonserviceService
  ) {}

  ngOnInit() {
    this.loadNavigation();
  }

  private loadNavigation() {
    const userId = Number(localStorage.getItem('userId'));
    const role = localStorage.getItem('role');

    if (!userId && role !== 'admin') return;

    forkJoin({
      permissions: this.commonService.getPermissionsByUser(userId),
      modules: this.commonService.getAllModules(),
    }).subscribe({
      next: ({ permissions, modules }) => {
        const buildNavTree = (allModules: any[], parentId: number | null = null): NavItem[] => {
          return allModules
            .filter(m => m.parentID === parentId)
            .map(m => ({
              label: m.label ?? 'Untitled',
              route: m.route ?? undefined,
              icon: m.icon ?? '',
              expanded: false,
              children: buildNavTree(allModules, m.moduleID),
            }));
        };

        if (role === 'admin') {
          this.navItems = buildNavTree(modules);
        } else if (permissions?.length > 0) {
          const allowedIds = permissions.map((p: any) => p.moduleID);
          const allowedModules = modules.filter((m: any) => allowedIds.includes(m.moduleID));
          this.navItems = buildNavTree(allowedModules);
        }
      },
      error: err => console.error('Navigation load failed:', err)
    });
  }

  /** 🔹 Hover submenu behavior */
  onMouseEnter(item: NavItem) {
    if (item.children?.length) item.expanded = true;
  }

  onMouseLeave(item: NavItem) {
    if (item.children?.length) item.expanded = false;
  }

  /** 🔹 User menu dropdown */
  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.userDropdownOpen = false;
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.userDropdownOpen = false;
  }

  goToSettings() {
    this.router.navigate(['/settings']);
    this.userDropdownOpen = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return !!localStorage.getItem('userId');
  }

  getCurrentUserName() {
    return localStorage.getItem('userName') || 'Guest';
  }

  getCurrentUserRole() {
    return localStorage.getItem('role') || 'User';
  }
}
