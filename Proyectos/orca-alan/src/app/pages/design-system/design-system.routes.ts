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
      {
        path: 'atoms/checkboxes',
        loadComponent: () => import('./pages/atoms/checkboxes/checkboxes.component').then(m => m.CheckboxesComponent)
      },
      {
        path: 'atoms/sliders',
        loadComponent: () => import('./pages/atoms/sliders/sliders.component').then(m => m.SlidersComponent)
      },
      {
        path: 'atoms/progress',
        loadComponent: () => import('./pages/atoms/progress/progress.component').then(m => m.ProgressComponent)
      },
      {
        path: 'atoms/avatars',
        loadComponent: () => import('./pages/atoms/avatars/avatars.component').then(m => m.AvatarsComponent)
      },
      {
        path: 'atoms/dividers',
        loadComponent: () => import('./pages/atoms/dividers/dividers.component').then(m => m.DividersComponent)
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
      {
        path: 'molecules/accordions',
        loadComponent: () => import('./pages/molecules/accordions/accordions.component').then(m => m.AccordionsComponent)
      },
      {
        path: 'molecules/tabs',
        loadComponent: () => import('./pages/molecules/tabs/tabs.component').then(m => m.TabsComponent)
      },
      {
        path: 'molecules/tooltips',
        loadComponent: () => import('./pages/molecules/tooltips/tooltips.component').then(m => m.TooltipsComponent)
      },
      {
        path: 'molecules/messages',
        loadComponent: () => import('./pages/molecules/messages/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'molecules/steppers',
        loadComponent: () => import('./pages/molecules/steppers/steppers.component').then(m => m.SteppersComponent)
      },
      {
        path: 'molecules/timelines',
        loadComponent: () => import('./pages/molecules/timelines/timelines.component').then(m => m.TimelinesComponent)
      },
      {
        path: 'molecules/splitters',
        loadComponent: () => import('./pages/molecules/splitters/splitters.component').then(m => m.SplittersComponent)
      },
      {
        path: 'molecules/lists',
        loadComponent: () => import('./pages/molecules/lists/lists.component').then(m => m.ListsComponent)
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
      {
        path: 'organisms/detail-template',
        loadComponent: () => import('./pages/organisms/detail-template/detail-template.component').then(m => m.DetailTemplateComponent)
      },
      // Guides
      {
        path: 'guides/documentation',
        loadComponent: () => import('./pages/guides/documentation-guide/documentation-guide.component').then(m => m.DocumentationGuideComponent)
      }
    ]
  }
];
