import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000/api';
  private http = inject(HttpClient);

  // ============================================================
  // Usuarios
  // ============================================================

  getUsuarios(params?: Record<string, string>): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`, { params: httpParams });
  }

  getUsuarioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${id}`);
  }

  createUsuario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/usuarios`, data);
  }

  updateUsuario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/usuarios/${id}`, data);
  }

  deleteUsuario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`);
  }

  cambiarEstadoUsuario(id: string, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/usuarios/${id}/estado`, { estado });
  }

  asignarRolAUsuario(usuarioId: string, rolId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/usuarios/${usuarioId}/roles`, { rolId });
  }

  removerRolDeUsuario(usuarioId: string, rolId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${usuarioId}/roles/${rolId}`);
  }

  // ============================================================
  // Roles
  // ============================================================

  getRoles(params?: Record<string, string>): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/roles`, { params: httpParams });
  }

  getRolById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/roles/${id}`);
  }

  createRol(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/roles`, data);
  }

  updateRol(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRol(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  duplicarRol(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/roles/${id}/duplicar`, {});
  }

  getUsuariosDeRol(rolId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles/${rolId}/usuarios`);
  }

  getPermisosDeRol(rolId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/roles/${rolId}/permisos`);
  }

  // ============================================================
  // Permisos
  // ============================================================

  getPermisos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/permisos`);
  }

  getPermisosAgrupados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/permisos/agrupados`);
  }

  // ============================================================
  // Módulos
  // ============================================================

  getModulos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modulos`);
  }

  getPermisosRolPorModulo(rolId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/modulos/rol/${rolId}/permisos`);
  }

  // ============================================================
  // Activos
  // ============================================================

  getActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos`);
  }

  // ============================================================
  // Estadísticas
  // ============================================================

  getEstadisticasUsuarios(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estadisticas/usuarios`);
  }

  getEstadisticasRoles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estadisticas/roles`);
  }

  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/estadisticas/dashboard`);
  }
}
