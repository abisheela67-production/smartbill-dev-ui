import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  get userId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? +id : null;
  }

  get userName(): string | null {
    return localStorage.getItem('userName');
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }

  get companyId(): number | null {
    const id = localStorage.getItem('companyId');
    return id ? +id : null;
  }

  logout(): void {
    localStorage.clear();
  }
}
