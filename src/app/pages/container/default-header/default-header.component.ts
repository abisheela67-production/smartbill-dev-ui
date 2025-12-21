import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CommonserviceService } from '../../../services/commonservice.service';
import { NavItem } from '../nav';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-default-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.css'],
})
export class DefaultHeaderComponent implements OnInit {
  navItems: NavItem[] = [];
  userDropdownOpen = false;

  /** 🔑 prevents auto hover open after login */
  private allowHover = false;

  constructor(
    private router: Router,
    private commonService: CommonserviceService
  ) {}

  /* =====================================================
     INIT
  ===================================================== */
  ngOnInit(): void {
    this.loadNavigation();

    /* ❌ DO NOT auto expand menu on dashboard load */
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeAllMenus();
      });
  }

  /* =====================================================
     LOAD NAVIGATION
  ===================================================== */
  private loadNavigation(): void {
    const userId = Number(localStorage.getItem('userId'));
    const role = localStorage.getItem('role');

    if (!userId && role !== 'admin') return;

    forkJoin({
      permissions: this.commonService.getPermissionsByUser(userId),
      modules: this.commonService.getAllModules(),
    }).subscribe({
      next: ({ permissions, modules }) => {
        const buildNavTree = (
          allModules: any[],
          parentId: number | null = null
        ): NavItem[] => {
          return allModules
            .filter((m) => m.parentID === parentId)
            .map((m) => ({
              label: m.label ?? 'Untitled',
              route: m.route ?? undefined,
              icon: m.icon ?? '',
              expanded: false, // 🔥 IMPORTANT
              children: buildNavTree(allModules, m.moduleID),
            }));
        };

        if (role === 'admin') {
          this.navItems = buildNavTree(modules);
        } else if (permissions?.length) {
          const allowedIds = permissions.map((p: any) => p.moduleID);
          const allowedModules = modules.filter((m: any) =>
            allowedIds.includes(m.moduleID)
          );
          this.navItems = buildNavTree(allowedModules);
        }

        this.closeAllMenus();
      },
      error: (err) => console.error('Navigation load failed:', err),
    });
  }

  /* =====================================================
     MENU CLICK (PARENT)
  ===================================================== */
  onMenuClick(item: NavItem, event: Event): void {
    event.preventDefault();
    this.allowHover = true; // 🔓 enable hover after user action

    if (!item.children?.length) return;

    this.navItems.forEach((i) => {
      if (i !== item) i.expanded = false;
    });

    item.expanded = !item.expanded;
  }

  /* =====================================================
     HOVER CONTROL
  ===================================================== */
  onMenuEnter(item: NavItem): void {
    if (!this.allowHover) return;

    this.navItems.forEach((i) => {
      if (i !== item) i.expanded = false;
    });

    item.expanded = true;
  }

  onMenuLeave(item: NavItem): void {
    if (!this.allowHover) return;
    item.expanded = false;
  }

  /* =====================================================
     GLOBAL CLICK → ENABLE HOVER
  ===================================================== */
  @HostListener('document:click')
  enableHover(): void {
    this.allowHover = true;
  }

  /* =====================================================
     UTIL
  ===================================================== */
  private closeAllMenus(): void {
    this.navItems.forEach((item) => (item.expanded = false));
  }

  /* =====================================================
     USER DROPDOWN
  ===================================================== */
  toggleUserDropdown(event: Event): void {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.userDropdownOpen = false;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.userDropdownOpen = false;
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
    this.userDropdownOpen = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /* =====================================================
     AUTH HELPERS
  ===================================================== */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('userId');
  }

  getCurrentUserName(): string {
    return localStorage.getItem('userName') || 'Guest';
  }

  getCurrentUserRole(): string {
    return localStorage.getItem('role') || 'User';
  }
}
