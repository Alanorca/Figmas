import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    selector: 'narrow-with-right-sidebar',
    standalone: true,
    imports: [CommonModule, StyleClassModule],
    template: `
        <div class="min-h-screen flex relative bg-surface-50 dark:bg-surface-950">
            <div class="h-screen bg-surface-0 dark:bg-surface-950 shrink-0 left-0 top-0 z-10 border-r border-surface-200 dark:border-surface-700 w-[70px] select-none">
                <div class="flex flex-col h-full">
                    <div class="flex items-center justify-center shrink-0 bg-primary p-4 h-[64px]">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M6.84219 2.87829C5.69766 3.67858 4.6627 4.62478 3.76426 5.68992C7.4357 5.34906 12.1001 5.90564 17.5155 8.61335C23.2984 11.5047 27.955 11.6025 31.1958 10.9773C30.9017 10.087 30.5315 9.23135 30.093 8.41791C26.3832 8.80919 21.6272 8.29127 16.0845 5.51998C12.5648 3.76014 9.46221 3.03521 6.84219 2.87829ZM27.9259 5.33332C24.9962 2.06 20.7387 0 16 0C14.6084 0 13.2581 0.177686 11.9709 0.511584C13.7143 0.987269 15.5663 1.68319 17.5155 2.65781C21.5736 4.68682 25.0771 5.34013 27.9259 5.33332ZM31.8887 14.1025C27.9735 14.8756 22.567 14.7168 16.0845 11.4755C10.024 8.44527 5.20035 8.48343 1.94712 9.20639C1.7792 9.24367 1.61523 9.28287 1.45522 9.32367C1.0293 10.25 0.689308 11.2241 0.445362 12.2356C0.705909 12.166 0.975145 12.0998 1.25293 12.0381C5.19966 11.161 10.7761 11.1991 17.5155 14.5689C23.5761 17.5991 28.3997 17.561 31.6529 16.838C31.7644 16.8133 31.8742 16.7877 31.9822 16.7613C31.9941 16.509 32 16.2552 32 16C32 15.358 31.9622 14.7248 31.8887 14.1025ZM31.4598 20.1378C27.5826 20.8157 22.3336 20.5555 16.0845 17.431C10.024 14.4008 5.20035 14.439 1.94712 15.1619C1.225 15.3223 0.575392 15.5178 0.002344 15.7241C0.000781601 15.8158 0 15.9078 0 16C0 24.8366 7.16344 32 16 32C23.4057 32 29.6362 26.9687 31.4598 20.1378Z"
                                class="fill-primary-contrast"
                            />
                        </svg>
                    </div>
                    <div class="flex-1 px-2 py-4 flex flex-col items-center gap-2">
                        <button
                            [ngClass]="[
                                'flex items-center justify-center cursor-pointer p-3 w-full rounded-lg border transition-colors duration-150',
                                selectedNav === 'home'
                                    ? 'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-100 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-100 dark:hover:border-surface-700'
                            ]"
                            (click)="selectedNav = 'home'"
                        >
                            <i class="pi pi-home text-xl! leading-normal!"></i>
                        </button>
                        <button
                            [ngClass]="[
                                'flex items-center justify-center cursor-pointer p-3 w-full rounded-lg border transition-colors duration-150',
                                selectedNav === 'search'
                                    ? 'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-100 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-100 dark:hover:border-surface-700'
                            ]"
                            (click)="selectedNav = 'search'"
                        >
                            <i class="pi pi-search text-xl! leading-normal!"></i>
                        </button>
                        <button
                            [ngClass]="[
                                'flex items-center justify-center cursor-pointer p-3 w-full rounded-lg border transition-colors duration-150',
                                selectedNav === 'users'
                                    ? 'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-100 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-100 dark:hover:border-surface-700'
                            ]"
                            (click)="selectedNav = 'users'"
                        >
                            <i class="pi pi-users text-xl! leading-normal!"></i>
                        </button>
                        <button
                            [ngClass]="[
                                'flex items-center justify-center cursor-pointer p-3 w-full rounded-lg border transition-colors duration-150',
                                selectedNav === 'chart'
                                    ? 'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-100 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-100 dark:hover:border-surface-700'
                            ]"
                            (click)="selectedNav = 'chart'"
                        >
                            <i class="pi pi-chart-line text-xl! leading-normal!"></i>
                        </button>
                        <button
                            [ngClass]="[
                                'flex items-center justify-center cursor-pointer p-3 w-full rounded-lg border transition-colors duration-150',
                                selectedNav === 'calendar'
                                    ? 'bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-0 border-surface-100 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-100 dark:hover:border-surface-700'
                            ]"
                            (click)="selectedNav = 'calendar'"
                        >
                            <i class="pi pi-calendar text-xl! leading-normal!"></i>
                        </button>
                    </div>
                    <div class="px-4 pt-4 pb-6 flex flex-col items-center gap-4">
                        <hr class="w-full border-t border-0 border-surface-200 dark:border-surface-700" />
                        <a class="flex items-center justify-center">
                            <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/avatar-amyels.png" class="w-8 h-8 rounded-full cursor-pointer" />
                        </a>
                    </div>
                </div>
            </div>
            <div class="min-h-screen flex flex-col flex-auto">
                <div class="flex justify-between items-center px-7 py-4 bg-surface-0 dark:bg-surface-950 border-b border-surface-200 dark:border-surface-700 min-h-[60px]">
                    <div class="flex flex-1 gap-4">
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                                <i class="pi pi-search text-base! leading-normal! text-surface-500 dark:text-surface-400"></i>
                            </span>
                            <input type="text" class="pl-10 pr-3 py-2 w-40 sm:w-80 border-0 ring-0 bg-transparent outline-hidden" placeholder="Search" />
                        </div>
                    </div>
                    <div class="flex items-center gap-7">
                        <a class="cursor-pointer">
                            <i class="pi pi-bell text-xl! leading-normal! text-surface-500 dark:text-surface-400"></i>
                        </a>
                        <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/avatar-amyels.png" class="w-8 h-8 rounded-full cursor-pointer" />
                        <a
                            pStyleClass="#slideover-right"
                            enterFromClass="hidden"
                            enterActiveClass="animate-fadeinright"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeoutright"
                            [hideOnOutsideClick]="true"
                            class="cursor-pointer"
                            (click)="isSidebarOpen = !isSidebarOpen"
                        >
                            <i [ngClass]="[isSidebarOpen ? 'pi pi-arrow-left' : 'pi pi-arrow-right', 'text-xl! leading-normal! text-surface-500 dark:text-surface-400 transition-transform duration-300']"></i>
                        </a>
                    </div>
                </div>
                <div class="flex flex-auto h-[calc(100vh-60px)] relative">
                    <div class="flex-1 p-7 bg-surface-0 dark:bg-surface-950">
                        <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900 h-full"></div>
                    </div>

                    <div id="slideover-right" class="hidden absolute right-0 top-0 h-full overflow-hidden w-full md:w-100 shadow-xl bg-surface-0 dark:bg-surface-900 z-10">
                        <div class="flex flex-col h-full">
                            <div class="flex flex-col h-full gap-4 p-6">
                                <div class="flex items-center gap-4">
                                    <span class="flex-1 text-surface-900 dark:text-surface-0 text-xl font-medium leading-tight">Right Sidebar</span>
                                    <a pStyleClass="#slideover-right" leaveToClass="hidden" leaveActiveClass="animate-fadeoutright" class="cursor-pointer" (click)="isSidebarOpen = false">
                                        <i class="pi pi-times text-xl! leading-normal! text-surface-500 dark:text-surface-400"></i>
                                    </a>
                                </div>
                                <div class="flex-1 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl p-6">
                                    <p class="text-surface-600 dark:text-surface-400">Sidebar content here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NarrowWithRightSidebar {
    selectedNav: string = 'home';
    isSidebarOpen: boolean = false;
}
