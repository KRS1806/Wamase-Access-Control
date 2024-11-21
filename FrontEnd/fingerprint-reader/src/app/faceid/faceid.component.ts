import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkFaceID } from '../core/services/backend.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './faceid.component.html',
  styleUrls: ['./faceid.component.css'],
  imports: [CommonModule, FormsModule],
})
export class FaceidComponent implements OnInit {

  photoPreviewUrl: string | undefined;
  photoSelected: any;
  identification: string = '';
  message: string | any;
  messageType: 'success' | 'error' | any;
  isButtonDisabled = false;
  inOutValue: string = '';

  private canvasElement!: HTMLCanvasElement;
  private videoElement!: HTMLVideoElement;

  constructor(private faceid: MarkFaceID, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initCamera();
  }

  setInOutValue(value: string) {
    this.inOutValue = value;
    this.capturePhoto(); // Captura la foto y ejecuta el envío de inmediato
  }


  capturePhoto() {
    const video = this.videoElement;
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = video.videoWidth;
    this.canvasElement.height = video.videoHeight;
    const context = this.canvasElement.getContext('2d');

    if (context) {
      context.drawImage(video, 0, 0, this.canvasElement.width, this.canvasElement.height);
      this.canvasElement.toBlob((blob) => {
        if (blob) {
          this.photoSelected = blob;
          const reader = new FileReader();
          reader.onloadend = () => {
            this.photoPreviewUrl = reader.result as string;
            this.sendImageToService(); // Llama al servicio de inmediato tras capturar la imagen
          };
          reader.readAsDataURL(blob);
        }
      }, 'image/png');
    }
  }


  // Manda la foto al backend
  sendImageToService() {
    if (!this.photoSelected) {
      console.error("No image data found. Please capture an image first.");
      return;
    }

    const formData = new FormData();
    formData.append('face_photo', this.photoSelected);

    formData.append('in_out', this.inOutValue);

    this.faceid.markfaceid(formData).subscribe(
      (response) => {
        this.messageType = 'success';
        this.message = response.message;
        console.log('Respuesta del backend:', response);
        this.cdr.detectChanges();
      },
      (error: HttpErrorResponse) => {
        console.error('Respuesta del backend:', error);
        this.message = 'Error: ' + error.error.message 
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    );
  }

  initCamera() {
    this.videoElement = document.querySelector('video')!;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoElement.srcObject = stream;
        this.videoElement.play();
      })
      .catch((err) => {
        console.error("Error al acceder a la cámara: ", err);
      });
  }

  closeAlert() {
    this.message = undefined;
    this.messageType = undefined;
  }
}
