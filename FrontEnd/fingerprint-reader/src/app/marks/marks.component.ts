import { Component, OnInit } from '@angular/core';
import { MarksService, GetAllInformation, AuthService, sendInfoModify, SharedDataService, DeleteUserService, GetUserService, DeleteUserAdminService  } from '../core/services/backend.service';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-marks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marks.component.html',
  styleUrl: './marks.component.css'
})

export class MarksComponent implements OnInit {
  marks: any[] = [];
  admins: any[] = [];
  selectedMonth: number | any; // Se establece en ngOnInit
  errorMessage: string | null = null;
  user: any | undefined;
  allInfo: any[] = [];
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
  message: any;
  messageType: any;

  constructor(
    private marksService: MarksService,
    private getInfo: GetAllInformation,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sendInfo: sendInfoModify,
    private sharedData: SharedDataService,
    private deleteUserService: DeleteUserService,
    private userService: GetUserService,
    private deleteUserAdmin: DeleteUserAdminService,
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.setCurrentMonth();
      this.getMarksByMonth();
    } else {
      this.router.navigate(['/login']);
    }
  }

  setCurrentMonth(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1; // Obtener el mes actual (1-12)
  }

  getMarksByMonth(): void {
    this.marksService.getMarks(this.selectedMonth).subscribe(
      (data) => {
        this.admins = data.marks_list_admin;
        this.user = data.user;
        this.errorMessage = null;
        this.marks = data.marks_list;
      },
      (error) => {
        this.message = "Error del servidor";
        this.messageType = "error";
      }
    );
  }

  closeAlert() {
    this.message = null;
    this.messageType = null;
}

  sendInfoModify (user: string) {
    this.sendInfo.sendIModify(user).subscribe(
      (data) => {
        this.sharedData.setUserData(data);
        this.router.navigate(['/modify_user']);
      },
      (error) => {
        console.log(error);
      }
    )
  }

  deleteUserView(user: string) {
    this.deleteUserService.deleteUser(user).subscribe(
      (data) => {
        this.message = data;
        this.messageType = 'success';
        this.getMarksByMonth();
      },
      (error) => {
        console.error('Error del servidor:', error);
        this.message = 'Error al eliminar el usuario';
        this.messageType = 'error';
      }
    )
  }

  deleteUserAdminVIEW(userAdmin: string) {
    this.deleteUserAdmin.deleteUserAdmin(userAdmin).subscribe(
      (data) => {
        this.message = data;
        this.messageType = 'success';
        this.authService.scheduleTokenRemoval()
        if (localStorage.getItem('authToken') === null){
          this.router.navigate(['/login']);
        }
        this.getMarksByMonth();
      },
      (error) => {
        console.log(error);
      }
    )
  }

  employeeName(user: string) {
    this.userService.getUser(user).subscribe(
      (data) => {
        this.user = data;
        this.router.navigate(['/user_details'], { queryParams: { user: data.user } })
      },
      (error) => {
        if (error.status === 404) {
          this.message = 'Usuario no encontrado';
          this.messageType = 'error';
        }
      }
    )
  }

  getAllInformation(user: string): void {
    this.getInfo.getAllInformation(user, this.selectedMonth).subscribe(
      (data) => {
        this.allInfo = data.marks;
        this.user = data.user;
        this.generatePDF();
      },
      (error) => {
        this.allInfo = [];
        console.log(error);
      }
    );
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
      this.getMarksByMonth();
    }
  }
}