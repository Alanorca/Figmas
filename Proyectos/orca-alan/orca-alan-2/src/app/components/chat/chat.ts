import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';

export interface ChatParticipante {
    id: string | number;
    nombre: string;
    avatar?: string;
    rol?: 'evaluador' | 'aprobador' | 'revisor' | 'usuario';
}

export interface ChatMensaje {
    id: string | number;
    usuarioId: string | number;
    usuarioNombre: string;
    mensaje: string;
    fecha: Date;
    leido?: boolean;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, InputGroupModule, InputGroupAddonModule, TooltipModule],
    template: `
        <div class="chat-wrapper">
            <div class="chat-layout">
                <!-- Sidebar de usuarios -->
                @if (participantes.length > 1) {
                    <div class="chat-users-sidebar">
                        @for (participante of participantes; track participante.id; let i = $index) {
                            <div
                                class="chat-user-item"
                                [class.active]="selectedUserIndex() === i"
                                (click)="setActiveUser(i)"
                                [pTooltip]="participante.nombre"
                                tooltipPosition="right"
                            >
                                @if (participante.avatar) {
                                    <img [src]="participante.avatar" class="chat-user-avatar" />
                                } @else {
                                    <div class="chat-user-avatar-letter" [class]="getAvatarClass(participante.rol)">
                                        {{ participante.nombre.charAt(0).toUpperCase() }}
                                    </div>
                                }
                            </div>
                        }
                        <!-- Indicador activo -->
                        <div class="active-indicator" [style.transform]="'translateY(' + (selectedUserIndex() * 56) + 'px)'"></div>
                    </div>
                }

                <!-- Área de mensajes -->
                <div class="chat-main">
                    <!-- Header del usuario activo -->
                    @if (activeUser()) {
                        <div class="chat-header">
                            @if (activeUser()!.avatar) {
                                <img [src]="activeUser()!.avatar" class="chat-header-avatar" />
                            } @else {
                                <div class="chat-header-avatar-letter" [class]="getAvatarClass(activeUser()!.rol)">
                                    {{ activeUser()!.nombre.charAt(0).toUpperCase() }}
                                </div>
                            }
                            <div class="chat-header-info">
                                <span class="chat-header-name">{{ activeUser()!.nombre }}</span>
                                @if (activeUser()!.rol) {
                                    <span class="chat-header-role">{{ getRolLabel(activeUser()!.rol) }}</span>
                                }
                            </div>
                        </div>
                    }

                    <!-- Mensajes -->
                    <div class="chat-messages">
                        @for (mensaje of currentMessages(); track mensaje.id) {
                            <div class="chat-message" [class.own]="esMensajePropio(mensaje)">
                                <div class="chat-bubble" [class.own]="esMensajePropio(mensaje)">
                                    {{ mensaje.mensaje }}
                                </div>
                                <span class="chat-time">{{ formatHora(mensaje.fecha) }}</span>
                            </div>
                        } @empty {
                            <div class="chat-empty">
                                <i class="pi pi-comments"></i>
                                <p>{{ emptyMessage }}</p>
                                <span>{{ emptySubMessage }}</span>
                            </div>
                        }
                    </div>

                    <!-- Input -->
                    <div class="chat-input">
                        <p-inputgroup>
                            <input
                                pInputText
                                [(ngModel)]="nuevoMensaje"
                                [placeholder]="inputPlaceholder"
                                (keyup.enter)="enviarMensaje()"
                            />
                            <button
                                pButton
                                severity="secondary"
                                class="chat-send-btn"
                                (click)="enviarMensaje()"
                                [disabled]="!nuevoMensaje.trim()"
                            >
                                <i class="pi pi-send"></i>
                            </button>
                        </p-inputgroup>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .chat-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: var(--surface-0);
            border-radius: 8px;
            overflow: hidden;
        }

        .chat-layout {
            display: flex;
            flex: 1;
            height: 100%;
            overflow: hidden;
        }

        .chat-users-sidebar {
            width: 70px;
            border-right: 1px solid var(--surface-200);
            display: flex;
            flex-direction: column;
            padding: 1rem 0;
            position: relative;
            background: var(--surface-0);
        }

        .chat-user-item {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0.5rem 0;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .chat-user-item:hover {
            background: var(--surface-100);
        }

        .chat-user-item.active {
            background: var(--surface-50);
        }

        .chat-user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .chat-user-avatar-letter {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
        }

        .chat-user-avatar-letter.evaluador {
            background: #dbeafe;
            color: #1d4ed8;
        }

        .chat-user-avatar-letter.aprobador {
            background: #f3e8ff;
            color: #7c3aed;
        }

        .chat-user-avatar-letter.revisor {
            background: #ffedd5;
            color: #c2410c;
        }

        .chat-user-avatar-letter.usuario {
            background: #e2e8f0;
            color: #475569;
        }

        .active-indicator {
            position: absolute;
            right: 0;
            top: 1rem;
            width: 2px;
            height: 56px;
            background: #10b981;
            transition: transform 0.3s ease;
        }

        .chat-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #f1f5f9;
            min-width: 0;
        }

        .chat-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            background: var(--surface-0);
            border-bottom: 1px solid var(--surface-200);
        }

        .chat-header-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
        }

        .chat-header-avatar-letter {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1.25rem;
        }

        .chat-header-info {
            display: flex;
            flex-direction: column;
        }

        .chat-header-name {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
        }

        .chat-header-role {
            font-size: 0.75rem;
            color: #64748b;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .chat-message {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            max-width: 80%;
        }

        .chat-message.own {
            align-self: flex-end;
            align-items: flex-end;
        }

        .chat-bubble {
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            background: #ffffff;
            border: none;
            color: #1e293b;
            font-size: 0.875rem;
            line-height: 1.5;
            word-break: break-word;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chat-bubble.own {
            background: #10b981;
            color: #ffffff;
            border-radius: 1rem 1rem 0 1rem;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        .chat-message:not(.own) .chat-bubble {
            border-radius: 0 1rem 1rem 1rem;
        }

        .chat-time {
            font-size: 0.7rem;
            color: #64748b;
            font-weight: 500;
        }

        .chat-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            text-align: center;
            padding: 2rem;
        }

        .chat-empty i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #94a3b8;
        }

        .chat-empty p {
            margin: 0;
            font-size: 0.875rem;
            color: #475569;
        }

        .chat-empty span {
            font-size: 0.75rem;
            color: #64748b;
        }

        .chat-input {
            padding: 1rem;
            background: var(--surface-0);
            border-top: 1px solid var(--surface-200);
        }

        .chat-input ::ng-deep .p-inputgroup {
            width: 100%;
        }

        .chat-input ::ng-deep input {
            border-right: none;
        }

        .chat-send-btn {
            border-left: none !important;
            border: 1px solid var(--surface-300) !important;
        }

        /* Scrollbar */
        .chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }

        .chat-messages::-webkit-scrollbar-thumb {
            background: var(--surface-300);
            border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
            background: var(--surface-400);
        }
    `]
})
export class ChatComponent {
    @Input() participantes: ChatParticipante[] = [];
    @Input() mensajes: ChatMensaje[] = [];
    @Input() usuarioActualId: string | number = '';
    @Input() showParticipantes: boolean = true;
    @Input() emptyMessage: string = 'No hay mensajes';
    @Input() emptySubMessage: string = 'Inicia la conversación';
    @Input() inputPlaceholder: string = 'Escribe un mensaje...';

