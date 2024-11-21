import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/backend.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent {
  errorMessage: string | null = null;
  message: any;
  messageType: any;
  title = 'Iniciar sesión';

  constructor(private authService: AuthService, private router: Router) { }

  closeAlert() {
    this.message = null;
    this.messageType = null;
  }

  login(user: string, password: string): void {
    this.authService.login(user, password).subscribe(
      (response) => {
        if (response.token) {
          this.router.navigate(['/admin']);  // Redirige a una ruta protegida después del inicio de sesión
        } else {
          this.message = 'Credenciales incorrectas';
          this.messageType = 'error';
        }
      },
      (error) => {
        this.message = 'Credenciales incorrectas';
        this.messageType = 'error';
        console.log(error);
      }
    );
  }

  logout(): void {
    this.authService.logout().subscribe(
      () => {
        this.message = 'Sesión cerrada correctamente';
        this.messageType = 'success';
        this.router.navigate(['/login']);  // Redirige a la página de login después de cerrar sesión
      },
      error => {
        this.message = 'Ya has cerrado sesión';
        this.messageType = 'error';
        console.log('Error al cerrar sesión', error);
      }
    );
  }
}
