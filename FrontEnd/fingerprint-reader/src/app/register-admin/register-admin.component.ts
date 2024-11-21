import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterAdmin, AuthService } from '../core/services/backend.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register-admin.component.html',
  styleUrl: './register-admin.component.css'
})
export class RegisterAdminComponent {
  message: any;
  messageType: any;

  constructor(private sendAdministrador: RegisterAdmin, 
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      console.log("Esta autenticado");
    } else {
      this.router.navigate(['/login']);
    }
  }

  sendAdmin(name: string, last_name: string, user: string, password: string) {
    this.message = null;
    this.messageType = null;
    this.sendAdministrador.sendAdminData(name, last_name, user, password).subscribe(
      response => {
        this.message = response;
        this.messageType = "success";
      },
      error => {
        console.error(error)
        if (error.status === 404){
          this.message = "Error: " + error.error;
          this.messageType = "error"
        }
      }
    )
  }
  closeAlert() {
    this.message = null;
    this.messageType = null;
}
}
