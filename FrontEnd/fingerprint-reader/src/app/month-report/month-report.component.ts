import { AuthService, GetAllMarks } from '../core/services/backend.service';
import { Component, OnInit, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Importa FormsModule
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-month-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './month-report.component.html',
  styleUrl: './month-report.component.css'
})
export class MonthReportComponent implements OnInit {
  allInfo: any[] = [];
  messageType: string | null = null;
  message: string | null = null;
  reportSelected: string = '15';
  monthSelected: string = '0';

  constructor(
    private workerService: GetAllMarks,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      console.log('Sesión iniciada');
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchWorkerData(): void {
    this.workerService.getAllMarks(this.monthSelected, this.reportSelected).subscribe(
      data => {
        if (data.messagetype === 'error') {
          this.messageType = 'error';
          this.message = data.message;
          return;
        }
        this.allInfo = data; // Asumiendo que data es un array de trabajadores
        this.generatePDF();
      },
      error => {
        console.error('Error: ', error);
      }
    );
  }

  closeAlert(): void {
    this.message = null;
    this.messageType = null;
  }

  generatePDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(12);
    let currentY = 30;

    // Añadir el logo en la esquina superior derecha
    const img = new Image();
    img.src = 'data:image/png;base64,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'; // Reemplaza con la ruta del logo o la URL
    img.onload = () => {
      doc.addImage(img, 'PNG', doc.internal.pageSize.getWidth() - 40, 10, 30, 30); // Ajusta las dimensiones según sea necesario

      // Definir el encabezado de la tabla
      const head = [['Trabajador', 'Mes/Año', 'Departamento', 'Horas Trabajadas', 'Horas Extra', 'Salario Total', 'Tardías']];
      const data: any[] = [];

      // Recorrer la información de los trabajadores
      this.allInfo.forEach(worker => {
        worker.marks.forEach((mark: { year_month: string | number | Date; total_hours: number; total_extra_hours: number; net_salary: number; total_salary: number; total_in_late: string; }) => {
          data.push([
            worker.name + ' ' + worker.last_name,
            mark.year_month, // Corrección del mes
            worker.departament,
            worker.total_hours,
            worker.total_extra_hours,
            worker.salary,
            mark.total_in_late
          ]);
        });
      });

      // Centrar el título del reporte
      const pageWidth = doc.internal.pageSize.getWidth(); // Ancho de la página
      const text = 'Reporte Mensual de los trabajadores';
      const textWidth = doc.getStringUnitWidth(text) * doc.getFontSize() / doc.internal.scaleFactor; // Ancho del texto
      const textOffset = (pageWidth - textWidth) / 2; // Cálculo para centrar el texto
      doc.text(text, textOffset, currentY);
      currentY += 20;

      // Añadir la tabla usando autoTable y centrarla
      autoTable(doc, {
        startY: currentY,
        head: head,
        body: data,
        styles: {
          halign: 'center' // Centrar contenido de la tabla
        },
        margin: { top: 10 },
        tableWidth: 'wrap' // Ajusta el ancho de la tabla al contenido
      });

      // Guardar el archivo PDF
      doc.save('Reporte_Mensual.pdf');
    };
  }
}
