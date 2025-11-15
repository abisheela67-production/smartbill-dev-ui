import { Component } from '@angular/core';
import { Colors } from '../color';
import { User } from '../models/common-models/user';
import {
  FormBuilder,
  FormGroup,  
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { userInfo } from 'node:os';
import { CommonserviceService } from '../../services/commonservice.service';
import { SweetAlertService } from '../../services/properties/sweet-alert.service';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  colors = Colors;
  loginForm: FormGroup;
  errorMessage: string = '';
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private commonService: CommonserviceService,
      private sweetAlert: SweetAlertService 
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.loadUsers();
  }

  loadUsers() {
    this.commonService.getUsers().subscribe({
      next: (res) => (this.users = res),
      error: (err) => {
        console.error('Error loading users:', err);
        alert('Error loading user list.');
      },
    });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      if (username === 'admin' && password === '123') {
        localStorage.setItem('userId', '0'); 
        localStorage.setItem('userName', 'admin');
        localStorage.setItem('role', 'admin'); 
        alert(`Login successful 🎉 Welcome admin`);
        this.router.navigate(['/default']);
        return;
      }

      const matchedUser = this.users.find(
        (u) => u.userName === username && u.passwordHash === password
      );

      if (matchedUser) {
        localStorage.setItem('userId', matchedUser.userID.toString());
        localStorage.setItem('userName', matchedUser.userName);
        localStorage.setItem('role', 'client');
          localStorage.setItem('companyId', matchedUser.companyID.toString()); 
        alert(`Login successful  Welcome ${matchedUser.userName}`);
        this.router.navigate(['/default']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    } else {
      this.errorMessage = 'Please fill in all fields';
    }
  }
}
