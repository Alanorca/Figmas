<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NODE_TYPES } from '../../types/process'
import type { NodeType } from '../../types/process'
import Badge from 'primevue/badge'

const props = defineProps<{
  id: string
  data: {
    label: string
    nodeType: NodeType
    config: Record<string, unknown>
    selected?: boolean
  }
}>()

const metadata = computed(() => NODE_TYPES.find(n => n.type === props.data.nodeType))

const getConfigPreview = () => {
  const config = props.data.config
  switch (props.data.nodeType) {
    case 'csv':
      return config?.fileName || 'Sin archivo'
    case 'llm':
      return config?.model || 'Sin modelo'
    case 'condicional':
      return `${config?.variable || '?'} ${config?.operador || '=='} ${config?.valor || '?'}`
    case 'transformacion':
      return config?.operacion || 'Sin operación'
    case 'activo':
      return config?.activoId || 'Sin activo'
    case 'matematico':
      return config?.formula || 'Sin fórmula'
    case 'estado':
      return config?.nombreEstado || 'Sin estado'
    case 'ml':
      return config?.modeloNombre || 'Sin modelo'
    case 'branching':
      return `${config?.cantidadRamas || 2} ramas`
    default:
      return props.data.nodeType
  }
}

const getStatusColor = () => {
  return 'bg-green-500' // Por defecto verde
}
</script>

<template>
  <div
    class="custom-node surface-card border-round-xl shadow-3 overflow-hidden transition-all transition-duration-200"
    :class="{ 'node-selected': data.selected }"
    :style="{ '--node-color': metadata?.color }"
  >
    <!-- Handle de entrada (izquierda) -->
    <Handle
      type="target"
      :position="Position.Left"
      class="node-handle node-handle-target"
    />

    <!-- Header del nodo -->
    <div
      class="node-header flex align-items-center gap-3 p-3"
      :style="{ background: metadata?.gradient }"
    >
      <div class="node-icon flex align-items-center justify-content-center border-round-lg" style="width: 36px; height: 36px; background: rgba(255,255,255,0.2);">
        <i :class="metadata?.icon" class="text-white text-lg"></i>
      </div>
      <span class="node-title text-white font-semibold text-sm flex-1 white-space-nowrap overflow-hidden text-overflow-ellipsis">
        {{ data.label }}
      </span>
    </div>

    <!-- Body del nodo -->
    <div class="node-body p-3 surface-ground flex flex-column gap-2">
      <!-- Badge del tipo -->
      <div class="flex align-items-center gap-2">
        <div
          class="type-badge flex align-items-center gap-2 px-2 py-1 border-round-lg surface-card border-1 surface-border"
        >
          <i :class="metadata?.icon" class="text-xs" :style="{ color: metadata?.color }"></i>
          <span class="text-xs font-medium text-600">{{ metadata?.label }}</span>
        </div>
      </div>

      <!-- Preview de configuración -->
      <div class="config-preview surface-card border-round-lg p-2 border-1 surface-border">
        <div class="text-xs text-400 font-semibold uppercase mb-1" style="letter-spacing: 0.5px;">Configuración</div>
        <div class="text-sm text-700 font-medium white-space-nowrap overflow-hidden text-overflow-ellipsis">
          {{ getConfigPreview() }}
        </div>
      </div>

      <!-- Status -->
      <div class="flex align-items-center gap-2">
        <div class="status-dot w-2 h-2 border-circle" :class="getStatusColor()"></div>
        <span class="text-xs text-500 font-medium">Listo</span>
      </div>
    </div>

    <!-- Handle de salida (derecha) -->
    <Handle
      type="source"
      :position="Position.Right"
      class="node-handle node-handle-source"
    />
  </div>
</template>

<style scoped lang="scss">
.custom-node {
  --node-color: var(--primary-color);
  min-width: 220px;
  max-width: 280px;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-4);
  }

  &.node-selected {
    border-color: var(--node-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--node-color) 20%, transparent);
  }
}

.node-header {
  border-bottom: none;
}

.node-icon {
  backdrop-filter: blur(4px);
}

.node-title {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.type-badge {
  font-size: 11px;
}

.config-preview {
  .text-xs {
    font-size: 10px;
  }
}

.status-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// Handle styles
.node-handle {
  width: 14px !important;
  height: 14px !important;
  background: var(--surface-card) !important;
  border: 3px solid var(--node-color) !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;

  &:hover {
    transform: scale(1.3);
    background: var(--node-color) !important;
  }
}

.node-handle-target {
  left: -7px !important;
}

.node-handle-source {
  right: -7px !important;
}

// PrimeFlex utilities that might not be included
.w-2 {
  width: 0.5rem;
}

.h-2 {
  height: 0.5rem;
}
</style>
