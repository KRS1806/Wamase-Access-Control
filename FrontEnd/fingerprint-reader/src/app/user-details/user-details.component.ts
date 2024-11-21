import { Component, OnInit } from '@angular/core';
import { AuthService, sendInfoModify, SharedDataService, DeleteUserService, GetUserService, MarksServiceUser, GetAllInformationFilter } from '../core/services/backend.service';
import { Router, ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  marks: any[] = [];
  selectedMonth: any;
  reportSelected: string = '15';
  errorMessage: string | null = null;
  user: any | undefined;
  allInfo: any[] = [];
  message: any;
  messageType: any;
  months: { name: string, value: number }[] = [
    { name: 'Enero', value: 1 },
    { name: 'Febrero', value: 2 },
    { name: 'Marzo', value: 3 },
    { name: 'Abril', value: 4 },
    { name: 'Mayo', value: 5 },
    { name: 'Junio', value: 6 },
    { name: 'Julio', value: 7 },
    { name: 'Agosto', value: 8 },
    { name: 'Septiembre', value: 9 },
    { name: 'Octubre', value: 10 },
    { name: 'Noviembre', value: 11 },
    { name: 'Diciembre', value: 12 }
  ];

  constructor(
    private marksService: MarksServiceUser,
    private getInfo: GetAllInformationFilter,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sendInfo: sendInfoModify,
    private sharedData: SharedDataService,
    private deleteUserService: DeleteUserService,
    private userService: GetUserService
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.route.queryParams.subscribe(params => {
        const employeeName = params['user'];
        if (employeeName) {
          this.user = employeeName;
          this.setCurrentMonth();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getUserDetails(user: string): void {
    this.userService.getUser(user).subscribe(
      (data) => {
        this.user = data.user;
      },
      (error) => {
        console.error('Error al obtener detalles del usuario:', error);
      }
    );
  }

  setCurrentMonth(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.getUserDetails(this.user);
    this.getMarks(this.reportSelected);
  }

  getMarks(reportSelected: string): void {
    this.marksService.getMarksUser(this.selectedMonth, this.user, reportSelected).subscribe(
      (data) => {
        if (data.marks_list) {
          this.marks = data.marks_list;
          this.errorMessage = null;
        }
      },
      (error) => {
        console.log(error);
        if (error.status === 404) {
          this.marks = [];
          this.errorMessage = "No se encontraron marcas para este rango.";
        } else {
          this.marks = [];
          this.errorMessage = 'Error al obtener las marcas.';
        }
      }
    );
  }

  sendInfoModify(): void {
    if (this.user) {
      this.sendInfo.sendIModify(this.user).subscribe(
        (data) => {
          this.sharedData.setUserData(data);
          this.router.navigate(['/modify_user']);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  deleteUser(): void {
    if (this.user) {
      this.deleteUserService.deleteUser(this.user).subscribe(
        (data) => {
          this.message = data;
          this.messageType = 'success';
          this.router.navigate(['/get_marks']);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  getAllInformationByUserFilter(): void {
    if (this.user) {
      this.getInfo.getAllInformation(this.user, this.reportSelected, this.selectedMonth).subscribe(
        (data) => {
          this.allInfo = data.marks;
          this.generatePDF();
        },
        (error) => {
          this.allInfo = [];
          console.log(error);
        }
      );
    }
  }

  generatePDF(): void {
    const doc = new jsPDF();

    const head = [['Fecha', 'Hora de entrada', 'Hora de salida', 'Llegada tardía', 'Horas trabajadas', 'Horas extras', 'Salario']];
    let documentName = '';
    const data = this.allInfo.map(info => [info.date, info.entry_hours, info.exit_hours, info.in_late, info.total_hours, info.extra_hours, info.total_hours === 0 ? 0 : info.total_salary, this.user=info.user, documentName=info.name+' '+info.last_name]);

    doc.setFontSize(12);
    doc.text('Información del Usuario', 14, 10);
    doc.text(`Usuario: ${this.user}`, 14, 20);
    doc.text(documentName, 14, 30);

    // Add the table using autoTable
    autoTable(doc, {
      startY: 40,
      head: head,
      body: data,
      margin: { top: 10 }
    });

    doc.save(`${documentName}.pdf`);
  }

  onMonthChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.selectedMonth = Number(target.value);
      this.getMarks(this.reportSelected);
    }
  }
}
