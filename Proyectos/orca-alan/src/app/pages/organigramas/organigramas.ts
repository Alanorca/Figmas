import { Component, inject, signal, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeNode } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { NodoOrganigrama } from '../../models';

@Component({
  selector: 'app-organigramas',
  standalone: true,
  imports: [CardModule, ButtonModule, OrganizationChartModule, DialogModule, AvatarModule, ToolbarModule],
  templateUrl: './organigramas.html',
  styleUrl: './organigramas.scss'
})
export class OrganigramasComponent implements OnInit {
  private api = inject(ApiService);

  organigrama = signal<any | null>(null);
  showDetailDialog = signal(false);
  selectedNode = signal<NodoOrganigrama | null>(null);

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
      error: (err) => console.error('Error cargando organigrama:', err)
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
      nodesMap.set(nodo.id, { ...nodo, children: [] });
    });

    let rootNode: any = null;
    org.nodos.forEach((nodo: any) => {
      const node = nodesMap.get(nodo.id);
      if (nodo.padreId) {
        const parent = nodesMap.get(nodo.padreId);
        if (parent) {
          parent.children.push(node);
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
      data: nodo,
      children: nodo.children?.map((sub: any) => this.convertToTreeNode(sub)) || []
    };
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node.data);
    this.showDetailDialog.set(true);
  }
}
