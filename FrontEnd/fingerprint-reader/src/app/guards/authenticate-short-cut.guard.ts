import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticateShortcutGuard implements CanActivate {

  static shortcutUsed = false;

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (AuthenticateShortcutGuard.shortcutUsed) {
      AuthenticateShortcutGuard.shortcutUsed = false; // Resetea el estado
      return true;
    } else {
      // Redirige a una página de error o a la página principal si no se usó el atajo
      this.router.navigate(['/']);
      return false;
    }
  }
}
