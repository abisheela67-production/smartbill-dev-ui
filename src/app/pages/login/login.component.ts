import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CommonserviceService } from '../../services/commonservice.service';
import { User } from '../models/common-models/user';

/* ===============================
   API RESPONSE MODEL
================================ */
interface RegisterResponse {
  success: boolean;
  companyID: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  /* ===============================
     TAB STATE
  ================================ */
  activeTab: 'login' | 'register' = 'login';

  /* ===============================
     FORMS
  ================================ */
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  /* ===============================
     USERS
  ================================ */
  apiUsers: User[] = [];
  isAdmin = false;

  /* ===============================
     UI STATE
  ================================ */
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonserviceService
  ) {}

  /* ===============================
     INIT
  ================================ */
  ngOnInit(): void {
    this.initForms();
    this.loadApiUsers();
  }

  /* ===============================
     FORM INIT
  ================================ */
  private initForms(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      companyName: ['', Validators.required],
      userName: ['', Validators.required],
      passwordHash: ['', Validators.required],
    });
  }

  /* ===============================
     TAB SWITCH
  ================================ */
  switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  /* ===============================
     LOGIN
  ================================ */
  login(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    const { userName, password } = this.loginForm.value;

    /* ========= ADMIN LOGIN ========= */
    if (userName === 'admin' && password === '123') {
      localStorage.setItem('userId', '0');
      localStorage.setItem('userName', 'admin');
      localStorage.setItem('role', 'admin');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }

    /* ========= API USER LOGIN ========= */
    const apiUser = this.apiUsers.find(
      (u) =>
        u.userName === userName &&
        u.passwordHash === password &&
        u.isActive === true
    );

    if (apiUser) {
      localStorage.setItem('userId', apiUser.userID.toString());
      localStorage.setItem('userName', apiUser.userName);
      localStorage.setItem('companyId', apiUser.companyID.toString());
      localStorage.setItem('role', 'client');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }

    /* ========= LOCAL STORAGE LOGIN (DEMO) ========= */
    const localUsers: any[] = JSON.parse(
      localStorage.getItem('users') || '[]'
    );

    const localUser = localUsers.find(
      (u: any) => u.userName === userName && u.password === password
    );

    if (localUser) {
      localStorage.setItem('userId', localUser.userId);
      localStorage.setItem('userName', localUser.userName);
      localStorage.setItem('companyId', localUser.companyId);
      localStorage.setItem('role', 'client');

      this.router.navigate(['/default/master/dashboard']);
      return;
    }

    /* ========= FAIL ========= */
    this.errorMessage = 'Invalid username or password';
  }

  /* ===============================
     LOAD API USERS
  ================================ */
  private loadApiUsers(): void {
    this.commonService.getUsers().subscribe({
      next: (res: User[]) => {
        this.apiUsers = res;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
      },
    });
  }

  /* ===============================
     REGISTER
  ================================ */
  register(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Company name, username and password are required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      companyName: this.registerForm.value.companyName,
      userName: this.registerForm.value.userName,
      passwordHash: this.registerForm.value.passwordHash,

      // optional
      companyEmail: '',
      userEmail: '',
      phone: '',
    };

    this.commonService.register(payload).subscribe({
      next: (res: RegisterResponse) => {
        this.loading = false;

        if (!res.success) {
          this.errorMessage = 'Registration failed';
          return;
        }

        /* ===== SAVE USER LOCALLY (DEMO) ===== */
        const localUsers: any[] = JSON.parse(
          localStorage.getItem('users') || '[]'
        );

        const exists = localUsers.some(
          (u: any) => u.userName === payload.userName
        );

        if (exists) {
          this.errorMessage = 'Username already exists';
          return;
        }

        localUsers.push({
          userId: Date.now().toString(),
          companyId: res.companyID,
          userName: payload.userName,
          password: payload.passwordHash,
        });

        localStorage.setItem('users', JSON.stringify(localUsers));

        alert('Company registered successfully');
        this.registerForm.reset();
        this.switchTab('login');
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Registration failed';
      },
    });
  }
}
