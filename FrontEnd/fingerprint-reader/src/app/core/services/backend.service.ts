import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams   } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(private http: HttpClient) { }

    private url = 'http://localhost:8000/api/authentication/';
    loginUser(in_out: string, fingerprint_data: string ): Observable<any> {
        return this.http.post<any>(this.url, {in_out:in_out, fingerprint_data: fingerprint_data, headers: { 'Content-Type': 'application/json' } });
    }
}

@Injectable({
    providedIn: 'root'
})
export class MarkFaceID {
    constructor(private http: HttpClient) {}

    private apiUrl = "http://localhost:8000/api/faceid/"

    markfaceid(formData: FormData){
        return this.http.post<any>(this.apiUrl, formData)
    }
}

@Injectable({
    providedIn: 'root'
})
export class MarkRegister {
    constructor(private http: HttpClient) { }

    private url = "http://localhost:8000/api/marks/";
    sendMark(formData: FormData): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        })
        return this.http.post<any>(this.url, formData, {headers: headers});
    }
}

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    constructor(private http: HttpClient) { }

    private url = "http://localhost:8000/api/register/";
    registerWorker(formData: FormData): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
        });
        
        return this.http.post<any>(this.url, formData, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class MarksService {

    constructor(private http: HttpClient) { }

    private url = "http://localhost:8000/api/get_marks/";

    getMarks(month: number): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(`${this.url}?month=${month}`, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class MarksServiceUser {

    private url = "http://localhost:8000/api/get_marks_user/";

    constructor(private http: HttpClient) { }

    getMarksUser(month: number, user: string, reportType: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(`${this.url}?month=${month}&user=${user}&reportType=${reportType}`, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class GetAllInformation {

    constructor(private http: HttpClient) { }

    private url = "http://localhost:8000/api/get_all_information/";

    getAllInformation(user: string, month:number): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(this.url + user + '/' + month,{ headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class GetAllInformationFilter {

    constructor(private http: HttpClient) { }

    private url = "http://localhost:8000/api/get_all_informationFilter/";

    getAllInformation(user: string, reportType: string, selectedMonth: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(this.url + user + '/' + reportType + '/' + selectedMonth, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8000/api/login/';
    private logoutUrl = 'http://localhost:8000/api/logout/';
    private token: string | null = null;

    constructor(private http: HttpClient) { }

    private getCsrfToken(): string | null {
        const name = 'csrftoken';
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return null;
    }

    scheduleTokenRemoval(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenExpiration');
        this.token = null;
    }

    login(username: string, password: string): Observable<any> {
        const csrfToken = this.getCsrfToken();
        const headers = new HttpHeaders({ 'X-CSRFToken': csrfToken || '' });
        return this.http.post<any>(this.apiUrl, { user: username, password: password }, { headers }).pipe(
            tap(response => {
                if (response.token) {
                    this.token = response.token;
                    localStorage.setItem('authToken', response.token);
                    localStorage.setItem('authToken', response.token);
                    if (response.created) {
                        console.log('Token created successfully.');
                    } else {
                        console.log('Token already existed.');
                    }
                }
            })
        );
    }

    isAuthenticated(): boolean {
        if (localStorage.getItem('authToken') === null) {
            localStorage.removeItem('authToken');
        }
        return this.token !== null || localStorage.getItem('authToken') !== null;
    }

    getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    logout(): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.post<any>(this.logoutUrl, {}, { headers: headers }).pipe(
            tap(() => {
                localStorage.removeItem('authToken');
            })
        );
    }
}

@Injectable({
    providedIn: 'root'
})
export class GetAllMarks {
    private apiUrl = 'http://localhost:8000/api/all-marks/';

    constructor(private http: HttpClient) { }

    getAllMarks(month: string, reportType: string): Observable<any> {
        let params = new HttpParams()
        .set('month', month)
        .set('reportType', reportType);
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        });
        return this.http.get<any>(this.apiUrl, { params, headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class RegisterAdmin {
    private apiUrl = 'http://localhost:8000/api/register_admin/';

    constructor(private http: HttpClient) { }

    sendAdminData(name: string, last_name: string, user: string, password: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.post<any>(this.apiUrl, { name: name, last_name: last_name, user: user, password: password, headers: headers });
    }
}


@Injectable({
    providedIn: 'root'
})
export class sendInfoModify {
    private apiUrl = 'http://localhost:8000/api/modify_user/'

    constructor(private http: HttpClient) { }

    sendIModify(user: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(`${this.apiUrl}?user=${user}`, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class sendInfoModifyPOST {
    private apiUrl = 'http://localhost:8000/api/modify_user/';

    constructor(private http: HttpClient) { }

    sendInfoModify(formData: FormData): Observable<any> {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No authentication token found');
            throw new Error('No authentication token found');
        }
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
        });
        
        return this.http.post<any>(this.apiUrl, formData, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class SharedDataService {
    private userData: any;

    setUserData(data: any) {
        this.userData = data;
    }

    getUserData(): any {
    return this.userData;
    }
}

@Injectable({
    providedIn: 'root'
})
export class DeleteUserService {
    private apiUrl = 'http://localhost:8000/api/delete_user/'
    constructor(private http: HttpClient) { }

    deleteUser(user: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        const body = {
            user: user
        }
        return this.http.post<any>(this.apiUrl, body, { headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class DeleteUserAdminService {
    private apiUrl = 'http://localhost:8000/api/delete_userAdmin/'
    constructor(private http: HttpClient) { }

    deleteUserAdmin(user: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.post<any>(this.apiUrl, { user: user, headers: headers });
    }
}

@Injectable({
    providedIn: 'root'
})
export class GetUserService {
    private apiUrl = "http://localhost:8000/api/get_user"
    constructor(private http: HttpClient) {}

    getUser(user: string): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        });
        return this.http.get<any>(`${this.apiUrl}?user=${user}`, { headers: headers });
    }
}