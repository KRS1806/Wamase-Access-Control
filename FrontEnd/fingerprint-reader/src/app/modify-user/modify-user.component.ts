import { Component } from '@angular/core';
import { SharedDataService, AuthService, sendInfoModifyPOST } from '../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {FingerprintReader, DeviceConnected, DeviceDisconnected, SampleFormat, AcquisitionStarted, AcquisitionStopped, SamplesAcquired, } from "@digitalpersona/devices"

@Component({
    selector: 'app-modify-user',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './modify-user.component.html',
    styleUrl: './modify-user.component.css'
})
export class ModifyUserComponent {
    private reader: FingerprintReader;
    constructor(private infoModify: sendInfoModifyPOST, private authService: AuthService, private router: Router, private sharedData: SharedDataService) {
        this.reader = new FingerprintReader();
    }

    ListaFingerprintReader:any;
    InfoFingerprintReader:any;
    ListaSamplesFingerPrints:any;
    currentImageFinger:any;
    currentImageFingerFixed:any;
    fingerprintData:any;
    message:any;
    messageType:any;
    isButtonDisabled: boolean | undefined;
    data:any;
    photoPreviewUrl: any | string = 'https://cdn-icons-png.flaticon.com/512/1177/1177577.png';
    photoSelected: any;

    private onDeviceConnected = (event: DeviceConnected) => { }
    private onDevicesDisconnect = (event: DeviceDisconnected) => { }

    private onAcquisitionStarted = (event: AcquisitionStarted) => {
        console.log("En el evento onAcquisitionStarted")
        console.log(event)
    }
    private onAcquisitionStoped = (event: AcquisitionStopped) => {
        console.log("En el evento onAcquisitionStoped")
        console.log(event)
    }

    private onSamplesAcquired = async (event: SamplesAcquired) => {
        console.log("En el evento onSamplesAcquired");
        console.log(event);
        this.ListaSamplesFingerPrints = event;
        this.ListaSamplesFingerPrints = event;
        if (Array.isArray(event.samples)) {
            const fixedImages = event.samples.map(sample => this.fn_fixImage(sample));
            this.fingerprintData = fixedImages.join('');
        } else {
            console.error("No se obtuvieron muestras en el evento.");
        }
    }

    ngOnInit(){
        if (this.authService.isAuthenticated()) {
            this.reader = new FingerprintReader();
            this.reader.on("DeviceConnected", this.onDeviceConnected);
            this.reader.on("DeviceDisconnected", this.onDevicesDisconnect);
            this.reader.on("AcquisitionStarted", this.onAcquisitionStarted);
            this.reader.on("AcquisitionStopped", this.onAcquisitionStoped);
            this.reader.on("SamplesAcquired", this.onSamplesAcquired);
            this.fn_ListDevices();
            this.data = this.sharedData.getUserData();
            this.onFileCharged(this.data.photo);
        }
        else{
            this.router.navigate(['/login']);
        }
    }

    ngOnDestroy(){
        this.reader.off("DeviceConnected", this.onDeviceConnected);
        this.reader.off("DeviceDisconnected", this.onDevicesDisconnect);
        this.reader.off("AcquisitionStarted", this.onAcquisitionStarted);
        this.reader.off("AcquisitionStopped", this.onAcquisitionStoped);
        this.reader.off("SamplesAcquired", this.onSamplesAcquired);
    }

    fn_ListDevices(){
        Promise.all([
        this.reader.enumerateDevices()
        ])
        .then(results => {
        this.ListaFingerprintReader = results[0];
        console.log("Datos del dispositivo");
        console.log(this.ListaFingerprintReader);
        })
        .catch((error) => {
        console.log(error);
        })
    }