    @Output() onEnviarMensaje = new EventEmitter<string>();

    nuevoMensaje = '';
    selectedUserIndex = signal<number>(0);

    activeUser = computed(() => {
        if (this.participantes.length === 0) return null;
        return this.participantes[this.selectedUserIndex()] || this.participantes[0];
    });

    currentMessages = computed(() => {
        // Si hay múltiples participantes, filtramos por usuario seleccionado
        // Si solo hay uno o ninguno, mostramos todos los mensajes
        if (this.participantes.length <= 1) {
            return this.mensajes;
        }
        const user = this.activeUser();
        if (!user) return this.mensajes;
        return this.mensajes.filter(m =>
            m.usuarioId === user.id || m.usuarioId === this.usuarioActualId
        );
    });

    setActiveUser(index: number): void {
        this.selectedUserIndex.set(index);
    }

    esMensajePropio(mensaje: ChatMensaje): boolean {
        return mensaje.usuarioId === this.usuarioActualId;
    }

    formatHora(fecha: Date): string {
        return new Date(fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }

    getAvatarClass(rol?: string): string {
        return rol || 'usuario';
    }

    getRolLabel(rol?: string): string {
        switch (rol) {
            case 'aprobador': return 'Aprobador';
            case 'revisor': return 'Revisor';
            case 'evaluador': return 'Evaluador';
            default: return 'Usuario';
        }
    }

    enviarMensaje(): void {
        const mensaje = this.nuevoMensaje.trim();
        if (mensaje) {
            this.onEnviarMensaje.emit(mensaje);
            this.nuevoMensaje = '';
        }
    }
}
