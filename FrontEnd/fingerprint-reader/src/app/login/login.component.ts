import { Component, ElementRef, OnInit, ViewChild, ViewChildren, QueryList, HostListener  } from '@angular/core';
import { LoginService } from '../core/services/backend.service';
import { Subscription } from 'rxjs';
import {FingerprintReader, DeviceConnected, DeviceDisconnected, SampleFormat, AcquisitionStarted, AcquisitionStopped, SamplesAcquired, } from "@digitalpersona/devices"
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticateShortcutGuard } from '../guards/authenticate-short-cut.guard';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [CommonModule, FormsModule],
})
export class LoginComponent{
    title = "Marca del trabajador";
    @ViewChildren('in_outinput') in_outinput!: QueryList<ElementRef>;
    user: string | undefined;
    photoBinary: string | undefined;

    private subscription?: Subscription;
    private reader: FingerprintReader;
    constructor(private loginService: LoginService, private router: Router) {
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
    showPhoto: boolean = false;

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
        this.sendUser()
    }

    ngOnInit(){
        this.reader = new FingerprintReader();
        this.reader.on("DeviceConnected", this.onDeviceConnected);
        this.reader.on("DeviceDisconnected", this.onDevicesDisconnect);
        this.reader.on("AcquisitionStarted", this.onAcquisitionStarted);
        this.reader.on("AcquisitionStopped", this.onAcquisitionStoped);
        this.reader.on("SamplesAcquired", this.onSamplesAcquired);
        this.fn_ListDevices();
    }

    ngOnDestroy(){
        this.reader.off("DeviceConnected", this.onDeviceConnected);
        this.reader.off("DeviceDisconnected", this.onDevicesDisconnect);
        this.reader.off("AcquisitionStarted", this.onAcquisitionStarted);
        this.reader.off("AcquisitionStopped", this.onAcquisitionStoped);
        this.reader.off("SamplesAcquired", this.onSamplesAcquired);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
      // Aquí defines la combinación de teclas, por ejemplo: Ctrl + M
        if (event.ctrlKey && event.key === 'm') {
            AuthenticateShortcutGuard.shortcutUsed = true;
            this.router.navigate(['/mark_secundary']);
        }
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

    inOutValue: any;

    setInOutValue(value: string) {
        this.inOutValue = value;
        this.fn_DeviceInfoAndStartCaptureFP(); // Llama a la función para enviar el valor al backend
    }

    
    sendUser(): void {
        this.message = null;
        this.messageType = null;
        this.subscription = this.loginService.loginUser(this.inOutValue, this.fingerprintData).subscribe(
            response => {
                console.log('Respuesta del backend:', response);
                this.messageType = 'success';
                this.message = response.message;
                if (response.photo === null) {
                    this.photoBinary = undefined;
                } else {
                    this.photoBinary = `data:image/png;base64,${response.photo}`;
                    setTimeout(() => {
                        this.photoBinary = undefined;
                        this.message = null;
                        this.messageType = null;
                    }, 6000);
                }
            },
            (error: HttpErrorResponse) => {
                console.error('Respuesta del backend:', error);
                if (error.status === 404) {
                    if (error.error.message === '') {
                        this.messageType = 'error';
                        setTimeout(() => {
                            this.photoBinary = undefined;
                            this.message = null;
                            this.messageType = null;
                        }, 5000);
                    }else{
                        this.message = 'Error: ' + error.error.message;
                        this.messageType = 'error';
                        setTimeout(() => {
                            this.photoBinary = undefined;
                            this.message = null;
                            this.messageType = null;
                        }, 5000);
                    }
                } else {
                    this.message = 'Error al enviar datos al backend';
                    this.messageType = 'error';
                    setTimeout(() => {
                        this.photoBinary = undefined;
                        this.message = null;
                        this.messageType = null;
                    }, 5000);
                }
            }
        );
    }

    closeAlert() {
        this.message = null;
        this.messageType = null;
    }
}
