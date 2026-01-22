import { Routes } from '@angular/router';

export const DESIGN_SYSTEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./design-system.component').then(m => m.DesignSystemComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent)
      },
      // Foundation
      {
        path: 'foundation/colors',
        loadComponent: () => import('./pages/foundation/colors/colors.component').then(m => m.ColorsComponent)
      },
      {
        path: 'foundation/typography',
        loadComponent: () => import('./pages/foundation/typography/typography.component').then(m => m.TypographyComponent)
      },
      {
        path: 'foundation/spacing',
        loadComponent: () => import('./pages/foundation/spacing/spacing.component').then(m => m.SpacingComponent)
      },
      {
        path: 'foundation/shadows',
        loadComponent: () => import('./pages/foundation/shadows/shadows.component').then(m => m.ShadowsComponent)
      },
      {
        path: 'foundation/border-radius',
        loadComponent: () => import('./pages/foundation/border-radius/border-radius.component').then(m => m.BorderRadiusComponent)
      },
      // Atoms
      {
        path: 'atoms/buttons',
        loadComponent: () => import('./pages/atoms/buttons/buttons.component').then(m => m.ButtonsComponent)
      },
      {
        path: 'atoms/inputs',
        loadComponent: () => import('./pages/atoms/inputs/inputs.component').then(m => m.InputsComponent)
      },
      {
        path: 'atoms/icons',
        loadComponent: () => import('./pages/atoms/icons/icons.component').then(m => m.IconsComponent)
      },
      {
        path: 'atoms/badges',
        loadComponent: () => import('./pages/atoms/badges/badges.component').then(m => m.BadgesComponent)
      },
      {
        path: 'atoms/chips',
        loadComponent: () => import('./pages/atoms/chips/chips.component').then(m => m.ChipsComponent)
      },
      // Molecules
      {
        path: 'molecules/form-fields',
        loadComponent: () => import('./pages/molecules/form-fields/form-fields.component').then(m => m.FormFieldsComponent)
      },
      {
        path: 'molecules/search-box',
        loadComponent: () => import('./pages/molecules/search-box/search-box.component').then(m => m.SearchBoxComponent)
      },
      {
        path: 'molecules/menu-items',
        loadComponent: () => import('./pages/molecules/menu-items/menu-items.component').then(m => m.MenuItemsComponent)
      },
      {
        path: 'molecules/cards',
        loadComponent: () => import('./pages/molecules/cards/cards.component').then(m => m.CardsComponent)
      },
      {
        path: 'molecules/selection-cards',
        loadComponent: () => import('./pages/molecules/selection-cards/selection-cards.component').then(m => m.SelectionCardsComponent)
      },
      {
        path: 'molecules/upload-area',
        loadComponent: () => import('./pages/molecules/upload-area/upload-area.component').then(m => m.UploadAreaComponent)
      },
      // Organisms
      {
        path: 'organisms/tables',
        loadComponent: () => import('./pages/organisms/tables/tables.component').then(m => m.TablesComponent)
      },
      {
        path: 'organisms/dialogs',
        loadComponent: () => import('./pages/organisms/dialogs/dialogs.component').then(m => m.DialogsComponent)
      },
      {
        path: 'organisms/forms',
        loadComponent: () => import('./pages/organisms/forms/forms.component').then(m => m.FormsComponent)
      },
      {
        path: 'organisms/multi-step-template',
        loadComponent: () => import('./pages/organisms/multi-step-template/multi-step-template.component').then(m => m.MultiStepTemplateComponent)
      },
      // Guides
      {
        path: 'guides/documentation',
        loadComponent: () => import('./pages/guides/documentation-guide/documentation-guide.component').then(m => m.DocumentationGuideComponent)
      }
    ]
  }
];
