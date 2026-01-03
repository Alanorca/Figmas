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
  // Activos de Acceso (árbol de archivos/procesos)
  // ============================================================

  getActivosAcceso(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos-acceso`);
  }

  // ============================================================
  // Catálogos
  // ============================================================

  getCatalogos(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/catalogos`);
  }

  getCatalogosPorTipo(tipo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/catalogos/${tipo}`);
  }

  createCatalogo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/catalogos`, data);
  }

  updateCatalogo(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/catalogos/${id}`, data);
  }

  deleteCatalogo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/catalogos/${id}`);
  }

  // ============================================================
  // Plantillas de Activos
  // ============================================================

  getPlantillasActivo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/plantillas`);
  }

  getPlantillaActivoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/activos/plantillas/${id}`);
  }

  createPlantillaActivo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/activos/plantillas`, data);
  }

  updatePlantillaActivo(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/activos/plantillas/${id}`, data);
  }

  deletePlantillaActivo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/activos/plantillas/${id}`);
  }

  // ============================================================
  // Activos de Negocio
  // ============================================================

  getActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos`);
  }

  getActivoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/activos/${id}`);
  }

  createActivo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/activos`, data);
  }

  updateActivo(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/activos/${id}`, data);
  }

  deleteActivo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/activos/${id}`);
  }

  // ============================================================
  // Riesgos
  // ============================================================

  getRiesgos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/riesgos`);
  }

  getRiesgosByActivo(activoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/${activoId}/riesgos`);
  }

  createRiesgo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/activos/riesgos`, data);
  }

  updateRiesgo(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/activos/riesgos/${id}`, data);
  }

  deleteRiesgo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/activos/riesgos/${id}`);
  }

  // ============================================================
  // Incidentes
  // ============================================================

  getIncidentes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/incidentes`);
  }

  getIncidentesByActivo(activoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/${activoId}/incidentes`);
  }

  createIncidente(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/activos/incidentes`, data);
  }

  updateIncidente(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/activos/incidentes/${id}`, data);
  }

  deleteIncidente(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/activos/incidentes/${id}`);
  }

  // ============================================================
  // Defectos
  // ============================================================

  getDefectos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/defectos`);
  }

  getDefectosByActivo(activoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activos/${activoId}/defectos`);
  }

  createDefecto(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/activos/defectos`, data);
  }

  updateDefecto(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/activos/defectos/${id}`, data);
  }

  deleteDefecto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/activos/defectos/${id}`);
  }

  // ============================================================
  // Procesos
  // ============================================================

  getProcesos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procesos`);
  }

  getProcesoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/procesos/${id}`);
  }

  createProceso(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procesos`, data);
  }

  updateProceso(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/procesos/${id}`, data);
  }

  deleteProceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/procesos/${id}`);
  }

  // Nodos de proceso
  addNodoProceso(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procesos/nodos`, data);
  }

  updateNodoProceso(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/procesos/nodos/${id}`, data);
  }

  deleteNodoProceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/procesos/nodos/${id}`);
  }

  // Edges de proceso
  addEdgeProceso(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procesos/edges`, data);
  }

  deleteEdgeProceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/procesos/edges/${id}`);
  }

  // KPIs de proceso
  getKpisProceso(procesoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/procesos/${procesoId}/kpis`);
  }

  createKpiProceso(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/procesos/kpis`, data);
  }

  updateKpiProceso(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/procesos/kpis/${id}`, data);
  }

  deleteKpiProceso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/procesos/kpis/${id}`);
  }

  // ============================================================
  // Cuestionarios
  // ============================================================

  // Marcos normativos
  getMarcosNormativos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cuestionarios/marcos`);
  }

  getMarcoNormativoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cuestionarios/marcos/${id}`);
  }

  createMarcoNormativo(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios/marcos`, data);
  }

  updateMarcoNormativo(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cuestionarios/marcos/${id}`, data);
  }

  deleteMarcoNormativo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cuestionarios/marcos/${id}`);
  }

  // Cuestionarios
  getCuestionarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cuestionarios`);
  }

  getCuestionarioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cuestionarios/${id}`);
  }

  createCuestionario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios`, data);
  }

  updateCuestionario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cuestionarios/${id}`, data);
  }

  deleteCuestionario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cuestionarios/${id}`);
  }

  // Secciones
  addSeccionCuestionario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios/secciones`, data);
  }

  updateSeccionCuestionario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cuestionarios/secciones/${id}`, data);
  }

  deleteSeccionCuestionario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cuestionarios/secciones/${id}`);
  }

  // Preguntas
  addPreguntaSeccion(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios/preguntas`, data);
  }

  updatePreguntaSeccion(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cuestionarios/preguntas/${id}`, data);
  }

  deletePreguntaSeccion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cuestionarios/preguntas/${id}`);
  }

  // Asignaciones
  getAsignacionesCuestionario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cuestionarios/asignaciones`);
  }

  getAsignacionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cuestionarios/asignaciones/${id}`);
  }

  createAsignacionCuestionario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios/asignaciones`, data);
  }

  updateAsignacionCuestionario(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/cuestionarios/asignaciones/${id}`, data);
  }

  deleteAsignacionCuestionario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cuestionarios/asignaciones/${id}`);
  }

  // Respuestas
  guardarRespuestaCuestionario(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cuestionarios/respuestas`, data);
  }

  getRespuestasAsignacion(asignacionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cuestionarios/asignaciones/${asignacionId}/respuestas`);
  }

  // ============================================================
  // Organigramas
  // ============================================================

  getOrganigramas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/organigramas`);
  }

  getOrganigramaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/organigramas/${id}`);
  }

  createOrganigrama(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/organigramas`, data);
  }

  updateOrganigrama(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/organigramas/${id}`, data);
  }

  deleteOrganigrama(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organigramas/${id}`);
  }

  // Nodos de organigrama
  addNodoOrganigrama(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/organigramas/nodos`, data);
  }

  updateNodoOrganigrama(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/organigramas/nodos/${id}`, data);
  }

  deleteNodoOrganigrama(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/organigramas/nodos/${id}`);
  }

  // ============================================================
  // Dashboard
  // ============================================================

  getDashboardConfigs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard`);
  }

  getDashboardDefault(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/default`);
  }

  getDashboardById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/${id}`);
  }

  createDashboardConfig(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard`, data);
  }

  updateDashboardConfig(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/dashboard/${id}`, data);
  }

  deleteDashboardConfig(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dashboard/${id}`);
  }

  // Widgets
  addDashboardWidget(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dashboard/widgets`, data);
  }

  updateDashboardWidget(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/dashboard/widgets/${id}`, data);
  }

  updateDashboardWidgetsLayout(layout: any[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/dashboard/widgets/layout`, { layout });
  }

  deleteDashboardWidget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dashboard/widgets/${id}`);
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

  // ============================================================
  // Notificaciones - Reglas de Notificación
  // ============================================================

  getNotificationRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/rules`);
  }

  getNotificationRuleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/notifications/rules/${id}`);
  }

  createNotificationRule(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/rules`, data);
  }

  updateNotificationRule(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/rules/${id}`, data);
  }

  deleteNotificationRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/rules/${id}`);
  }

  // ============================================================
  // Notificaciones - Reglas de Alertas por Umbral
  // ============================================================

  getAlertRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/alerts`);
  }

  createAlertRule(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/alerts`, data);
  }

  updateAlertRule(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/alerts/${id}`, data);
  }

  deleteAlertRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/alerts/${id}`);
  }

  // ============================================================
  // Notificaciones - Reglas de Vencimiento
  // ============================================================

  getExpirationRules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/notifications/expiration-rules`);
  }

  createExpirationRule(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/expiration-rules`, data);
  }

  updateExpirationRule(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/expiration-rules/${id}`, data);
  }

  deleteExpirationRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/expiration-rules/${id}`);
  }

  // ============================================================
  // Notificaciones - Bandeja de Entrada (Inbox)
  // ============================================================

  getNotificationsInbox(params?: {
    leida?: boolean;
    archivada?: boolean;
    tipo?: string;
    severidad?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<any>(`${this.baseUrl}/notifications/inbox`, { params: httpParams });
  }

  getNotificationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/notifications/inbox/${id}`);
  }

  markNotificationAsRead(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/inbox/${id}/read`, {});
  }

  toggleNotificationArchive(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/inbox/${id}/archive`, {});
  }

  toggleNotificationFollow(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/notifications/inbox/${id}/follow`, {});
  }

  deleteNotification(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/inbox/${id}`);
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/inbox/mark-all-read`, {});
  }

  createNotification(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/notifications/inbox`, data);
  }

  // ============================================================
  // Notificaciones - Preferencias de Usuario
  // ============================================================

  getNotificationPreferences(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/notifications/preferences`);
  }

  updateNotificationPreferences(data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/notifications/preferences`, data);
  }

  // ============================================================
  // Notificaciones - Estadísticas
  // ============================================================

  getNotificationStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/notifications/stats`);
  }

  // ============================================================
  // Proyectos
  // ============================================================

  getProjects(params?: Record<string, string>): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/projects`, { params: httpParams });
  }

  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${id}`);
  }

  createProject(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects`, data);
  }

  updateProject(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
  }

  updateProjectStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/projects/${id}/status`, { status });
  }

  // Objetivos SMART
  getProjectObjectives(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/objectives`);
  }

  createProjectObjective(projectId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects/${projectId}/objectives`, data);
  }

  updateProjectObjective(projectId: string, objectiveId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${projectId}/objectives/${objectiveId}`, data);
  }

  deleteProjectObjective(projectId: string, objectiveId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${projectId}/objectives/${objectiveId}`);
  }

  // KPIs de proyecto
  getProjectKPIs(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/kpis`);
  }

  createProjectKPI(projectId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects/${projectId}/kpis`, data);
  }

  updateProjectKPI(projectId: string, kpiId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${projectId}/kpis/${kpiId}`, data);
  }

  deleteProjectKPI(projectId: string, kpiId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${projectId}/kpis/${kpiId}`);
  }

  // Fases de proyecto
  getProjectPhases(projectId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/phases`);
  }

  createProjectPhase(projectId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/projects/${projectId}/phases`, data);
  }

  updateProjectPhase(projectId: string, phaseId: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/projects/${projectId}/phases/${phaseId}`, data);
  }

  deleteProjectPhase(projectId: string, phaseId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${projectId}/phases/${phaseId}`);
  }

  updatePhaseStatus(projectId: string, phaseId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/projects/${projectId}/phases/${phaseId}/status`, { status });
  }

  reorderProjectPhases(projectId: string, phases: { id: string; orderNum: number }[]): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/projects/${projectId}/phases/reorder`, { phases });
  }

  // Vistas de proyecto
  getProjectDashboard(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${projectId}/dashboard`);
  }

  getProjectGantt(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/projects/${projectId}/gantt`);
  }

  getProjectCalendar(projectId: string, params?: { start?: string; end?: string }): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.start) httpParams = httpParams.set('start', params.start);
      if (params.end) httpParams = httpParams.set('end', params.end);
    }
    return this.http.get<any[]>(`${this.baseUrl}/projects/${projectId}/calendar`, { params: httpParams });
  }

  // ============================================================
  // Tareas
  // ============================================================

  getTasks(params?: Record<string, string>): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any[]>(`${this.baseUrl}/tasks`, { params: httpParams });
  }

  getTaskById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, data);
  }

  updateTask(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tasks/${id}`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }

  updateTaskStatus(id: string, status: string, userId?: string, comment?: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/tasks/${id}/status`, { status, userId, comment });
  }

  updateTaskProgress(id: string, progress: number, actualHours?: number, userId?: string, comment?: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/tasks/${id}/progress`, { progress, actualHours, userId, comment });
  }

  assignTask(id: string, assignedTo: string, assignedBy?: string, reason?: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/tasks/${id}/assign`, { assignedTo, assignedBy, reason });
  }

  // Evidencias de tarea
  getTaskEvidences(taskId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tasks/${taskId}/evidences`);
  }

  createTaskEvidence(taskId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks/${taskId}/evidences`, data);
  }

  deleteTaskEvidence(taskId: string, evidenceId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${taskId}/evidences/${evidenceId}`);
  }

  // Calendario personal
  getMyTasks(userId: string, params?: { start?: string; end?: string }): Observable<any[]> {
    let httpParams = new HttpParams().set('userId', userId);
    if (params) {
      if (params.start) httpParams = httpParams.set('start', params.start);
      if (params.end) httpParams = httpParams.set('end', params.end);
    }
    return this.http.get<any[]>(`${this.baseUrl}/tasks/calendar/my-tasks`, { params: httpParams });
  }

  // Crear tarea desde entidad vinculada
  createTaskFromEntity(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks/link-entity`, data);
  }
}