    fn_DeviceInfoAndStartCaptureFP() {
        this.reader.enumerateDevices()
        .then(devices => {
            this.ListaFingerprintReader = devices;
            this.isButtonDisabled = true;
            console.log("Dispositivos enumerados:");
            console.log(this.ListaFingerprintReader);
    
            if (this.ListaFingerprintReader.length > 0) {
                return this.reader.getDeviceInfo(this.ListaFingerprintReader[0]);
            } else {
                throw new Error('No se encontraron dispositivos.');
            }
        })
        .then(deviceInfo => {
            this.InfoFingerprintReader = deviceInfo;
            console.log("Información del dispositivo:");
            console.log(this.InfoFingerprintReader);
    
            return this.reader.startAcquisition(SampleFormat.PngImage, this.InfoFingerprintReader['DevideID']);
        })
        .then(response => {
            console.log("Captura iniciada exitosamente:");
            console.log(response);

            setTimeout(() => {
                this.fn_StopCaptureFP()
            }, 3000);
        })
        .catch(error => {
            console.error("Error durante la inicialización:", error);
        });
    }

    fn_StopCaptureFP(){
        this.reader.stopAcquisition(this.InfoFingerprintReader['DevideID'])
        .then((response) => {
        console.log("You can stop CAPTURING")
        console.log(response)
        this.isButtonDisabled = false;
        })
        .catch((error) =>{
        console.log(error)
        })
    }

    fn_fixImage(prm_imagebase: any): string {
        let strImage = prm_imagebase.replace(/_/g, "/").replace(/-/g, "+");
        
        // Asegurar que la longitud de la cadena sea múltiplo de 4
        switch (strImage.length % 4) {
            case 2:
                strImage += "==";
                break;
            case 3:
                strImage += "=";
                break;
        }
    
        return strImage;
    }

    onFileCharged(imageBase64: string) {
        // Verificar si hay un prefijo base64 y eliminarlo si existe
        const base64String = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    
        // Intentar convertir la cadena base64 en un Blob
        try {
            const contentType = 'image/png'; // Cambia esto al tipo correcto si no es PNG
            const blob = this.base64ToBlob(base64String, contentType);
    
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photoPreviewUrl = e.target.result; // Asignar la URL generada por FileReader
            };
            reader.readAsDataURL(blob); // Leer el Blob como una URL de datos
        } catch (error) {
            console.error('Error al decodificar base64:', error);
        }
    }
    
    base64ToBlob(base64: string, contentType: string = '', sliceSize: number = 512): Blob {
        const byteCharacters = atob(base64);
        const byteArrays = [];
    
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
    
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
    
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
    
        return new Blob(byteArrays, { type: contentType });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            this.photoSelected = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photoPreviewUrl = e.target.result;
            };
            reader.readAsDataURL(this.photoSelected);
        }
    }

    closeAlert() {
        this.message = null;
        this.messageType = null;
    }

    formatTime(time: string): string {
        const [hour, minute] = time.split(':').map(part => part.padStart(2, '0'));
        return `${hour}:${minute}`;
    }

    sendWorker(name: string, last_name: string, user: string, departament: string, salary: number, extras: number, hourIn: string, hourOut: string) {
        this.message = null;
        this.messageType = null;
        const formattedHourIn = this.formatTime(hourIn);
        const formattedHourOut = this.formatTime(hourOut);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('last_name', last_name);
        formData.append('user', user);
        formData.append('departament', departament);
        formData.append('salary', salary.toString());
        formData.append('extras', extras.toString());
        formData.append('hourIn', formattedHourIn);
        formData.append('hourOut', formattedHourOut);
        formData.append('fingerprint_data', this.fingerprintData);
    
        // Solo agregar si se seleccionó una nueva foto
        if (this.photoSelected) {
            formData.append('photo', this.photoSelected, this.photoSelected.name);
        }
    
        this.infoModify.sendInfoModify(formData).subscribe(
            response => {
                console.log('Respuesta del backend:', response);
                this.message = 'Modificación exitosa: ' + response.message;
                this.messageType = 'success';
                this.router.navigate(['/get-marks']);
            },
            (error: HttpErrorResponse) => {
                console.error('Respuesta del backend:', error);
                if (error.status === 404) {
                    this.message = 'Error: ' + error.error.message;
                    this.messageType = 'error';
                    console.log(this.message + this.messageType);
                } else {
                    this.message = 'Error al enviar datos al backend';
                    this.messageType = 'error';
                }
            }
        );
    }
}
