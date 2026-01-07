import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { TreeNode, MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NodoOrganigrama } from '../../models';

@Component({
  selector: 'app-organigramas',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    OrganizationChartModule,
    DialogModule,
    DrawerModule,
    AvatarModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    BreadcrumbModule,
    DividerModule,
    SplitterModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './organigramas.html',
  styleUrl: './organigramas.scss'
})
export class OrganigramasComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Estado principal
  organigrama = signal<any | null>(null);

  // Drawer de detalle (reemplaza Dialog)
  showDetailDrawer = false;
  selectedNode = signal<NodoOrganigrama | null>(null);

  // Búsqueda
  searchQuery = signal('');
  searchSubordinadosQuery = signal('');

  // Breadcrumb para navegación
  breadcrumbItems = signal<MenuItem[]>([]);
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', command: () => this.navegarARaiz() };

  // Dialog de crear/editar
  showNodeDialog = false;
  editingNode = signal<NodoOrganigrama | null>(null);
  parentNodeForNew = signal<NodoOrganigrama | null>(null);
  isCreatingRoot = signal(false);

  // Formulario reactivo con descripción
  nodeForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(500)]],
    cargo: ['', [Validators.required, Validators.maxLength(100)]],
    departamento: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email]],
    telefono: ['', [Validators.maxLength(20)]]
  });

  // Estadísticas dinámicas
  totalEmpleados = computed(() => this.organigrama()?.nodos?.length || 0);

  departamentosUnicos = computed(() => {
    const nodos = this.organigrama()?.nodos || [];
    return new Set(nodos.map((n: any) => n.departamento).filter(Boolean)).size;
  });

  nivelesJerarquicos = computed(() => {
    const calcMaxDepth = (nodes: TreeNode[], depth: number): number => {
      if (!nodes || nodes.length === 0) return depth;
      let maxDepth = depth;
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const childDepth = calcMaxDepth(node.children, depth + 1);
          if (childDepth > maxDepth) maxDepth = childDepth;
        }
      }
      return maxDepth;
    };
    return this.orgChartData.length > 0 ? calcMaxDepth(this.orgChartData, 1) : 0;
  });

  direccionesGenerales = computed(() => {
    const nodos = this.organigrama()?.nodos || [];
    return nodos.filter((n: any) => !n.padreId).length;
  });

  // Subordinados filtrados
  subordinadosFiltrados = computed(() => {
    const node = this.selectedNode();
    if (!node || !node.subordinados) return [];
    const query = this.searchSubordinadosQuery().toLowerCase();
    if (!query) return node.subordinados;
    return node.subordinados.filter((s: NodoOrganigrama) =>
      s.nombre.toLowerCase().includes(query) ||
      s.cargo.toLowerCase().includes(query) ||
      s.departamento?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.cargarOrganigrama();
  }

  cargarOrganigrama(): void {
    this.api.getOrganigramas().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.organigrama.set(data[0]);
        }
      },
      error: (err) => {
        console.error('Error cargando organigrama:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el organigrama'
        });
      }
    });
  }

  get orgChartData(): TreeNode[] {
    const org = this.organigrama();
    if (!org || !org.nodos || org.nodos.length === 0) {
      return [];
    }

    // Build tree from flat list of nodes
    const nodesMap = new Map<string, any>();
    org.nodos.forEach((nodo: any) => {
      nodesMap.set(nodo.id, { ...nodo, children: [], subordinados: [] });
    });

    let rootNode: any = null;
    org.nodos.forEach((nodo: any) => {
      const node = nodesMap.get(nodo.id);
      if (nodo.padreId) {
        const parent = nodesMap.get(nodo.padreId);
        if (parent) {
          parent.children.push(node);
          parent.subordinados.push(node);
        }
      } else {
        rootNode = node;
      }
    });

    if (!rootNode) {
      return [];
    }

    return [this.convertToTreeNode(rootNode)];
  }

  private convertToTreeNode(nodo: any): TreeNode {
    return {
      label: nodo.nombre,
      type: 'person',
      styleClass: 'org-node',
      expanded: true,
      data: {
        ...nodo,
        subordinados: nodo.children || []
      },
      children: nodo.children?.map((sub: any) => this.convertToTreeNode(sub)) || []
    };
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node.data);
    this.searchSubordinadosQuery.set('');
    this.actualizarBreadcrumb(event.node.data);
    this.showDetailDrawer = true;
  }

  // =====================
  // Breadcrumb Navigation
  // =====================

  actualizarBreadcrumb(nodo: NodoOrganigrama): void {
    const items: MenuItem[] = [];
    const nodos = this.organigrama()?.nodos || [];

    // Construir ruta desde raíz hasta el nodo actual
    const buildPath = (n: NodoOrganigrama): NodoOrganigrama[] => {
      const path: NodoOrganigrama[] = [n];
      let currentId = n.padreId;
      while (currentId) {
        const parent = nodos.find((node: any) => node.id === currentId);
        if (parent) {
          path.unshift(parent);
          currentId = parent.padreId;
        } else {
          break;
        }
      }
      return path;
    };

    const path = buildPath(nodo);
    path.forEach((p, index) => {
      items.push({
        label: p.nombre,
        command: () => this.navegarANodo(p)
      });
    });

    this.breadcrumbItems.set(items);
  }

  navegarARaiz(): void {
    if (this.orgChartData.length > 0) {
      const raiz = this.orgChartData[0].data;
      this.selectedNode.set(raiz);
      this.searchSubordinadosQuery.set('');
      this.actualizarBreadcrumb(raiz);
    }
  }

  navegarANodo(nodo: NodoOrganigrama): void {
    // Buscar el nodo con sus subordinados
    const nodos = this.organigrama()?.nodos || [];
    const nodesMap = new Map<string, any>();
    nodos.forEach((n: any) => {
      nodesMap.set(n.id, { ...n, subordinados: [] });
    });
    nodos.forEach((n: any) => {
      if (n.padreId) {
        const parent = nodesMap.get(n.padreId);
        if (parent) {
          parent.subordinados.push(nodesMap.get(n.id));
        }
      }
    });

    const nodoCompleto = nodesMap.get(nodo.id);
    this.selectedNode.set(nodoCompleto);
    this.searchSubordinadosQuery.set('');
    this.actualizarBreadcrumb(nodoCompleto);
  }

  seleccionarSubordinado(subordinado: NodoOrganigrama): void {
    this.navegarANodo(subordinado);
  }

  // =====================
  // CRUD - Crear Nodo
  // =====================

  abrirCrearRaiz(): void {
    if (this.orgChartData.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ya existe un nodo raíz',
        detail: 'Solo puede haber un nodo raíz en el organigrama'
      });
      return;
    }
    this.isCreatingRoot.set(true);
    this.parentNodeForNew.set(null);
    this.editingNode.set(null);
    this.nodeForm.reset();
    this.showNodeDialog = true;
  }

  abrirCrearHijo(parentNode: NodoOrganigrama): void {
    const depth = this.calcularProfundidad(parentNode);
    if (depth >= 10) {
      this.messageService.add({
        severity: 'error',
        summary: 'Profundidad máxima alcanzada',
        detail: 'No se pueden crear más de 10 niveles jerárquicos'
      });
      return;
    }
    this.isCreatingRoot.set(false);
    this.parentNodeForNew.set(parentNode);
    this.editingNode.set(null);
    this.nodeForm.reset();
    this.showNodeDialog = true;
    this.showDetailDrawer = false;
  }

  calcularProfundidad(nodo: NodoOrganigrama): number {
    let depth = 1;
    let currentId = nodo.padreId;
    const nodos = this.organigrama()?.nodos || [];

    while (currentId) {
      const parent = nodos.find((n: any) => n.id === currentId);
      if (parent) {
        depth++;
        currentId = parent.padreId;
      } else {
        break;
      }
    }
    return depth;
  }

  // =====================
  // CRUD - Editar Nodo
  // =====================

  abrirEditar(node: NodoOrganigrama): void {
    this.editingNode.set(node);
    this.parentNodeForNew.set(null);
    this.isCreatingRoot.set(false);
    this.nodeForm.patchValue({
      nombre: node.nombre,
      descripcion: node.descripcion || '',
      cargo: node.cargo,
      departamento: node.departamento || '',
      email: node.email || '',
      telefono: node.telefono || ''
    });
    this.showNodeDialog = true;
    this.showDetailDrawer = false;
  }

  // =====================
  // CRUD - Guardar Nodo
  // =====================

  guardarNodo(): void {
    if (this.nodeForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Complete los campos requeridos'
      });
      return;
    }

    const formData = this.nodeForm.value;
    const editing = this.editingNode();

    if (editing) {
      // Actualizar nodo existente
      this.api.updateNodoOrganigrama(editing.id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Nodo actualizado',
            detail: `"${formData.nombre}" se actualizó correctamente`
          });
          this.showNodeDialog = false;
          this.cargarOrganigrama();
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al actualizar',
            detail: err.message || 'No se pudo actualizar el nodo'
          });
        }
      });
    } else {
      // Crear nuevo nodo
      const orgId = this.organigrama()?.id;
      const padreId = this.parentNodeForNew()?.id || null;

      const nuevoNodo = {
        ...formData,
        organigramaId: orgId,
        padreId: padreId
      };

      this.api.addNodoOrganigrama(nuevoNodo).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Nodo creado',
            detail: `"${formData.nombre}" se creó correctamente`
          });
          this.showNodeDialog = false;
          this.cargarOrganigrama();
        },
        error: (err: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al crear',
            detail: err.message || 'No se pudo crear el nodo'
          });
        }
      });
    }
  }

  // =====================
  // CRUD - Eliminar Nodo
  // =====================

  confirmarEliminar(node: NodoOrganigrama): void {
    // Verificar si tiene hijos
    const tieneHijos = node.subordinados && node.subordinados.length > 0;

    if (tieneHijos) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede eliminar',
        detail: 'Este nodo tiene subordinados. Elimínelos primero.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${node.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarNodo(node)
    });
  }

  eliminarNodo(node: NodoOrganigrama): void {
    this.api.deleteNodoOrganigrama(node.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Nodo eliminado',
          detail: `"${node.nombre}" se eliminó correctamente`
        });
        this.showDetailDrawer = false;
        this.selectedNode.set(null);
        this.cargarOrganigrama();
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al eliminar',
          detail: err.message || 'No se pudo eliminar el nodo'
        });
      }
    });
  }

  // =====================
  // Helpers
  // =====================

  getDialogTitle(): string {
    if (this.editingNode()) {
      return 'Editar Nodo';
    }
    if (this.isCreatingRoot()) {
      return 'Crear Nodo Raíz';
    }
    const parent = this.parentNodeForNew();
    return parent ? `Agregar subordinado de "${parent.nombre}"` : 'Crear Nodo';
  }

  cancelarDialog(): void {
    this.showNodeDialog = false;
    this.editingNode.set(null);
    this.parentNodeForNew.set(null);
    this.isCreatingRoot.set(false);
    this.nodeForm.reset();
  }

  cerrarDrawer(): void {
    this.showDetailDrawer = false;
    this.selectedNode.set(null);
    this.breadcrumbItems.set([]);
  }
}
