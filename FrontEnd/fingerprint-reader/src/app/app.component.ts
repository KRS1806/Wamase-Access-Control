import { ApplicationConfig, provideZoneChangeDetection, ChangeDetectorRef, Input, Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {FingerprintReader, DeviceConnected, DeviceDisconnected, SampleFormat, AcquisitionStarted, AcquisitionStopped, SamplesAcquired, } from "@digitalpersona/devices"
import { Router, RouterModule } from '@angular/router';

import "./core/modules/WebSDK"

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css'
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'fingerprint-reader';

  private reader: FingerprintReader;

  constructor() {
    this.reader = new FingerprintReader();
  }

  ListaFingerprintReader:any;
  InfoFingerprintReader:any;
  ListaSamplesFingerPrints:any;
  currentImageFinger:any;
  currentImageFingerFixed:any;

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
  private onSamplesAcquired = (event: SamplesAcquired) => {
    console.log("En el evento onSamplesAcquired");
    console.log(event);
    this.ListaSamplesFingerPrints = event;
  }

  ngOnInit(){
    this.reader = new FingerprintReader();
    this.reader.on("DeviceConnected", this.onDeviceConnected);
    this.reader.on("DeviceDisconnected", this.onDevicesDisconnect);
    this.reader.on("AcquisitionStarted", this.onAcquisitionStarted);
    this.reader.on("AcquisitionStopped", this.onAcquisitionStoped);
    this.reader.on("SamplesAcquired", this.onSamplesAcquired);
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

  fn_DeviceInfo(){
    Promise.all([
      this.reader.getDeviceInfo(this.ListaFingerprintReader[0])
    ])
    .then(result => {
      this.InfoFingerprintReader = result[0]
      console.log("Info FingerPrinter")
      console.log(this.InfoFingerprintReader)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  fn_StartCaptureFP(){
    this.reader.startAcquisition(SampleFormat.PngImage, this.InfoFingerprintReader['DevideID'])
    .then((response) => {
      console.log("You can start CAPTURE")
      console.log(response)
    })
    .catch((error) =>{
      console.log(error)
    })
  }

  fn_StopCaptureFP(){
    this.reader.stopAcquisition(this.InfoFingerprintReader['DevideID'])
    .then((response) => {
      console.log("You can stop CAPTURING")
      console.log(response)
    })
    .catch((error) =>{
      console.log(error)
    })
  }

  fn_captureImage(){
    let ListImages = this.ListaSamplesFingerPrints['samples'];
    let size = Object.keys(ListImages).length;
    if (ListImages != null && ListImages != undefined){
      if (size > 0){
        this.currentImageFinger = ListImages[0];
        this.currentImageFingerFixed = this.fn_fixImage(this.currentImageFinger);
      }
    }
  }

  fn_fixImage(prm_imagebase:any){
    let strImage = "";
    strImage = prm_imagebase;
    strImage = strImage.replace(/_/g, "/")
    strImage = strImage.replace(/-/g, "+")
    return strImage;
  }
}
