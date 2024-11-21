import { AuthService, GetAllMarks } from '../core/services/backend.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css'
})
export class PanelAdminComponent implements OnInit {
  title = 'Panel de administración';
  message: any;
  messageType: any;
  allInfo: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private workerService: GetAllMarks
  ) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      console.log("Sesion iniciada");
    } else {
      this.message = "Antes de ingresar al panel admin, inicia sesión";
      this.messageType = "error";
      this.router.navigate(['/login']);
    }
  }

  redirectToPDF() {
    this.router.navigate(['/month_report']);
  }
}