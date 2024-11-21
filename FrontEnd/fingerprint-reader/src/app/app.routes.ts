import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MarksComponent } from './marks/marks.component';
import { LoginAdminComponent } from './login-admin/login-admin.component';
import { PanelAdminComponent } from './panel-admin/panel-admin.component';
import { MonthReportComponent } from './month-report/month-report.component';
import { RegisterAdminComponent } from './register-admin/register-admin.component';
import { ModifyUserComponent } from './modify-user/modify-user.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { MarkSecondaryComponent } from './mark-secondary/mark-secondary.component';
import { FaceidComponent } from './faceid/faceid.component';

export const routes: Routes = [
    {path: "mark", loadComponent: () => LoginComponent},
    {path: "register", loadComponent: () => RegisterComponent},
    {path: "get_marks", loadComponent: () => MarksComponent},
    {path: "login", loadComponent: () => LoginAdminComponent},
    {path: "admin", loadComponent: () => PanelAdminComponent},
    {path: "month_report", loadComponent: () => MonthReportComponent},
    {path: "register_admin", loadComponent: () => RegisterAdminComponent},
    {path: "modify_user", loadComponent: () => ModifyUserComponent},
    {path: "user_details", loadComponent: () => UserDetailsComponent},
    {path: 'mark_secundary', loadComponent: () => MarkSecondaryComponent},
    {path: 'faceid', loadComponent: () => FaceidComponent},

    {path: '', redirectTo: 'mark', pathMatch: "full"}
];
