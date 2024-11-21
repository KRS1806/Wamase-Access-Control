import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MarkRegister } from '../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticateShortcutGuard } from '../guards/authenticate-short-cut.guard';

@Component({
  selector: 'app-mark-secondary',
  standalone: true,
  templateUrl: './mark-secondary.component.html',
  styleUrls: ['./mark-secondary.component.css'],
  imports: [CommonModule, FormsModule],
})
export class MarkSecondaryComponent implements OnInit {

  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  photoBinary: string | undefined;
  inOutValue: string = 'Entrada';

  // Nueva propiedad para almacenar la imagen original
  private originalPhotoBinary: string | undefined;

  // Referencia al campo de entrada (input)
  @ViewChild('userInput') userInput!: ElementRef;

  constructor(
    private router: Router, 
    private markService: MarkRegister
  ) {}

  ngOnInit(): void {
    if (!AuthenticateShortcutGuard.shortcutUsed) {
      this.router.navigate(['/mark']);
    }
  }

  closeAlert(): void {
    this.message = null;
    this.messageType = null;
  }

  sendUser(user: string, inOut: string): void {
    this.closeAlert(); // Limpiar mensajes anteriores

    if (!user) {
      this.message = 'Por favor ingrese el número de cédula.';
      this.messageType = 'error';
      this.hideErrorAfterTimeout(); // Ocultar el mensaje de error después de 10 segundos
      return;
    }

    // Almacenar la imagen original
    this.originalPhotoBinary = this.photoBinary;

    const formData = new FormData();
    formData.append('user', user);
    formData.append('in_out', inOut);

    this.markService.sendMark(formData).subscribe(
      (response) => {
        this.messageType = 'success';

        if (response.photo) {
          this.photoBinary = `data:image/png;base64,${response.photo}`;
          setTimeout(() => {
            // Restaurar la imagen original, eliminar el shadow y limpiar el input después de 5 segundos
            this.photoBinary = this.originalPhotoBinary;
            this.messageType = null; 
            this.userInput.nativeElement.value = ''; 
          }, 5000); // 5 segundos
        } else {
          this.photoBinary = undefined;
        }
      },
      (error) => {
        this.message = `${error.error.message || 'Error al registrar la marca'}`;
        this.messageType = 'error';
        this.hideErrorAfterTimeout(); 
      }
    );
  }

  private hideErrorAfterTimeout(): void {
    setTimeout(() => {
      this.message = null; // Eliminar el mensaje de error
      this.messageType = null; // Eliminar el tipo de mensaje
    }, 5000); 
  }
}
