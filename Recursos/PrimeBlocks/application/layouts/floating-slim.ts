import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'floating-slim',
    standalone: true,
    imports: [CommonModule, FormsModule, AvatarModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule],
    template: `
        <div class="p-6 flex gap-8 bg-surface-0 dark:bg-surface-950">
            <div class="p-6 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-700 flex flex-col w-24">
                <div class="flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="32" viewBox="0 0 33 32" fill="none">
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M7.59219 2.87829C6.44766 3.67858 5.4127 4.62478 4.51426 5.68992C8.1857 5.34906 12.8501 5.90564 18.2655 8.61335C24.0484 11.5047 28.705 11.6025 31.9458 10.9773C31.6517 10.087 31.2815 9.23135 30.843 8.41791C27.1332 8.80919 22.3772 8.29127 16.8345 5.51998C13.3148 3.76014 10.2122 3.03521 7.59219 2.87829ZM28.6759 5.33332C25.7462 2.06 21.4887 0 16.75 0C15.3584 0 14.0081 0.177686 12.7209 0.511584C14.4643 0.987269 16.3163 1.68319 18.2655 2.65781C22.3236 4.68682 25.8271 5.34013 28.6759 5.33332ZM32.6387 14.1025C28.7235 14.8756 23.317 14.7168 16.8345 11.4755C10.774 8.44527 5.95035 8.48343 2.69712 9.20639C2.5292 9.24367 2.36523 9.28287 2.20522 9.32367C1.7793 10.25 1.43931 11.2241 1.19536 12.2356C1.45591 12.166 1.72514 12.0998 2.00293 12.0381C5.94966 11.161 11.5261 11.1991 18.2655 14.5689C24.3261 17.5991 29.1497 17.561 32.4029 16.838C32.5144 16.8133 32.6242 16.7877 32.7322 16.7613C32.7441 16.509 32.75 16.2552 32.75 16C32.75 15.358 32.7122 14.7248 32.6387 14.1025ZM32.2098 20.1378C28.3326 20.8157 23.0836 20.5555 16.8345 17.431C10.774 14.4008 5.95035 14.439 2.69712 15.1619C1.975 15.3223 1.32539 15.5178 0.752344 15.7241C0.750782 15.8158 0.75 15.9078 0.75 16C0.75 24.8366 7.91344 32 16.75 32C24.1557 32 30.3862 26.9687 32.2098 20.1378Z"
                            class="fill-surface-900 dark:fill-surface-0"
                        />
                    </svg>
                </div>

                <div class="flex-1 flex flex-col items-center py-6">
                    <nav class="flex flex-col items-center gap-4">
                        @for (item of navs(); track item.label) {
                            <button
                                [ngClass]="
                                    selectedNav === item.label
                                        ? 'bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-0 border-surface-200 dark:border-surface-700'
                                        : 'bg-transparent border-transparent text-surface-600 dark:text-surface-500'
                                "
                                class="w-10 h-10 flex items-center justify-center rounded-lg border hover:bg-surface-0 dark:hover:bg-surface-950 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-200 dark:hover:border-surface-700 transition-all cursor-pointer"
                                (click)="selectedNav = item.label"
                            >
                                <i [class]="item.icon" class="text-xl! leading-normal!"></i>
                            </button>
                        }
                    </nav>
                </div>

                <div class="flex flex-col items-center gap-4 mt-auto">
                    @for (item of bottomNavs(); track item.label) {
                        <button
                            [ngClass]="
                                selectedNav === item.label
                                    ? 'bg-surface-0 dark:bg-surface-950 text-surface-900 dark:text-surface-0 border-surface-200 dark:border-surface-700'
                                    : 'bg-transparent border-transparent text-surface-600 dark:text-surface-500'
                            "
                            class="w-10 h-10 flex items-center justify-center rounded-lg border hover:bg-surface-0 dark:hover:bg-surface-950 hover:text-surface-900 dark:hover:text-surface-0 hover:border-surface-200 dark:hover:border-surface-700 transition-all cursor-pointer"
                            (click)="selectedNav = item.label"
                        >
                            <i [class]="item.icon" class="text-xl! leading-normal!"></i>
                        </button>
                    }

                    <div class="w-full h-px bg-surface-200 dark:bg-surface-700 my-4"></div>

                    <p-avatar image="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/avatar-amyels.png" class="w-10! h-10! cursor-pointer" shape="circle"></p-avatar>
                </div>
            </div>

            <div class="min-h-screen overflow-auto flex-1 flex flex-col gap-8 transition-all px-2">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
                    <div>
                        <h1 class="text-lg font-medium text-surface-900 dark:text-surface-0">Dashboard</h1>
                        <p class="text-surface-500">Excepteur sint occaecat</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-iconfield>
                            <p-inputicon class="pi pi-search"></p-inputicon>
                            <input pInputText [(ngModel)]="search" placeholder="Search" size="small" class="md:w-56 w-full h-9" />
                        </p-iconfield>
                        <button pButton severity="secondary" outlined class="w-9 h-9 p-0! shrink-0 rounded-md">
                            <i pButtonIcon class="pi pi-bell text-sm! leading-normal!"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 md:flex-row flex-col">
                    <div class="flex-1 col-span-1 md:col-span-2 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl bg-surface-50 dark:bg-surface-800"></div>
                    <div class="flex-1 col-span-1 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl bg-surface-50 dark:bg-surface-800"></div>
                </div>
            </div>
        </div>
    `
})
export class FloatingSlim {
    search: string = '';
    selectedNav: string = 'Home';
    navs = signal([
        { label: 'Home', icon: 'pi pi-home' },
        { label: 'Bookmark', icon: 'pi pi-bookmark' },
        { label: 'Users', icon: 'pi pi-users' },
        { label: 'Comments', icon: 'pi pi-comments' },
        { label: 'Calendar', icon: 'pi pi-calendar' }
    ]);
    bottomNavs = signal([
        { label: 'Question', icon: 'pi pi-question-circle' },
        { label: 'Settings', icon: 'pi pi-cog' }
    ]);
}
