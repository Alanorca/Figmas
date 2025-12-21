import { Component, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeNode } from 'primeng/api';
import { MockDataService } from '../../services/mock-data.service';
import { NodoOrganigrama } from '../../models';

@Component({
  selector: 'app-organigramas',
  standalone: true,
  imports: [CardModule, ButtonModule, OrganizationChartModule, DialogModule, AvatarModule, ToolbarModule],
  templateUrl: './organigramas.html',
  styleUrl: './organigramas.scss'
})
export class OrganigramasComponent {
  private mockData = inject(MockDataService);

  organigrama = this.mockData.organigrama;
  showDetailDialog = signal(false);
  selectedNode = signal<NodoOrganigrama | null>(null);

  get orgChartData(): TreeNode[] {
    return [this.convertToTreeNode(this.organigrama().raiz)];
  }

  private convertToTreeNode(nodo: NodoOrganigrama): TreeNode {
    return {
      label: nodo.nombre,
      type: 'person',
      styleClass: 'org-node',
      expanded: true,
      data: nodo,
      children: nodo.subordinados.map(sub => this.convertToTreeNode(sub))
    };
  }

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node.data);
    this.showDetailDialog.set(true);
  }
}
