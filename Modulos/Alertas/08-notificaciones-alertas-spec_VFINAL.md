# Especificación Técnica: Notificaciones y Alertas

## Resumen de Fases

| Fase | Funcionalidad | Estado | Fecha Objetivo |
|------|---------------|--------|----------------|
| **Fase 1** | Reglas de notificación por eventos (CREATE/UPDATE/DELETE) | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Notificaciones de vencimiento con anticipación configurable | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Alertas por umbral y valores específicos (desde tablas y Data Board) | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Centro de notificaciones in-app | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Canal Email (integración existente) | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Preferencias de usuario por canal/prioridad | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Configuración centralizada por perfiles (árbol de entidades) | 🟡 Parcial | 30/Ene/2026 |
| **Fase 1** | Cooldown de alertas (límite de envío por tiempo) | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Horario "No Molestar" configurable | 🟢 Completado | 30/Ene/2026 |
| **Fase 1** | Frecuencia de emails (inmediato/resumen diario/semanal) | 🟢 Completado | 30/Ene/2026 |
| **Fase 2** | WebSocket para tiempo real | 🔴 Pendiente | Q2 2026 |
| **Fase 2** | Canales externos (Slack, Teams, SMS) | 🔴 Pendiente | Q2 2026 |
| **Fase 2** | Alertas compuestas multi-condición | 🔴 Pendiente | Q2 2026 |
| **Fase 2** | Escalamiento automático | 🔴 Pendiente | Q2 2026 |
| **Fase 2** | Digestos/resúmenes periódicos | 🟡 Parcial | Q2 2026 |
| **Fase 2** | Acciones automáticas al disparar alertas | 🔴 Pendiente | Q2 2026 |
| **Fase 2** | Rate limiting (máx 100 notificaciones/hora por usuario) | 🔴 Pendiente | Q2 2026 |

---

## Referencia de Roles del Sistema

| Tipo | Código | Descripción | Acceso a Notificaciones |
|------|--------|-------------|-------------------------|
| **Backoffice** | `BO_ADMIN` | Administrador de backoffice con acceso completo | Configuración de perfiles y reglas |
| **Backoffice** | `BO_ACCOUNT_MANAGER` | Gestor de cuentas de clientes | Sin acceso a configuración |
| **Tenant** | `ADMIN` | Administrador del tenant con acceso completo | Configuración de perfiles y reglas |
| **Tenant** | `AREA_MANAGER` | Gerente de área con acceso operacional | Crear reglas propias, recibir notificaciones |
| **Tenant** | `DIRECTOR` | Director con acceso de lectura | Solo recibir notificaciones |
| **Tenant** | `MANAGER` | Gerente con acceso de lectura | Solo recibir notificaciones |
| **Tenant** | `COORDINATOR` | Coordinador con acceso de lectura | Solo recibir notificaciones |
| **Tenant** | `ANALYST` | Analista con acceso de lectura | Solo recibir notificaciones |

**Nota**: Los roles están definidos en `RoleCode.java` del backend.

---

## 1. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Centro de        │  │ Configuración    │  │ Preferencias de Usuario  │   │
│  │ Notificaciones   │  │ de Reglas        │  │ de Notificaciones        │   │
│  │ (Bandeja)        │  │ (Admin)          │  │                          │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────────┬─────────────┘   │
│           │                     │                          │                 │
│           └─────────────────────┴──────────────────────────┘                 │
│                                 │                                            │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    NotificationService (Angular)                     │    │
│  │  • getInbox() • markAsRead() • getRules() • getPreferences()        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CAPA DE API                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐   │
│  │ NotificationRule   │  │ NotificationInbox  │  │ UserPreferences      │   │
│  │ Controller         │  │ Controller         │  │ Controller           │   │
│  └─────────┬──────────┘  └─────────┬──────────┘  └──────────┬───────────┘   │
│            │                       │                         │               │
│            ▼                       ▼                         ▼               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    NotificationService (Spring)                      │    │
│  │  • evaluateRules() • sendNotification() • processExpirations()      │    │
│  └───────────────────────────────┬─────────────────────────────────────┘    │
│                                  │                                           │
│            ┌─────────────────────┼─────────────────────┐                    │
│            ▼                     ▼                     ▼                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ EmailService    │  │ InAppService    │  │ AlertEngine     │              │
│  │ (existente)     │  │ (nuevo)         │  │ (nuevo)         │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
└───────────┼────────────────────┼────────────────────┼────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌───────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│   SMTP Server     │  │   PostgreSQL    │  │      Scheduler          │
│   (externo)       │  │   notifications │  │   (Spring @Scheduled)   │
└───────────────────┘  └─────────────────┘  └─────────────────────────┘
```

---

## 2. Modelo de Datos

### 2.1 Entidades de Reglas

#### NotificationRule.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "notification_rules")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 30)
    private EntityType entityType;

    @ElementCollection
    @CollectionTable(name = "notification_rule_events",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 30)
    private Set<EventType> eventTypes;

    // Condiciones JSON: [{"field": "riskLevel", "operator": "=", "value": "Critical"}]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<RuleCondition> conditions;

    // Propiedades a monitorear para eventos UPDATE
    @ElementCollection
    @CollectionTable(name = "notification_rule_properties",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "property_name", length = 50)
    private Set<String> monitoredProperties;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recipients", columnDefinition = "jsonb", nullable = false)
    private RecipientConfig recipients;

    @ElementCollection
    @CollectionTable(name = "notification_rule_channels",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Set<NotificationChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RuleStatus status = RuleStatus.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### AlertRule.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "alert_rules")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false, length = 20)
    private MetricType metricType; // COUNT, AVERAGE

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 30)
    private EntityType entityType;

    // Filtros para la métrica: [{"field": "riskLevel", "operator": "=", "value": "Critical"}]
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metric_filters", columnDefinition = "jsonb")
    private List<RuleCondition> metricFilters;

    // Propiedad a monitorear (puede ser estándar o extendida)
    @Column(name = "target_property", length = 100)
    private String targetProperty; // Ej: "riskLevel", "customProperties.fecha_mantenimiento"

    // Indica si la propiedad es extendida (custom property)
    @Column(name = "is_extended_property")
    @Builder.Default
    private Boolean isExtendedProperty = false;

    // Origen de la alerta (para trazabilidad)
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 20)
    private AlertSourceType sourceType; // MANUAL, TABLE_VIEW, DATA_BOARD

    // ID del databoard si aplica
    @Column(name = "databoard_id")
    private Long databoardId;

    @Enumerated(EnumType.STRING)
    @Column(name = "threshold_operator", nullable = false, length = 5)
    private ThresholdOperator thresholdOperator; // GT, LT, GTE, LTE, EQ, NEQ

    @Column(name = "threshold_value")
    private Double thresholdValue;

    // Valor específico a buscar (para alertas de valor específico)
    @Column(name = "target_value", length = 500)
    private String targetValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recipients", columnDefinition = "jsonb", nullable = false)
    private RecipientConfig recipients;

    @ElementCollection
    @CollectionTable(name = "alert_rule_channels",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Set<NotificationChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RuleStatus status = RuleStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false, length = 15)
    @Builder.Default
    private AlertState currentState = AlertState.NORMAL;

    @Column(name = "last_triggered_at")
    private LocalDateTime lastTriggeredAt;

    @Column(name = "current_value")
    private Double currentValue;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### ExpirationRule.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "expiration_rules")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExpirationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 30)
    private EntityType entityType;

    @Column(name = "date_field", nullable = false, length = 50)
    private String dateField; // e.g., "dueDate", "mitigationDate"

    // Días de anticipación: [7, 3, 1]
    @ElementCollection
    @CollectionTable(name = "expiration_rule_days",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "days_before")
    private List<Integer> reminderDays;

    @Column(name = "overdue_enabled")
    @Builder.Default
    private Boolean overdueEnabled = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recipients", columnDefinition = "jsonb", nullable = false)
    private RecipientConfig recipients;

    @ElementCollection
    @CollectionTable(name = "expiration_rule_channels",
                     joinColumns = @JoinColumn(name = "rule_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Set<NotificationChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RuleStatus status = RuleStatus.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

#### NotificationProfile.java (Configuración Centralizada)
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "notification_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    // Eventos habilitados (checkboxes)
    @Column(name = "on_create")
    @Builder.Default
    private Boolean onCreate = false;

    @Column(name = "on_update")
    @Builder.Default
    private Boolean onUpdate = false;

    @Column(name = "on_delete")
    @Builder.Default
    private Boolean onDelete = false;

    @Column(name = "on_expiration")
    @Builder.Default
    private Boolean onExpiration = false;

    // Selección de entidades (árbol jerárquico)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "entity_selections", columnDefinition = "jsonb", nullable = false)
    private List<EntitySelection> entitySelections;

    // Filtros opcionales para entidades
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "entity_filters", columnDefinition = "jsonb")
    private List<RuleCondition> entityFilters;

    // Configuración de destinatarios
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "recipients", columnDefinition = "jsonb", nullable = false)
    private RecipientConfig recipients;

    @ElementCollection
    @CollectionTable(name = "notification_profile_channels",
                     joinColumns = @JoinColumn(name = "profile_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Set<NotificationChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private RuleStatus status = RuleStatus.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// Selección de entidad en el árbol
public record EntitySelection(
    EntityType entityType,      // Tipo de entidad (ASSET, RISK, etc.)
    List<Long> entityIds,       // IDs específicos (null = todos de ese tipo)
    Boolean includeChildren     // Incluir hijos en jerarquía (para Activos/Contenedores)
) implements Serializable {}
```

### 2.2 Entidades de Notificaciones

#### Notification.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
       indexes = {
           @Index(name = "idx_notifications_user_status", columns = {"user_id", "status"}),
           @Index(name = "idx_notifications_created", columns = {"created_at"})
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private EventType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", length = 30)
    private EntityType entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

#### UserNotificationPreferences.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "user_notification_preferences")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserNotificationPreferences {

    @Id
    @Column(name = "user_id")
    private Long userId;

    // Preferencias por prioridad y canal
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "channel_preferences", columnDefinition = "jsonb", nullable = false)
    private ChannelPreferences channelPreferences;

    @Column(name = "quiet_hours_enabled")
    @Builder.Default
    private Boolean quietHoursEnabled = false;

    @Column(name = "quiet_hours_from")
    private LocalTime quietHoursFrom;

    @Column(name = "quiet_hours_to")
    private LocalTime quietHoursTo;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### NotificationLog.java
```java
package com.gcpglobal.sns.notifications.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "notification_logs",
       indexes = {
           @Index(name = "idx_notification_logs_sent", columns = {"sent_at"}),
           @Index(name = "idx_notification_logs_entity", columns = {"entity_type", "entity_id"})
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "alert_id")
    private Long alertId;

    @Column(name = "expiration_rule_id")
    private Long expirationRuleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 30)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "recipients_count")
    private Integer recipientsCount;

    @ElementCollection
    @CollectionTable(name = "notification_log_channels",
                     joinColumns = @JoinColumn(name = "log_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Set<NotificationChannel> channels;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LogStatus status; // SENT, FAILED

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}
```

### 2.3 Enumeraciones

```java
package com.gcpglobal.sns.notifications.entity;

public enum EntityType {
    ORG_CONTAINER,
    ASSET,
    RISK,
    INCIDENT,
    DEFECT,
    ML_RESULT,
    QUESTIONNAIRE,
    PROCESS,
    COMPLIANCE_REVIEW
}

public enum EventType {
    CREATE,
    UPDATE,
    DELETE,
    APPROVAL,
    REJECTION,
    EXPIRATION_REMINDER,
    OVERDUE,
    THRESHOLD_EXCEEDED,
    KPI_CHANGE
}

public enum NotificationChannel {
    EMAIL,
    IN_APP
}

public enum Priority {
    CRITICAL,
    HIGH,
    MEDIUM,
    LOW
}

public enum RuleStatus {
    ACTIVE,
    INACTIVE
}

public enum AlertState {
    NORMAL,
    TRIGGERED
}

public enum NotificationStatus {
    UNREAD,
    READ
}

public enum LogStatus {
    SENT,
    FAILED
}

public enum MetricType {
    COUNT,
    AVERAGE,
    SUM
}

public enum ThresholdOperator {
    GT(">"),
    LT("<"),
    GTE(">="),
    LTE("<="),
    EQ("="),
    NEQ("!=");

    private final String symbol;

    ThresholdOperator(String symbol) {
        this.symbol = symbol;
    }

    public boolean evaluate(double current, double threshold) {
        return switch (this) {
            case GT -> current > threshold;
            case LT -> current < threshold;
            case GTE -> current >= threshold;
            case LTE -> current <= threshold;
            case EQ -> current == threshold;
            case NEQ -> current != threshold;
        };
    }
}

// Origen de la alerta
public enum AlertSourceType {
    MANUAL,         // Creada desde configuración general
    TABLE_VIEW,     // Creada desde vista de tabla de entidad
    DATA_BOARD      // Creada desde Data Board (vista multitabla)
}
```

### 2.4 Value Objects (JSON Embeddables)

```java
package com.gcpglobal.sns.notifications.entity;

import java.io.Serializable;
import java.util.List;

// Configuración de destinatarios
public record RecipientConfig(
    List<Long> userIds,           // IDs de usuarios específicos
    List<String> emails,          // Emails directos
    List<String> dynamicRecipients // Placeholders: {{entity.owner}}, {{entity.assignedTo}}
) implements Serializable {}

// Condición de filtro
public record RuleCondition(
    String field,      // Campo a evaluar: "riskLevel", "status", etc.
    String operator,   // =, !=, >, <, IN
    Object value       // Valor a comparar
) implements Serializable {}

// Preferencias de canal por prioridad
public record ChannelPreferences(
    ChannelConfig critical,
    ChannelConfig high,
    ChannelConfig medium,
    ChannelConfig low
) implements Serializable {}

public record ChannelConfig(
    boolean email,
    boolean inApp
) implements Serializable {}
```

### 2.5 Estructura de Usuarios para Notificaciones

```java
/**
 * ENTIDAD USER (tabla: users)
 *
 * Campos principales para notificaciones:
 * - id (Long): Identificador único
 * - email (String, max 200): Email para envío de notificaciones (UNIQUE, NOT NULL)
 * - username (String, max 100): Nombre de usuario
 * - first_name, last_name (String): Nombre completo
 * - full_name (String, GENERATED): Campo calculado automáticamente
 * - is_active (boolean): Si el usuario está activo
 * - is_backoffice_user (boolean): true = usuario backoffice, false = usuario tenant
 *
 * DIFERENCIA ENTRE USUARIOS:
 * - Usuarios de Tenant (is_backoffice_user = false):
 *   - Acceden a la aplicación del cliente
 *   - Pueden recibir notificaciones de entidades
 *   - Pertenecen a uno o más contenedores organizacionales
 *
 * - Usuarios de Backoffice (is_backoffice_user = true):
 *   - Solo acceden a administración
 *   - NO reciben notificaciones de entidades de tenant
 *   - Pueden configurar reglas/alertas si tienen rol BO_ADMIN
 */

/**
 * MAPEO DE CAMPOS PARA VARIABLES DINÁMICAS:
 *
 * | Variable             | Entidades Soportadas                    | Campo/Relación                        |
 * |---------------------|----------------------------------------|---------------------------------------|
 * | {{entity.owner}}     | ORG_CONTAINER, ASSET, EVENT            | responsible_user_id (FK a users.id)   |
 * |                      | COMPLIANCE_REVIEW                       | createdByUser (User object)           |
 * |                      | QUESTIONNAIRE, PROCESS, ML_RESULT       | N/A (no tienen propietario)           |
 * |                      |                                         |                                       |
 * | {{entity.assignedTo}}| ORG_CONTAINER, ASSET, EVENT            | responsible_user_id (= owner)         |
 * |                      | COMPLIANCE_REVIEW                       | assignedUsers (M:N, tabla compliance_review_user) |
 * |                      |                                         |                                       |
 * | {{entity.createdBy}} | ORG_CONTAINER, ASSET, EVENT            | created_by (Long)                     |
 * |                      | COMPLIANCE_REVIEW, QUESTIONNAIRE        | created_by / createdByUser            |
 * |                      | ML_RESULT                               | requested_by (Long)                   |
 * |                      | PROCESS                                 | N/A (no tiene created_by)             |
 * |                      |                                         |                                       |
 * | {{entity.approvers}} | COMPLIANCE_REVIEW (ÚNICO)               | approvers (M:N, tabla compliance_review_approver) |
 * |                      | Otras entidades                         | N/A (no tienen aprobadores)           |
 *
 * TABLAS RELACIONADAS:
 * - users: Tabla principal de usuarios
 * - compliance_review_user: Usuarios asignados a revisión (M:N)
 * - compliance_review_approver: Aprobadores de revisión (M:N)
 * - compliance_review_external_email: Emails externos (para cuestionarios externos)
 * - users_organization_container: Asignación usuario-contenedor (M:N)
 */

/**
 * OBTENCIÓN DE USUARIOS PARA SELECTOR DE DESTINATARIOS:
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Usuarios activos del tenant (para selector de destinatarios)
    @Query("""
        SELECT u FROM User u
        WHERE u.isActive = true
        AND u.isBackofficeUser = false
        ORDER BY u.lastName, u.firstName
        """)
    Page<User> findActiveTenantUsers(Pageable pageable);

    // Buscar usuarios por nombre o email
    @Query("""
        SELECT u FROM User u
        WHERE u.isActive = true
        AND u.isBackofficeUser = false
        AND (LOWER(u.email) LIKE LOWER(CONCAT('%', :term, '%'))
             OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :term, '%')))
        ORDER BY u.lastName, u.firstName
        """)
    List<User> searchByNameOrEmail(@Param("term") String term);

    // Obtener email de usuario por ID
    @Query("SELECT u.email FROM User u WHERE u.id = :userId")
    Optional<String> findEmailById(@Param("userId") Long userId);
}
```

---

## 3. API Endpoints

### 3.1 Reglas de Notificación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/notifications/rules` | Crear regla de notificación |
| GET | `/api/notifications/rules` | Listar reglas (paginado) |
| GET | `/api/notifications/rules/{id}` | Obtener regla por ID |
| PUT | `/api/notifications/rules/{id}` | Actualizar regla |
| DELETE | `/api/notifications/rules/{id}` | Eliminar regla |
| PATCH | `/api/notifications/rules/{id}/toggle` | Activar/Desactivar |

### 3.2 Alertas por Umbral

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/notifications/alerts` | Crear alerta de umbral |
| GET | `/api/notifications/alerts` | Listar alertas |
| GET | `/api/notifications/alerts/{id}` | Obtener alerta por ID |
| PUT | `/api/notifications/alerts/{id}` | Actualizar alerta |
| DELETE | `/api/notifications/alerts/{id}` | Eliminar alerta |
| GET | `/api/notifications/alerts/triggered` | Alertas actualmente disparadas |
| POST | `/api/notifications/alerts/from-table` | Crear alerta desde vista de tabla |
| POST | `/api/notifications/alerts/from-databoard` | Crear alerta desde Data Board |
| GET | `/api/notifications/alerts/properties/{entityType}` | Obtener propiedades disponibles (incluye extendidas) |

**Nota**: Los endpoints `from-table` y `from-databoard` permiten crear alertas con contexto de vista, incluyendo filtros activos y propiedades extendidas.

### 3.3 Reglas de Vencimiento

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/notifications/expiration-rules` | Crear regla de vencimiento |
| GET | `/api/notifications/expiration-rules` | Listar reglas de vencimiento |
| GET | `/api/notifications/expiration-rules/{id}` | Obtener regla por ID |
| PUT | `/api/notifications/expiration-rules/{id}` | Actualizar regla |
| DELETE | `/api/notifications/expiration-rules/{id}` | Eliminar regla |

### 3.4 Centro de Notificaciones (Inbox)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications/inbox` | Bandeja del usuario (paginado) |
| GET | `/api/notifications/inbox/count` | Contador de no leídas |
| PATCH | `/api/notifications/inbox/{id}/read` | Marcar como leída |
| PATCH | `/api/notifications/inbox/read-all` | Marcar todas como leídas |
| DELETE | `/api/notifications/inbox/{id}` | Eliminar notificación |

### 3.5 Preferencias de Usuario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications/preferences` | Obtener preferencias |
| PUT | `/api/notifications/preferences` | Actualizar preferencias |

### 3.6 Perfiles de Notificación (Configuración Centralizada)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/notifications/profiles` | Crear perfil de notificación |
| GET | `/api/notifications/profiles` | Listar perfiles (paginado) |
| GET | `/api/notifications/profiles/{id}` | Obtener perfil por ID |
| PUT | `/api/notifications/profiles/{id}` | Actualizar perfil |
| DELETE | `/api/notifications/profiles/{id}` | Eliminar perfil |
| PATCH | `/api/notifications/profiles/{id}/toggle` | Activar/Desactivar perfil |
| GET | `/api/notifications/profiles/entities-tree` | Árbol de entidades seleccionables |

**Nota de Acceso**: Estos endpoints requieren rol `ADMIN` (tenant) o `BO_ADMIN` (backoffice).

### 3.7 Usuarios para Destinatarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios del tenant (para selector de destinatarios) |
| GET | `/api/users/search?q={term}` | Buscar usuarios por nombre/email |

**Nota**: Los usuarios de backoffice (`is_backoffice_user = true`) solo pueden gestionar configuración, no recibir notificaciones de entidades de tenant.

### 3.8 Auditoría

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/notifications/logs` | Historial de envíos (paginado) |

---

## 4. Implementación Backend

### 4.1 NotificationRuleService

```java
package com.gcpglobal.sns.notifications.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationRuleService {

    private final NotificationRuleRepository ruleRepository;
    private final NotificationService notificationService;
    private final UserService userService;

    // ==================== CRUD ====================

    @Transactional
    public NotificationRuleDTO createRule(CreateNotificationRuleRequest request) {
        // Validar que entityType soporte los eventos especificados
        validateEventTypesForEntity(request.entityType(), request.eventTypes());

        // Validar condiciones (si aplica)
        if (request.conditions() != null) {
            validateConditions(request.entityType(), request.conditions());
        }

        NotificationRule rule = NotificationRule.builder()
            .name(request.name())
            .entityType(request.entityType())
            .eventTypes(request.eventTypes())
            .conditions(request.conditions())
            .monitoredProperties(request.monitoredProperties())
            .recipients(request.recipients())
            .channels(request.channels())
            .priority(request.priority())
            .status(RuleStatus.ACTIVE)
            .createdBy(SecurityUtils.getCurrentUserId())
            .build();

        return mapper.toDTO(ruleRepository.save(rule));
    }

    public Page<NotificationRuleDTO> getRules(Pageable pageable) {
        return ruleRepository.findAll(pageable).map(mapper::toDTO);
    }

    @Transactional
    public void toggleRule(Long ruleId) {
        NotificationRule rule = findRuleOrThrow(ruleId);
        rule.setStatus(rule.getStatus() == RuleStatus.ACTIVE
                       ? RuleStatus.INACTIVE : RuleStatus.ACTIVE);
        ruleRepository.save(rule);
    }

    // ==================== EVALUACIÓN DE REGLAS ====================

    /**
     * Evalúa todas las reglas activas para un evento dado.
     * Llamado desde listeners de eventos de entidad.
     */
    @Async
    public void evaluateRulesForEvent(EntityEvent event) {
        // 1. Buscar reglas activas que coincidan con entity + eventType
        List<NotificationRule> matchingRules = ruleRepository
            .findByEntityTypeAndEventTypesContainingAndStatus(
                event.entityType(),
                event.eventType(),
                RuleStatus.ACTIVE
            );

        for (NotificationRule rule : matchingRules) {
            try {
                // 2. Evaluar condiciones
                if (!evaluateConditions(rule.getConditions(), event.entity())) {
                    continue; // No cumple condiciones
                }

                // 3. Para UPDATE, verificar si cambiaron las propiedades monitoreadas
                if (event.eventType() == EventType.UPDATE &&
                    rule.getMonitoredProperties() != null &&
                    !rule.getMonitoredProperties().isEmpty()) {

                    if (!hasMonitoredPropertyChanged(rule.getMonitoredProperties(),
                                                     event.oldValues(),
                                                     event.newValues())) {
                        continue;
                    }
                }

                // 4. Resolver destinatarios
                Set<NotificationRecipient> recipients =
                    resolveRecipients(rule.getRecipients(), event.entity());

                // 5. Preparar y enviar notificación
                String title = generateTitle(rule, event);
                String message = generateMessage(rule, event);

                for (NotificationRecipient recipient : recipients) {
                    notificationService.sendNotification(
                        SendNotificationRequest.builder()
                            .userId(recipient.userId())
                            .email(recipient.email())
                            .type(event.eventType())
                            .priority(rule.getPriority())
                            .title(title)
                            .message(message)
                            .entityType(event.entityType())
                            .entityId(event.entityId())
                            .channels(rule.getChannels())
                            .ruleId(rule.getId())
                            .build()
                    );
                }

                log.info("Rule {} triggered for {} {} - {} recipients",
                         rule.getId(), event.entityType(), event.entityId(),
                         recipients.size());

            } catch (Exception e) {
                log.error("Error evaluating rule {} for entity {}: {}",
                          rule.getId(), event.entityId(), e.getMessage());
            }
        }
    }

    private boolean evaluateConditions(List<RuleCondition> conditions, Object entity) {
        if (conditions == null || conditions.isEmpty()) {
            return true; // Sin condiciones = siempre true
        }

        for (RuleCondition condition : conditions) {
            Object fieldValue = getFieldValue(entity, condition.field());
            if (!evaluateCondition(condition, fieldValue)) {
                return false; // AND implícito
            }
        }
        return true;
    }

    private boolean evaluateCondition(RuleCondition condition, Object fieldValue) {
        return switch (condition.operator()) {
            case "=" -> Objects.equals(fieldValue, condition.value());
            case "!=" -> !Objects.equals(fieldValue, condition.value());
            case ">" -> compareNumbers(fieldValue, condition.value()) > 0;
            case "<" -> compareNumbers(fieldValue, condition.value()) < 0;
            case "IN" -> {
                if (condition.value() instanceof List<?> list) {
                    yield list.contains(fieldValue);
                }
                yield false;
            }
            default -> {
                log.warn("Unknown operator: {}", condition.operator());
                yield false;
            }
        };
    }

    private Set<NotificationRecipient> resolveRecipients(RecipientConfig config, Object entity) {
        Set<NotificationRecipient> recipients = new HashSet<>();

        // 1. Usuarios específicos por ID
        if (config.userIds() != null) {
            for (Long userId : config.userIds()) {
                var user = userService.findById(userId);
                if (user.isPresent()) {
                    recipients.add(new NotificationRecipient(userId, user.get().getEmail()));
                }
            }
        }

        // 2. Emails directos
        if (config.emails() != null) {
            for (String email : config.emails()) {
                recipients.add(new NotificationRecipient(null, email));
            }
        }

        // 3. Destinatarios dinámicos
        if (config.dynamicRecipients() != null) {
            for (String placeholder : config.dynamicRecipients()) {
                recipients.addAll(resolveDynamicRecipient(placeholder, entity));
            }
        }

        return recipients;
    }

    /**
     * Resuelve un placeholder dinámico según el tipo de entidad.
     *
     * MAPEO DE CAMPOS POR ENTIDAD:
     *
     * | Entidad          | {{entity.owner}}      | {{entity.assignedTo}}        | {{entity.createdBy}} | {{entity.approvers}}     |
     * |------------------|----------------------|------------------------------|----------------------|--------------------------|
     * | ORG_CONTAINER    | responsible_user_id  | responsible_user_id          | created_by           | N/A                      |
     * | ASSET            | responsible_user_id  | responsible_user_id          | created_by           | N/A                      |
     * | RISK/INCIDENT    | responsible_user_id  | responsible_user_id          | created_by           | N/A                      |
     * | DEFECT           | responsible_user_id  | responsible_user_id          | created_by           | N/A                      |
     * | COMPLIANCE_REVIEW| createdBy (User)     | assignedUsers (M:N)          | createdBy            | approvers (M:N)          |
     * | QUESTIONNAIRE    | N/A                  | N/A                          | created_by           | N/A                      |
     * | PROCESS          | N/A                  | N/A                          | N/A                  | N/A                      |
     * | ML_RESULT        | N/A                  | N/A                          | requested_by         | N/A                      |
     *
     * Tablas involucradas:
     * - users: id, email, first_name, last_name, is_backoffice_user
     * - compliance_review_user: compliance_review_id, user_id (asignados)
     * - compliance_review_approver: compliance_review_id, user_id (aprobadores)
     */
    private Set<NotificationRecipient> resolveDynamicRecipient(String placeholder, Object entity) {
        Set<NotificationRecipient> recipients = new HashSet<>();

        switch (placeholder) {
            case "{{entity.owner}}" -> {
                // Campo: responsible_user_id (ORG_CONTAINER, ASSET, EVENT)
                // Campo: createdBy (COMPLIANCE_REVIEW - User object)
                Long ownerId = resolveOwnerId(entity);
                addRecipientById(ownerId, recipients);
            }
            case "{{entity.assignedTo}}" -> {
                // Campo: responsible_user_id (ORG_CONTAINER, ASSET, EVENT)
                // Tabla: compliance_review_user (COMPLIANCE_REVIEW - relación M:N)
                resolveAssignedTo(entity, recipients);
            }
            case "{{entity.createdBy}}" -> {
                // Campo: created_by (todas las entidades excepto Process)
                // Campo: requested_by (ML_RESULT)
                Long creatorId = resolveCreatedById(entity);
                addRecipientById(creatorId, recipients);
            }
            case "{{entity.approvers}}" -> {
                // Tabla: compliance_review_approver (SOLO COMPLIANCE_REVIEW)
                if (entity instanceof ComplianceReview review) {
                    for (ComplianceReviewApprover approver : review.getApprovers()) {
                        User user = approver.getUser();
                        recipients.add(new NotificationRecipient(user.getId(), user.getEmail()));
                    }
                }
            }
        }

        return recipients;
    }

    private Long resolveOwnerId(Object entity) {
        return switch (entity) {
            case OrganizationContainer c -> c.getResponsibleUserId();
            case Asset a -> a.getResponsibleUserId();
            case Event e -> e.getResponsibleUserId();
            case ComplianceReview cr -> cr.getCreatedByUser() != null
                                        ? cr.getCreatedByUser().getId() : null;
            default -> null;
        };
    }

    private Long resolveCreatedById(Object entity) {
        return switch (entity) {
            case OrganizationContainer c -> c.getCreatedBy();
            case Asset a -> a.getCreatedBy();
            case Event e -> e.getCreatedBy();
            case ComplianceReview cr -> cr.getCreatedByUser() != null
                                        ? cr.getCreatedByUser().getId() : null;
            case QuestionnaireTemplate q -> q.getCreatedBy();
            case ResultML r -> r.getRequestedBy();
            default -> null;
        };
    }

    private void resolveAssignedTo(Object entity, Set<NotificationRecipient> recipients) {
        switch (entity) {
            case OrganizationContainer c -> addRecipientById(c.getResponsibleUserId(), recipients);
            case Asset a -> addRecipientById(a.getResponsibleUserId(), recipients);
            case Event e -> addRecipientById(e.getResponsibleUserId(), recipients);
            case ComplianceReview cr -> {
                // ComplianceReview tiene múltiples usuarios asignados (M:N)
                for (ComplianceReviewUser assignedUser : cr.getAssignedUsers()) {
                    User user = assignedUser.getUser();
                    recipients.add(new NotificationRecipient(user.getId(), user.getEmail()));
                }
            }
            default -> {}
        }
    }

    private void addRecipientById(Long userId, Set<NotificationRecipient> recipients) {
        if (userId != null) {
            userService.findById(userId).ifPresent(user ->
                recipients.add(new NotificationRecipient(user.getId(), user.getEmail()))
            );
        }
    }
}
```

### 4.2 AlertService

```java
package com.gcpglobal.sns.notifications.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final NotificationService notificationService;
    private final MetricCalculator metricCalculator;

    /**
     * Evalúa todas las alertas activas.
     * Ejecutado por scheduler cada 5 minutos.
     */
    @Scheduled(fixedRate = 300000) // 5 minutos
    @Transactional
    public void evaluateAllAlerts() {
        List<AlertRule> activeAlerts = alertRuleRepository
            .findByStatus(RuleStatus.ACTIVE);

        for (AlertRule alert : activeAlerts) {
            try {
                evaluateAlert(alert);
            } catch (Exception e) {
                log.error("Error evaluating alert {}: {}", alert.getId(), e.getMessage());
            }
        }
    }

    private void evaluateAlert(AlertRule alert) {
        // 1. Calcular métrica actual
        double currentValue = metricCalculator.calculate(
            alert.getMetricType(),
            alert.getEntityType(),
            alert.getMetricFilters()
        );

        alert.setCurrentValue(currentValue);

        // 2. Evaluar umbral
        boolean thresholdExceeded = alert.getThresholdOperator()
            .evaluate(currentValue, alert.getThresholdValue());

        AlertState previousState = alert.getCurrentState();

        if (thresholdExceeded && previousState == AlertState.NORMAL) {
            // Transición: NORMAL -> TRIGGERED
            alert.setCurrentState(AlertState.TRIGGERED);
            alert.setLastTriggeredAt(LocalDateTime.now());

            // Enviar notificaciones
            sendAlertNotification(alert, currentValue);

            log.info("Alert {} triggered: {} {} {} (current: {})",
                     alert.getName(),
                     alert.getMetricType(),
                     alert.getThresholdOperator().name(),
                     alert.getThresholdValue(),
                     currentValue);

        } else if (!thresholdExceeded && previousState == AlertState.TRIGGERED) {
            // Transición: TRIGGERED -> NORMAL
            alert.setCurrentState(AlertState.NORMAL);

            // Opcional: notificar resolución
            log.info("Alert {} resolved: value now {}", alert.getName(), currentValue);
        }

        alertRuleRepository.save(alert);
    }

    private void sendAlertNotification(AlertRule alert, double currentValue) {
        String title = String.format("Alerta: %s", alert.getName());
        String message = String.format(
            "El umbral de %s ha sido superado. Valor actual: %.2f (Umbral: %s %.2f)",
            alert.getName(),
            currentValue,
            alert.getThresholdOperator().getSymbol(),
            alert.getThresholdValue()
        );

        Set<NotificationRecipient> recipients =
            notificationRuleService.resolveRecipients(alert.getRecipients(), null);

        for (NotificationRecipient recipient : recipients) {
            notificationService.sendNotification(
                SendNotificationRequest.builder()
                    .userId(recipient.userId())
                    .email(recipient.email())
                    .type(EventType.THRESHOLD_EXCEEDED)
                    .priority(Priority.HIGH)
                    .title(title)
                    .message(message)
                    .entityType(alert.getEntityType())
                    .channels(alert.getChannels())
                    .alertId(alert.getId())
                    .build()
            );
        }
    }
}
```

### 4.3 MetricCalculator

```java
package com.gcpglobal.sns.notifications.service;

@Component
@RequiredArgsConstructor
public class MetricCalculator {

    private final EntityManager entityManager;

    /**
     * Calcula una métrica sobre una entidad con filtros.
     */
    public double calculate(MetricType metricType, EntityType entityType,
                            List<RuleCondition> filters) {

        String tableName = getTableName(entityType);

        StringBuilder sql = new StringBuilder();

        switch (metricType) {
            case COUNT -> sql.append("SELECT COUNT(*) FROM ").append(tableName);
            case AVERAGE -> {
                // Para AVERAGE necesitamos saber qué campo promediar
                // Por ahora asumimos campos comunes
                String numericField = getDefaultNumericField(entityType);
                sql.append("SELECT COALESCE(AVG(").append(numericField).append("), 0) FROM ")
                   .append(tableName);
            }
        }

        // Agregar filtros
        if (filters != null && !filters.isEmpty()) {
            sql.append(" WHERE ");
            List<String> conditions = new ArrayList<>();
            for (RuleCondition filter : filters) {
                conditions.add(buildCondition(filter));
            }
            sql.append(String.join(" AND ", conditions));
        }

        Query query = entityManager.createNativeQuery(sql.toString());
        Object result = query.getSingleResult();

        if (result instanceof Number number) {
            return number.doubleValue();
        }
        return 0.0;
    }

    private String getTableName(EntityType entityType) {
        return switch (entityType) {
            case ORG_CONTAINER -> "org_containers";
            case ASSET -> "assets";
            case RISK, INCIDENT, DEFECT -> "events";
            case ML_RESULT -> "result_ml";
            case QUESTIONNAIRE -> "questionnaire_templates";
            case PROCESS -> "processes";
            case COMPLIANCE_REVIEW -> "compliance_reviews";
        };
    }

    private String getDefaultNumericField(EntityType entityType) {
        return switch (entityType) {
            case RISK, INCIDENT, DEFECT -> "residual_risk";
            case COMPLIANCE_REVIEW -> "overall_score";
            default -> "id"; // Fallback
        };
    }
}
```

### 4.3.1 ExtendedPropertyService (Acceso a Propiedades Extendidas)

```java
package com.gcpglobal.sns.notifications.service;

/**
 * Servicio para acceder a propiedades extendidas de cada tipo de entidad.
 *
 * ESTRUCTURA DE PROPIEDADES EXTENDIDAS:
 *
 * 1. CONTENEDORES (ORG_CONTAINER):
 *    - Definición: ContainerPropertyDefinition (container_property_definitions)
 *    - Valores: ContainerPropertyValue (container_property_values)
 *    - Tipos: TEXT, NUMBER, BOOLEAN, DATE, EMAIL, URL, PHONE
 *
 * 2. ACTIVOS (ASSET):
 *    - Definición: AssetType -> AssetTypeProperty (organization_component_asset_type_property)
 *    - Valores: AssetPropertyValue (organization_component_asset_property_value)
 *    - Grupos: AssetTypePropertyGroup
 *    - Opciones: PropertyOption (para CATALOG)
 *
 * 3. EVENTOS - RIESGOS/INCIDENTES/DEFECTOS (RISK/INCIDENT/DEFECT):
 *    - Definición: EventSubType -> EventSubTypeProperty (event_subtype_property)
 *    - Valores: EventPropertyValue (event_property_value)
 *    - Grupos: EventSubTypePropertyGroup
 *    - Opciones: EventSubTypePropertyOption (para CATALOG)
 *    - Nota: EventPropertyValue tiene columnas tipadas (textValue, numericValue, booleanValue, etc.)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExtendedPropertyService {

    private final ContainerPropertyDefinitionRepository containerPropDefRepository;
    private final AssetTypePropertyRepository assetTypePropRepository;
    private final EventSubTypePropertyRepository eventSubTypePropRepository;
    private final EntityManager entityManager;

    /**
     * Obtiene todas las propiedades disponibles para alertas de un tipo de entidad.
     * Incluye propiedades estándar y extendidas.
     */
    public List<AlertablePropertyDTO> getAlertableProperties(EntityType entityType) {
        List<AlertablePropertyDTO> properties = new ArrayList<>();

        // 1. Agregar propiedades estándar de la entidad
        properties.addAll(getStandardProperties(entityType));

        // 2. Agregar propiedades extendidas según tipo
        switch (entityType) {
            case ORG_CONTAINER -> properties.addAll(getContainerExtendedProperties());
            case ASSET -> properties.addAll(getAssetExtendedProperties());
            case RISK, INCIDENT, DEFECT -> properties.addAll(getEventExtendedProperties(entityType));
            default -> {} // Otras entidades sin propiedades extendidas
        }

        return properties;
    }

    /**
     * Contenedores: propiedades de ContainerPropertyDefinition
     */
    private List<AlertablePropertyDTO> getContainerExtendedProperties() {
        return containerPropDefRepository.findByIsActiveTrue().stream()
            .map(prop -> AlertablePropertyDTO.builder()
                .code("customProperties." + prop.getCode())
                .label(prop.getName())
                .dataType(mapContainerDataType(prop.getDataType()))
                .isExtended(true)
                .sourceType(ExtendedPropertySource.CONTAINER_PROPERTY_DEF)
                .sourceTypeId(prop.getId())
                .build())
            .toList();
    }

    /**
     * Activos: propiedades de AssetTypeProperty agrupadas por AssetType
     */
    private List<AlertablePropertyDTO> getAssetExtendedProperties() {
        return assetTypePropRepository.findByIsActiveTrue().stream()
            .map(prop -> AlertablePropertyDTO.builder()
                .code("propertyValues." + prop.getCode())
                .label(prop.getProperty())
                .dataType(mapPropertyDataType(prop.getPropertyDataType()))
                .isExtended(true)
                .sourceType(ExtendedPropertySource.ASSET_TYPE_PROPERTY)
                .sourceTypeId(prop.getAssetType().getId())
                .sourceTypeName(prop.getAssetType().getAssetType())
                .options(prop.getPropertyOptions().stream()
                    .map(opt -> new PropertyOptionDTO(opt.getId(), opt.getCode(), opt.getOption()))
                    .toList())
                .build())
            .toList();
    }

    /**
     * Eventos (Riesgos/Incidentes/Defectos): propiedades de EventSubTypeProperty
     */
    private List<AlertablePropertyDTO> getEventExtendedProperties(EntityType entityType) {
        String eventTypeCode = switch (entityType) {
            case RISK -> "RISK";
            case INCIDENT -> "INCIDENT";
            case DEFECT -> "DEFECT";
            default -> throw new IllegalArgumentException("Not an event type: " + entityType);
        };

        return eventSubTypePropRepository.findByEventSubType_EventType_CodeAndIsActiveTrue(eventTypeCode)
            .stream()
            .map(prop -> AlertablePropertyDTO.builder()
                .code("propertyValues." + prop.getCode())
                .label(prop.getProperty())
                .dataType(mapPropertyDataType(prop.getPropertyDataType()))
                .isExtended(true)
                .sourceType(ExtendedPropertySource.EVENT_SUBTYPE_PROPERTY)
                .sourceTypeId(prop.getEventSubType().getId())
                .sourceTypeName(prop.getEventSubType().getName())
                .options(prop.getPropertyOptions().stream()
                    .map(opt -> new PropertyOptionDTO(opt.getId(), opt.getCode(), opt.getOption()))
                    .toList())
                .build())
            .toList();
    }

    /**
     * Obtiene el valor de una propiedad extendida para una entidad específica.
     * Usado por MetricCalculator para evaluar alertas con propiedades extendidas.
     */
    public Object getExtendedPropertyValue(EntityType entityType, Long entityId, String propertyCode) {
        return switch (entityType) {
            case ORG_CONTAINER -> getContainerPropertyValue(entityId, propertyCode);
            case ASSET -> getAssetPropertyValue(entityId, propertyCode);
            case RISK, INCIDENT, DEFECT -> getEventPropertyValue(entityId, propertyCode);
            default -> null;
        };
    }

    private Object getContainerPropertyValue(Long containerId, String propertyCode) {
        // Query: JOIN container_property_values cpv
        //        ON cpv.container_id = :containerId
        //        JOIN container_property_definitions cpd ON cpv.property_definition_id = cpd.id
        //        WHERE cpd.code = :propertyCode
        String sql = """
            SELECT cpv.value FROM container_property_values cpv
            JOIN container_property_definitions cpd ON cpv.property_definition_id = cpd.id
            WHERE cpv.container_id = :containerId AND cpd.code = :code
            """;
        return entityManager.createNativeQuery(sql)
            .setParameter("containerId", containerId)
            .setParameter("code", propertyCode.replace("customProperties.", ""))
            .getSingleResult();
    }

    private Object getAssetPropertyValue(Long assetId, String propertyCode) {
        // Query: JOIN organization_component_asset_property_value apv
        //        ON apv.asset_id = :assetId
        //        JOIN organization_component_asset_type_property atp ON apv.asset_type_property_id = atp.id
        //        WHERE atp.code = :propertyCode
        String sql = """
            SELECT apv.value_text FROM organization_component_asset_property_value apv
            JOIN organization_component_asset_type_property atp ON apv.asset_type_property_id = atp.id
            WHERE apv.asset_id = :assetId AND atp.code = :code
            """;
        return entityManager.createNativeQuery(sql)
            .setParameter("assetId", assetId)
            .setParameter("code", propertyCode.replace("propertyValues.", ""))
            .getSingleResult();
    }

    private Object getEventPropertyValue(Long eventId, String propertyCode) {
        // EventPropertyValue tiene múltiples columnas tipadas
        String code = propertyCode.replace("propertyValues.", "");
        String sql = """
            SELECT COALESCE(epv.text_value, epv.numeric_value::text, epv.boolean_value::text,
                           epv.date_value::text, epv.datetime_value::text)
            FROM event_property_value epv
            JOIN event_subtype_property esp ON epv.event_subtype_property_id = esp.id
            WHERE epv.event_id = :eventId AND esp.code = :code
            """;
        return entityManager.createNativeQuery(sql)
            .setParameter("eventId", eventId)
            .setParameter("code", code)
            .getSingleResult();
    }
}

// DTOs
public record AlertablePropertyDTO(
    String code,
    String label,
    String dataType,
    boolean isExtended,
    ExtendedPropertySource sourceType,
    Integer sourceTypeId,
    String sourceTypeName,
    List<PropertyOptionDTO> options
) {
    @Builder public AlertablePropertyDTO {}
}

public record PropertyOptionDTO(Long id, String code, String label) {}

public enum ExtendedPropertySource {
    STANDARD,
    CONTAINER_PROPERTY_DEF,
    ASSET_TYPE_PROPERTY,
    EVENT_SUBTYPE_PROPERTY
}
```

### 4.4 ExpirationService

```java
package com.gcpglobal.sns.notifications.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpirationService {

    private final ExpirationRuleRepository expirationRuleRepository;
    private final NotificationService notificationService;
    private final EntityManager entityManager;

    /**
     * Procesa vencimientos y recordatorios.
     * Ejecutado diariamente a las 00:00 UTC.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional(readOnly = true)
    public void processExpirations() {
        List<ExpirationRule> activeRules = expirationRuleRepository
            .findByStatus(RuleStatus.ACTIVE);

        LocalDate today = LocalDate.now();

        for (ExpirationRule rule : activeRules) {
            try {
                processExpirationRule(rule, today);
            } catch (Exception e) {
                log.error("Error processing expiration rule {}: {}",
                          rule.getId(), e.getMessage());
            }
        }
    }

    private void processExpirationRule(ExpirationRule rule, LocalDate today) {
        String tableName = getTableName(rule.getEntityType());
        String dateField = rule.getDateField();

        // 1. Procesar recordatorios anticipados
        for (Integer daysBefore : rule.getReminderDays()) {
            LocalDate targetDate = today.plusDays(daysBefore);

            List<Object[]> expiringEntities = findEntitiesByDate(
                tableName, dateField, targetDate, rule.getEntityType()
            );

            for (Object[] entity : expiringEntities) {
                Long entityId = ((Number) entity[0]).longValue();
                sendExpirationReminder(rule, entityId, daysBefore);
            }
        }

        // 2. Procesar vencidos (si está habilitado)
        if (Boolean.TRUE.equals(rule.getOverdueEnabled())) {
            List<Object[]> overdueEntities = findOverdueEntities(
                tableName, dateField, today, rule.getEntityType()
            );

            for (Object[] entity : overdueEntities) {
                Long entityId = ((Number) entity[0]).longValue();
                LocalDate dueDate = (LocalDate) entity[1];
                long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);

                sendOverdueNotification(rule, entityId, daysOverdue);
            }
        }
    }

    private void sendExpirationReminder(ExpirationRule rule, Long entityId, int daysBefore) {
        String urgency = daysBefore <= 1 ? "ÚLTIMO DÍA: " :
                        daysBefore <= 3 ? "URGENTE: " : "";

        String title = String.format("%sVence en %d día%s",
                                     urgency, daysBefore, daysBefore > 1 ? "s" : "");
        String message = String.format(
            "El/La %s con ID %d vence en %d día%s. Por favor tome las acciones necesarias.",
            rule.getEntityType().name().toLowerCase(),
            entityId,
            daysBefore,
            daysBefore > 1 ? "s" : ""
        );

        Priority priority = daysBefore <= 1 ? Priority.CRITICAL :
                           daysBefore <= 3 ? Priority.HIGH : Priority.MEDIUM;

        sendNotificationForRule(rule, EventType.EXPIRATION_REMINDER,
                               title, message, entityId, priority);
    }

    private void sendOverdueNotification(ExpirationRule rule, Long entityId, long daysOverdue) {
        String title = String.format("VENCIDO: %s %d",
                                     rule.getEntityType().name(), entityId);
        String message = String.format(
            "El/La %s con ID %d está vencido hace %d día%s.",
            rule.getEntityType().name().toLowerCase(),
            entityId,
            daysOverdue,
            daysOverdue > 1 ? "s" : ""
        );

        sendNotificationForRule(rule, EventType.OVERDUE,
                               title, message, entityId, Priority.CRITICAL);
    }

    private void sendNotificationForRule(ExpirationRule rule, EventType eventType,
                                         String title, String message,
                                         Long entityId, Priority priority) {
        Set<NotificationRecipient> recipients =
            notificationRuleService.resolveRecipients(rule.getRecipients(),
                                                      loadEntity(rule.getEntityType(), entityId));

        for (NotificationRecipient recipient : recipients) {
            notificationService.sendNotification(
                SendNotificationRequest.builder()
                    .userId(recipient.userId())
                    .email(recipient.email())
                    .type(eventType)
                    .priority(priority)
                    .title(title)
                    .message(message)
                    .entityType(rule.getEntityType())
                    .entityId(entityId)
                    .channels(rule.getChannels())
                    .expirationRuleId(rule.getId())
                    .build()
            );
        }
    }
}
```

### 4.5 NotificationService (Core)

```java
package com.gcpglobal.sns.notifications.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationLogRepository logRepository;
    private final UserPreferencesRepository preferencesRepository;
    private final EmailService emailService;

    /**
     * Envía una notificación respetando preferencias del usuario.
     */
    @Transactional
    public void sendNotification(SendNotificationRequest request) {
        // 1. Obtener preferencias del usuario
        UserNotificationPreferences prefs = null;
        if (request.userId() != null) {
            prefs = preferencesRepository.findById(request.userId()).orElse(null);
        }

        // 2. Determinar canales efectivos
        Set<NotificationChannel> effectiveChannels =
            filterChannelsByPreferences(request.channels(), request.priority(), prefs);

        if (effectiveChannels.isEmpty()) {
            log.debug("No channels enabled for user {} with priority {}",
                      request.userId(), request.priority());
            return;
        }

        // 3. Verificar horario "No molestar" (excepto CRITICAL)
        if (request.priority() != Priority.CRITICAL &&
            prefs != null &&
            isInQuietHours(prefs)) {
            log.debug("User {} in quiet hours, skipping non-critical notification",
                      request.userId());
            return;
        }

        // 4. Enviar por cada canal
        boolean success = true;
        String errorMessage = null;

        try {
            for (NotificationChannel channel : effectiveChannels) {
                switch (channel) {
                    case IN_APP -> sendInAppNotification(request);
                    case EMAIL -> sendEmailNotification(request);
                }
            }
        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            log.error("Error sending notification: {}", e.getMessage());
        }

        // 5. Registrar en log
        logNotification(request, effectiveChannels, success, errorMessage);
    }

    private void sendInAppNotification(SendNotificationRequest request) {
        if (request.userId() == null) {
            return; // In-app requiere userId
        }

        Notification notification = Notification.builder()
            .userId(request.userId())
            .type(request.type())
            .priority(request.priority())
            .title(request.title())
            .message(request.message())
            .entityType(request.entityType())
            .entityId(request.entityId())
            .actionUrl(generateActionUrl(request.entityType(), request.entityId()))
            .status(NotificationStatus.UNREAD)
            .build();

        notificationRepository.save(notification);
        log.info("In-app notification created for user {}", request.userId());
    }

    private void sendEmailNotification(SendNotificationRequest request) {
        if (request.email() == null) {
            log.warn("No email address for notification");
            return;
        }

        String htmlContent = buildEmailContent(request);
        emailService.sendEmail(request.email(), request.title(), htmlContent);
        log.info("Email notification sent to {}", request.email());
    }

    private String buildEmailContent(SendNotificationRequest request) {
        // Template simple - en producción usar Thymeleaf templates
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #333;">%s</h2>
                <p>%s</p>
                %s
                <hr/>
                <small style="color: #666;">
                    Esta notificación fue generada automáticamente por ORCA SNS.
                </small>
            </body>
            </html>
            """,
            request.title(),
            request.message(),
            request.entityId() != null ?
                String.format("<a href=\"%s\">Ver en el sistema</a>",
                              generateActionUrl(request.entityType(), request.entityId())) : ""
        );
    }

    private boolean isInQuietHours(UserNotificationPreferences prefs) {
        if (!Boolean.TRUE.equals(prefs.getQuietHoursEnabled())) {
            return false;
        }

        LocalTime now = LocalTime.now();
        LocalTime from = prefs.getQuietHoursFrom();
        LocalTime to = prefs.getQuietHoursTo();

        if (from == null || to == null) {
            return false;
        }

        // Manejar rango que cruza medianoche
        if (from.isBefore(to)) {
            return !now.isBefore(from) && now.isBefore(to);
        } else {
            return !now.isBefore(from) || now.isBefore(to);
        }
    }

    // ==================== INBOX ====================

    public Page<NotificationDTO> getInbox(Long userId,
                                          NotificationStatus status,
                                          Pageable pageable) {
        Page<Notification> notifications;
        if (status != null) {
            notifications = notificationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, status, pageable);
        } else {
            notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
        return notifications.map(mapper::toDTO);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(() -> new NotFoundException("Notification not found"));

        notification.setStatus(NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository
            .findByIdAndUserId(notificationId, userId)
            .orElseThrow(() -> new NotFoundException("Notification not found"));

        notificationRepository.delete(notification);
    }
}
```

### 4.6 Event Listeners (Integración con otras entidades)

```java
package com.gcpglobal.sns.notifications.listener;

@Component
@RequiredArgsConstructor
@Slf4j
public class EntityEventListener {

    private final NotificationRuleService notificationRuleService;

    /**
     * Listener para eventos de Asset.
     */
    @TransactionalEventListener
    public void handleAssetEvent(AssetEntityEvent event) {
        notificationRuleService.evaluateRulesForEvent(
            EntityEvent.builder()
                .entityType(EntityType.ASSET)
                .eventType(mapEventType(event.type()))
                .entityId(event.assetId())
                .entity(event.asset())
                .oldValues(event.oldValues())
                .newValues(event.newValues())
                .build()
        );
    }

    /**
     * Listener para eventos de Risk/Incident/Defect.
     */
    @TransactionalEventListener
    public void handleEventEntityEvent(EventEntityEvent event) {
        EntityType entityType = switch (event.eventTypeCode()) {
            case RISK -> EntityType.RISK;
            case INCIDENT -> EntityType.INCIDENT;
            default -> EntityType.DEFECT;
        };

        notificationRuleService.evaluateRulesForEvent(
            EntityEvent.builder()
                .entityType(entityType)
                .eventType(mapEventType(event.type()))
                .entityId(event.eventId())
                .entity(event.eventEntity())
                .oldValues(event.oldValues())
                .newValues(event.newValues())
                .build()
        );
    }

    /**
     * Listener para eventos de ComplianceReview (aprobación/rechazo).
     */
    @TransactionalEventListener
    public void handleComplianceReviewEvent(ComplianceReviewEvent event) {
        EventType eventType = switch (event.type()) {
            case APPROVED -> EventType.APPROVAL;
            case REJECTED -> EventType.REJECTION;
            case CREATED -> EventType.CREATE;
            case UPDATED -> EventType.UPDATE;
            case DELETED -> EventType.DELETE;
        };

        notificationRuleService.evaluateRulesForEvent(
            EntityEvent.builder()
                .entityType(EntityType.COMPLIANCE_REVIEW)
                .eventType(eventType)
                .entityId(event.reviewId())
                .entity(event.review())
                .build()
        );
    }

    /**
     * Listener para cambios significativos en KPIs de procesos.
     */
    @TransactionalEventListener
    public void handleProcessKPIChange(ProcessKPIChangeEvent event) {
        // Solo notificar si cambio > 20%
        double changePercent = Math.abs(
            (event.newValue() - event.oldValue()) / event.oldValue() * 100
        );

        if (changePercent >= 20) {
            notificationRuleService.evaluateRulesForEvent(
                EntityEvent.builder()
                    .entityType(EntityType.PROCESS)
                    .eventType(EventType.KPI_CHANGE)
                    .entityId(event.processId())
                    .entity(event.process())
                    .oldValues(Map.of(event.kpiName(), event.oldValue()))
                    .newValues(Map.of(event.kpiName(), event.newValue()))
                    .build()
            );
        }
    }

    private EventType mapEventType(CrudEventType type) {
        return switch (type) {
            case CREATED -> EventType.CREATE;
            case UPDATED -> EventType.UPDATE;
            case DELETED -> EventType.DELETE;
        };
    }
}
```

### 4.7 NotificationProfileService (Configuración Centralizada)

```java
package com.gcpglobal.sns.notifications.service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProfileService {

    private final NotificationProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final AssetRepository assetRepository;
    private final EventRepository eventRepository;
    private final OrgContainerRepository containerRepository;

    // ==================== CRUD ====================

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'BO_ADMIN')")
    public NotificationProfileDTO createProfile(CreateNotificationProfileRequest request) {
        validateEntitySelections(request.entitySelections());

        NotificationProfile profile = NotificationProfile.builder()
            .name(request.name())
            .description(request.description())
            .onCreate(request.events().onCreate())
            .onUpdate(request.events().onUpdate())
            .onDelete(request.events().onDelete())
            .onExpiration(request.events().onExpiration())
            .entitySelections(request.entitySelections())
            .entityFilters(request.entityFilters())
            .recipients(request.recipients())
            .channels(request.channels())
            .status(RuleStatus.ACTIVE)
            .createdBy(SecurityUtils.getCurrentUserId())
            .build();

        return mapper.toDTO(profileRepository.save(profile));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'BO_ADMIN')")
    public Page<NotificationProfileDTO> getProfiles(Pageable pageable) {
        return profileRepository.findAll(pageable).map(mapper::toDTO);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'BO_ADMIN')")
    public void toggleProfile(Long profileId) {
        NotificationProfile profile = findProfileOrThrow(profileId);
        profile.setStatus(profile.getStatus() == RuleStatus.ACTIVE
                         ? RuleStatus.INACTIVE : RuleStatus.ACTIVE);
        profileRepository.save(profile);
    }

    // ==================== ÁRBOL DE ENTIDADES ====================

    /**
     * Retorna árbol jerárquico de entidades seleccionables.
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'BO_ADMIN')")
    public EntityTreeResponse getEntitiesTree() {
        List<EntityTreeNode> tree = new ArrayList<>();

        // Contenedores Organizacionales
        tree.add(buildContainersTree());

        // Activos (árbol jerárquico)
        tree.add(buildAssetsTree());

        // Riesgos
        tree.add(buildEventsNode(EntityType.RISK, "Riesgos"));

        // Incidentes
        tree.add(buildEventsNode(EntityType.INCIDENT, "Incidentes"));

        // Defectos
        tree.add(buildEventsNode(EntityType.DEFECT, "Defectos"));

        // Cumplimiento
        tree.add(buildComplianceNode());

        // Procesos
        tree.add(buildProcessesNode());

        // Cuestionarios
        tree.add(buildQuestionnairesNode());

        // Resultados ML
        tree.add(buildMLResultsNode());

        return new EntityTreeResponse(tree);
    }

    private EntityTreeNode buildContainersTree() {
        List<OrgContainer> containers = containerRepository.findAllActive();
        List<EntityTreeNode> children = containers.stream()
            .map(c -> new EntityTreeNode(c.getId().toString(), c.getName(),
                                         EntityType.ORG_CONTAINER, null, false))
            .toList();

        return new EntityTreeNode("org_containers", "Contenedores Organizacionales",
                                  EntityType.ORG_CONTAINER, children, true);
    }

    private EntityTreeNode buildAssetsTree() {
        List<Asset> rootAssets = assetRepository.findRootAssets();
        List<EntityTreeNode> children = rootAssets.stream()
            .map(this::buildAssetNode)
            .toList();

        return new EntityTreeNode("assets", "Activos", EntityType.ASSET, children, true);
    }

    private EntityTreeNode buildAssetNode(Asset asset) {
        List<Asset> childAssets = assetRepository.findByParentAssetId(asset.getId());
        List<EntityTreeNode> children = childAssets.stream()
            .map(this::buildAssetNode)
            .toList();

        return new EntityTreeNode(asset.getId().toString(), asset.getName(),
                                  EntityType.ASSET, children.isEmpty() ? null : children, false);
    }

    // ==================== EVALUACIÓN DE PERFILES ====================

    /**
     * Evalúa perfiles activos para un evento de entidad.
     * Llamado desde EntityEventListener.
     */
    @Async
    public void evaluateProfilesForEvent(EntityEvent event) {
        List<NotificationProfile> activeProfiles = profileRepository
            .findByStatusAndEventEnabled(RuleStatus.ACTIVE, event.eventType());

        for (NotificationProfile profile : activeProfiles) {
            try {
                if (!matchesEntitySelection(profile.getEntitySelections(),
                                           event.entityType(), event.entityId())) {
                    continue;
                }

                if (!evaluateFilters(profile.getEntityFilters(), event.entity())) {
                    continue;
                }

                // Resolver destinatarios y enviar
                Set<NotificationRecipient> recipients =
                    resolveRecipients(profile.getRecipients(), event.entity());

                String title = generateTitle(profile, event);
                String message = generateMessage(profile, event);

                for (NotificationRecipient recipient : recipients) {
                    notificationService.sendNotification(
                        SendNotificationRequest.builder()
                            .userId(recipient.userId())
                            .email(recipient.email())
                            .type(event.eventType())
                            .priority(Priority.MEDIUM)
                            .title(title)
                            .message(message)
                            .entityType(event.entityType())
                            .entityId(event.entityId())
                            .channels(profile.getChannels())
                            .profileId(profile.getId())
                            .build()
                    );
                }

                log.info("Profile {} triggered for {} {} - {} recipients",
                         profile.getId(), event.entityType(), event.entityId(),
                         recipients.size());

            } catch (Exception e) {
                log.error("Error evaluating profile {} for entity {}: {}",
                          profile.getId(), event.entityId(), e.getMessage());
            }
        }
    }

    private boolean matchesEntitySelection(List<EntitySelection> selections,
                                           EntityType entityType, Long entityId) {
        for (EntitySelection selection : selections) {
            if (selection.entityType() != entityType) {
                continue;
            }
            // Si entityIds es null/vacío, aplica a todos de ese tipo
            if (selection.entityIds() == null || selection.entityIds().isEmpty()) {
                return true;
            }
            if (selection.entityIds().contains(entityId)) {
                return true;
            }
            // Verificar hijos si includeChildren está habilitado
            if (Boolean.TRUE.equals(selection.includeChildren()) &&
                isChildOf(entityType, entityId, selection.entityIds())) {
                return true;
            }
        }
        return false;
    }
}

// DTOs para árbol de entidades
public record EntityTreeNode(
    String key,
    String label,
    EntityType entityType,
    List<EntityTreeNode> children,
    boolean selectable
) {}

public record EntityTreeResponse(
    List<EntityTreeNode> nodes
) {}
```

---

## 5. Implementación Frontend

### 5.1 Modelo de Datos TypeScript

```typescript
// libs/customer-features/src/lib/modules/notifications/types/notification.types.ts

export interface NotificationRule {
  id: number;
  name: string;
  entityType: EntityType;
  eventTypes: EventType[];
  conditions?: RuleCondition[];
  monitoredProperties?: string[];
  recipients: RecipientConfig;
  channels: NotificationChannel[];
  priority: Priority;
  status: RuleStatus;
  createdAt: string;
  createdBy: number;
}

export interface AlertRule {
  id: number;
  name: string;
  metricType: MetricType;
  entityType: EntityType;
  metricFilters?: RuleCondition[];
  // Propiedad a monitorear (estándar o extendida)
  targetProperty?: string;
  isExtendedProperty?: boolean;
  // Origen de la alerta
  sourceType?: AlertSourceType;
  databoardId?: number;
  // Umbral o valor específico
  thresholdOperator: ThresholdOperator;
  thresholdValue?: number;
  targetValue?: string;
  // Configuración
  recipients: RecipientConfig;
  channels: NotificationChannel[];
  status: RuleStatus;
  currentState: AlertState;
  currentValue?: number;
  lastTriggeredAt?: string;
}

export type AlertSourceType = 'MANUAL' | 'TABLE_VIEW' | 'DATA_BOARD';

export interface ExpirationRule {
  id: number;
  name: string;
  entityType: EntityType;
  dateField: string;
  reminderDays: number[];
  overdueEnabled: boolean;
  recipients: RecipientConfig;
  channels: NotificationChannel[];
  status: RuleStatus;
}

// Perfil de Notificación (Configuración Centralizada)
export interface NotificationProfile {
  id: number;
  name: string;
  description?: string;
  events: {
    onCreate: boolean;
    onUpdate: boolean;
    onDelete: boolean;
    onExpiration: boolean;
  };
  entitySelections: EntitySelection[];
  entityFilters?: RuleCondition[];
  recipients: RecipientConfig;
  channels: NotificationChannel[];
  status: RuleStatus;
  createdAt: string;
  createdBy: number;
  updatedAt?: string;
}

export interface EntitySelection {
  entityType: EntityType;
  entityIds?: number[];
  includeChildren?: boolean;
}

export interface EntityTreeNode {
  key: string;
  label: string;
  entityType: EntityType;
  children?: EntityTreeNode[];
  selectable: boolean;
}

export interface Notification {
  id: number;
  userId: number;
  type: EventType;
  priority: Priority;
  title: string;
  message: string;
  entityType?: EntityType;
  entityId?: number;
  actionUrl?: string;
  status: NotificationStatus;
  readAt?: string;
  createdAt: string;
}

export interface UserNotificationPreferences {
  userId: number;
  channelPreferences: ChannelPreferences;
  quietHoursEnabled: boolean;
  quietHoursFrom?: string;
  quietHoursTo?: string;
}

export interface RecipientConfig {
  userIds?: number[];
  emails?: string[];
  dynamicRecipients?: string[];
}

export interface RuleCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | 'IN';
  value: unknown;
}

export interface ChannelPreferences {
  critical: ChannelConfig;
  high: ChannelConfig;
  medium: ChannelConfig;
  low: ChannelConfig;
}

export interface ChannelConfig {
  email: boolean;
  inApp: boolean;
}

export type EntityType =
  | 'ORG_CONTAINER' | 'ASSET' | 'RISK' | 'INCIDENT' | 'DEFECT'
  | 'ML_RESULT' | 'QUESTIONNAIRE' | 'PROCESS' | 'COMPLIANCE_REVIEW';

export type EventType =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVAL' | 'REJECTION'
  | 'EXPIRATION_REMINDER' | 'OVERDUE' | 'THRESHOLD_EXCEEDED' | 'KPI_CHANGE';

export type NotificationChannel = 'EMAIL' | 'IN_APP';
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RuleStatus = 'ACTIVE' | 'INACTIVE';
export type AlertState = 'NORMAL' | 'TRIGGERED';
export type NotificationStatus = 'UNREAD' | 'READ';
export type MetricType = 'COUNT' | 'AVERAGE' | 'SUM';
export type ThresholdOperator = 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ' | 'NEQ';

// Request para crear alerta desde vista de tabla
export interface CreateAlertFromTableRequest {
  name: string;
  entityType: EntityType;
  targetProperty: string;
  isExtendedProperty: boolean;
  metricType?: MetricType;
  thresholdOperator: ThresholdOperator;
  thresholdValue?: number;
  targetValue?: string;
  metricFilters?: RuleCondition[];
  recipients: RecipientConfig;
  channels: NotificationChannel[];
}

// Request para crear alerta desde Data Board
export interface CreateAlertFromDataboardRequest extends CreateAlertFromTableRequest {
  databoardId: number;
  databoardFilters?: RuleCondition[]; // Filtros del data board
}

// Propiedad disponible para alertas (incluye extendidas)
export interface AlertableProperty {
  code: string;          // Código de la propiedad
  label: string;         // Nombre para mostrar
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'DATETIME' | 'BOOLEAN' | 'CATALOG' | 'JSON';
  isExtended: boolean;   // true si es propiedad extendida (custom)
  sourceType: ExtendedPropertySource; // Origen de la propiedad extendida
  sourceTypeId?: number; // ID del tipo origen (AssetTypeId, EventSubTypeId, etc.)
  sourceTypeName?: string; // Nombre del tipo origen para UI
  options?: { id: number; code: string; label: string }[]; // Opciones para CATALOG
}

// Origen de propiedades extendidas según tipo de entidad
export type ExtendedPropertySource =
  | 'STANDARD'                    // Propiedad estándar de la entidad
  | 'CONTAINER_PROPERTY_DEF'      // ContainerPropertyDefinition (Contenedores)
  | 'ASSET_TYPE_PROPERTY'         // AssetTypeProperty (Activos -> AssetType)
  | 'EVENT_SUBTYPE_PROPERTY';     // EventSubTypeProperty (Riesgos/Incidentes/Defectos -> EventSubType)

/**
 * NOTA: Estructura de Propiedades Extendidas por Entidad
 *
 * 1. CONTENEDORES (ORG_CONTAINER):
 *    - Definición: ContainerPropertyDefinition (container_property_definitions)
 *    - Valores: ContainerPropertyValue (container_property_values)
 *    - Tipos: TEXT, NUMBER, BOOLEAN, DATE, EMAIL, URL, PHONE
 *
 * 2. ACTIVOS (ASSET):
 *    - Definición: AssetType -> AssetTypeProperty (organization_component_asset_type_property)
 *    - Valores: AssetPropertyValue (organization_component_asset_property_value)
 *    - Grupos: AssetTypePropertyGroup
 *    - Opciones: PropertyOption (para CATALOG)
 *    - Tipos: Según PropertyDataType
 *
 * 3. EVENTOS - RIESGOS/INCIDENTES/DEFECTOS (RISK/INCIDENT/DEFECT):
 *    - Definición: EventSubType -> EventSubTypeProperty (event_subtype_property)
 *    - Valores: EventPropertyValue (event_property_value)
 *    - Grupos: EventSubTypePropertyGroup
 *    - Opciones: EventSubTypePropertyOption (para CATALOG)
 *    - Tipos: TEXT, NUMBER, BOOLEAN, DATE, DATETIME, JSON, CATALOG
 *    - Nota: EventPropertyValue soporta múltiples columnas tipadas (textValue, numericValue, etc.)
 */
```

### 5.2 NotificationService

```typescript
// libs/customer-features/src/lib/modules/notifications/services/notification.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, interval, switchMap, startWith } from 'rxjs';
import { environment } from '@env/environment';
import {
  Notification, NotificationRule, AlertRule, ExpirationRule,
  UserNotificationPreferences, NotificationStatus, Page
} from '../types';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  // Estado reactivo para contador de no leídas
  private readonly _unreadCount = signal<number>(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  // Polling cada 30 segundos para actualizar contador
  readonly unreadCountPoller$ = interval(30000).pipe(
    startWith(0),
    switchMap(() => this.fetchUnreadCount())
  );

  // ==================== INBOX ====================

  getInbox(
    page = 0,
    size = 20,
    status?: NotificationStatus
  ): Observable<Page<Notification>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<Page<Notification>>(`${this.apiUrl}/inbox`, { params });
  }

  fetchUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/inbox/count`).pipe(
      tap(response => this._unreadCount.set(response.count))
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/inbox/${notificationId}/read`, {}).pipe(
      tap(() => this._unreadCount.update(count => Math.max(0, count - 1)))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/inbox/read-all`, {}).pipe(
      tap(() => this._unreadCount.set(0))
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inbox/${notificationId}`);
  }

  // ==================== RULES ====================

  getRules(page = 0, size = 20): Observable<Page<NotificationRule>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<NotificationRule>>(`${this.apiUrl}/rules`, { params });
  }

  getRuleById(ruleId: number): Observable<NotificationRule> {
    return this.http.get<NotificationRule>(`${this.apiUrl}/rules/${ruleId}`);
  }

  createRule(rule: Omit<NotificationRule, 'id' | 'createdAt' | 'createdBy'>): Observable<NotificationRule> {
    return this.http.post<NotificationRule>(`${this.apiUrl}/rules`, rule);
  }

  updateRule(ruleId: number, rule: Partial<NotificationRule>): Observable<NotificationRule> {
    return this.http.put<NotificationRule>(`${this.apiUrl}/rules/${ruleId}`, rule);
  }

  deleteRule(ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rules/${ruleId}`);
  }

  toggleRule(ruleId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/rules/${ruleId}/toggle`, {});
  }

  // ==================== ALERTS ====================

  getAlerts(page = 0, size = 20): Observable<Page<AlertRule>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<AlertRule>>(`${this.apiUrl}/alerts`, { params });
  }

  getTriggeredAlerts(): Observable<AlertRule[]> {
    return this.http.get<AlertRule[]>(`${this.apiUrl}/alerts/triggered`);
  }

  createAlert(alert: Omit<AlertRule, 'id' | 'currentState' | 'currentValue' | 'lastTriggeredAt'>): Observable<AlertRule> {
    return this.http.post<AlertRule>(`${this.apiUrl}/alerts`, alert);
  }

  updateAlert(alertId: number, alert: Partial<AlertRule>): Observable<AlertRule> {
    return this.http.put<AlertRule>(`${this.apiUrl}/alerts/${alertId}`, alert);
  }

  deleteAlert(alertId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alerts/${alertId}`);
  }

  // Crear alerta desde vista de tabla de entidad
  createAlertFromTable(request: CreateAlertFromTableRequest): Observable<AlertRule> {
    return this.http.post<AlertRule>(`${this.apiUrl}/alerts/from-table`, request);
  }

  // Crear alerta desde Data Board
  createAlertFromDataboard(request: CreateAlertFromDataboardRequest): Observable<AlertRule> {
    return this.http.post<AlertRule>(`${this.apiUrl}/alerts/from-databoard`, request);
  }

  // Obtener propiedades disponibles (incluye extendidas) para un tipo de entidad
  getAlertableProperties(entityType: EntityType): Observable<AlertableProperty[]> {
    return this.http.get<AlertableProperty[]>(`${this.apiUrl}/alerts/properties/${entityType}`);
  }

  // ==================== EXPIRATION RULES ====================

  getExpirationRules(page = 0, size = 20): Observable<Page<ExpirationRule>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<ExpirationRule>>(`${this.apiUrl}/expiration-rules`, { params });
  }

  createExpirationRule(rule: Omit<ExpirationRule, 'id'>): Observable<ExpirationRule> {
    return this.http.post<ExpirationRule>(`${this.apiUrl}/expiration-rules`, rule);
  }

  updateExpirationRule(ruleId: number, rule: Partial<ExpirationRule>): Observable<ExpirationRule> {
    return this.http.put<ExpirationRule>(`${this.apiUrl}/expiration-rules/${ruleId}`, rule);
  }

  deleteExpirationRule(ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expiration-rules/${ruleId}`);
  }

  // ==================== PREFERENCES ====================

  getPreferences(): Observable<UserNotificationPreferences> {
    return this.http.get<UserNotificationPreferences>(`${this.apiUrl}/preferences`);
  }

  updatePreferences(prefs: Partial<UserNotificationPreferences>): Observable<UserNotificationPreferences> {
    return this.http.put<UserNotificationPreferences>(`${this.apiUrl}/preferences`, prefs);
  }

  // ==================== PROFILES (Configuración Centralizada) ====================

  getProfiles(page = 0, size = 20): Observable<Page<NotificationProfile>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<NotificationProfile>>(`${this.apiUrl}/profiles`, { params });
  }

  getProfileById(profileId: number): Observable<NotificationProfile> {
    return this.http.get<NotificationProfile>(`${this.apiUrl}/profiles/${profileId}`);
  }

  createProfile(profile: Omit<NotificationProfile, 'id' | 'createdAt' | 'createdBy' | 'updatedAt'>): Observable<NotificationProfile> {
    return this.http.post<NotificationProfile>(`${this.apiUrl}/profiles`, profile);
  }

  updateProfile(profileId: number, profile: Partial<NotificationProfile>): Observable<NotificationProfile> {
    return this.http.put<NotificationProfile>(`${this.apiUrl}/profiles/${profileId}`, profile);
  }

  deleteProfile(profileId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profiles/${profileId}`);
  }

  toggleProfile(profileId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/profiles/${profileId}/toggle`, {});
  }

  getEntitiesTree(): Observable<EntityTreeNode[]> {
    return this.http.get<{ nodes: EntityTreeNode[] }>(`${this.apiUrl}/profiles/entities-tree`)
      .pipe(map(response => response.nodes));
  }

  // ==================== HELPERS ====================

  getEntityTypeOptions(): { label: string; value: EntityType }[] {
    return [
      { label: 'Contenedor Organizacional', value: 'ORG_CONTAINER' },
      { label: 'Activo', value: 'ASSET' },
      { label: 'Riesgo', value: 'RISK' },
      { label: 'Incidente', value: 'INCIDENT' },
      { label: 'Defecto', value: 'DEFECT' },
      { label: 'Resultado ML', value: 'ML_RESULT' },
      { label: 'Cuestionario', value: 'QUESTIONNAIRE' },
      { label: 'Proceso', value: 'PROCESS' },
      { label: 'Revisión de Cumplimiento', value: 'COMPLIANCE_REVIEW' },
    ];
  }

  getEventTypeOptions(): { label: string; value: EventType }[] {
    return [
      { label: 'Creación', value: 'CREATE' },
      { label: 'Modificación', value: 'UPDATE' },
      { label: 'Eliminación', value: 'DELETE' },
      { label: 'Aprobación', value: 'APPROVAL' },
      { label: 'Rechazo', value: 'REJECTION' },
      { label: 'Recordatorio Vencimiento', value: 'EXPIRATION_REMINDER' },
      { label: 'Vencido', value: 'OVERDUE' },
      { label: 'Umbral Superado', value: 'THRESHOLD_EXCEEDED' },
      { label: 'Cambio en KPI', value: 'KPI_CHANGE' },
    ];
  }

  getPriorityOptions(): { label: string; value: Priority; severity: string }[] {
    return [
      { label: 'Crítica', value: 'CRITICAL', severity: 'danger' },
      { label: 'Alta', value: 'HIGH', severity: 'warn' },
      { label: 'Media', value: 'MEDIUM', severity: 'info' },
      { label: 'Baja', value: 'LOW', severity: 'secondary' },
    ];
  }
}
```

### 5.3 Componente Centro de Notificaciones

```typescript
// libs/customer-features/src/lib/modules/notifications/components/notification-center/notification-center.component.ts

import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';
import { ScrollerModule } from 'primeng/scroller';
import { TagModule } from 'primeng/tag';
import { Subscription } from 'rxjs';

import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationStatus, Priority } from '../../types';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BadgeModule,
    ButtonModule,
    OverlayPanelModule,
    DividerModule,
    ScrollerModule,
    TagModule,
  ],
  template: `
    <div class="notification-center">
      <!-- Botón con badge -->
      <button
        pButton
        type="button"
        icon="pi pi-bell"
        class="p-button-text p-button-rounded"
        [badge]="unreadCount() > 0 ? unreadCount().toString() : ''"
        badgeSeverity="danger"
        (click)="op.toggle($event)"
      ></button>

      <!-- Panel de notificaciones -->
      <p-overlayPanel #op [style]="{ width: '400px' }">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold m-0">Notificaciones</h3>
          @if (unreadCount() > 0) {
            <button
              pButton
              type="button"
              label="Marcar todas leídas"
              class="p-button-text p-button-sm"
              (click)="markAllAsRead()"
            ></button>
          }
        </div>

        <!-- Filtros -->
        <div class="flex gap-2 mb-4">
          <button
            pButton
            type="button"
            [label]="'Todas'"
            [class]="filter() === null ? 'p-button-primary' : 'p-button-outlined'"
            class="p-button-sm"
            (click)="setFilter(null)"
          ></button>
          <button
            pButton
            type="button"
            [label]="'No leídas'"
            [class]="filter() === 'UNREAD' ? 'p-button-primary' : 'p-button-outlined'"
            class="p-button-sm"
            (click)="setFilter('UNREAD')"
          ></button>
        </div>

        <p-divider></p-divider>

        <!-- Lista de notificaciones -->
        @if (loading()) {
          <div class="flex justify-center py-8">
            <i class="pi pi-spinner pi-spin text-2xl"></i>
          </div>
        } @else if (notifications().length === 0) {
          <div class="text-center py-8 text-zinc-500">
            <i class="pi pi-inbox text-4xl mb-4 block"></i>
            <p>No hay notificaciones</p>
          </div>
        } @else {
          <div class="notification-list max-h-96 overflow-y-auto">
            @for (notification of notifications(); track notification.id) {
              <div
                class="notification-item p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800
                       cursor-pointer rounded-lg mb-2 transition-colors"
                [class.bg-blue-50]="notification.status === 'UNREAD'"
                [class.dark:bg-blue-950]="notification.status === 'UNREAD'"
                (click)="handleNotificationClick(notification, op)"
              >
                <div class="flex items-start gap-3">
                  <!-- Indicador de prioridad -->
                  <div
                    class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    [class]="getPriorityColor(notification.priority)"
                  ></div>

                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-sm truncate">
                        {{ notification.title }}
                      </span>
                      <p-tag
                        [value]="getEventTypeLabel(notification.type)"
                        [severity]="getEventTypeSeverity(notification.type)"
                        class="flex-shrink-0 ml-2"
                      ></p-tag>
                    </div>
                    <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-1 line-clamp-2">
                      {{ notification.message }}
                    </p>
                    <span class="text-xs text-zinc-400">
                      {{ notification.createdAt | date:'short' }}
                    </span>
                  </div>

                  <!-- Botón eliminar -->
                  <button
                    pButton
                    type="button"
                    icon="pi pi-times"
                    class="p-button-text p-button-rounded p-button-sm"
                    (click)="deleteNotification($event, notification.id)"
                  ></button>
                </div>
              </div>
            }
          </div>

          <!-- Ver todas -->
          <p-divider></p-divider>
          <div class="text-center">
            <a
              routerLink="/notifications"
              class="text-primary hover:underline text-sm"
              (click)="op.hide()"
            >
              Ver todas las notificaciones
            </a>
          </div>
        }
      </p-overlayPanel>
    </div>
  `,
  styles: [`
    .notification-list::-webkit-scrollbar {
      width: 6px;
    }
    .notification-list::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private subscription?: Subscription;

  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal(false);
  readonly filter = signal<NotificationStatus | null>(null);
  readonly unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.loadNotifications();

    // Iniciar polling para contador
    this.subscription = this.notificationService.unreadCountPoller$.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getInbox(0, 10, this.filter() ?? undefined)
      .subscribe({
        next: (page) => {
          this.notifications.set(page.content);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  setFilter(status: NotificationStatus | null): void {
    this.filter.set(status);
    this.loadNotifications();
  }

  handleNotificationClick(notification: Notification, overlayPanel: OverlayPanel): void {
    // Marcar como leída
    if (notification.status === 'UNREAD') {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        this.notifications.update(list =>
          list.map(n => n.id === notification.id
            ? { ...n, status: 'READ' as NotificationStatus }
            : n
          )
        );
      });
    }

    // Navegar si hay URL
    if (notification.actionUrl) {
      overlayPanel.hide();
      // Router navigation handled by routerLink
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update(list =>
        list.map(n => ({ ...n, status: 'READ' as NotificationStatus }))
      );
    });
  }

  deleteNotification(event: Event, notificationId: number): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId).subscribe(() => {
      this.notifications.update(list => list.filter(n => n.id !== notificationId));
    });
  }

  getPriorityColor(priority: Priority): string {
    return {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-blue-500',
      LOW: 'bg-zinc-400'
    }[priority];
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Nuevo',
      UPDATE: 'Actualizado',
      DELETE: 'Eliminado',
      APPROVAL: 'Aprobado',
      REJECTION: 'Rechazado',
      EXPIRATION_REMINDER: 'Vence pronto',
      OVERDUE: 'Vencido',
      THRESHOLD_EXCEEDED: 'Alerta',
      KPI_CHANGE: 'KPI'
    };
    return labels[type] || type;
  }

  getEventTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'danger',
      APPROVAL: 'success',
      REJECTION: 'danger',
      EXPIRATION_REMINDER: 'warn',
      OVERDUE: 'danger',
      THRESHOLD_EXCEEDED: 'danger',
      KPI_CHANGE: 'info'
    };
    return severities[type] || 'secondary';
  }
}
```

### 5.4 Componente Preferencias de Usuario

```typescript
// libs/customer-features/src/lib/modules/notifications/components/notification-preferences/notification-preferences.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastService } from '@app/core/services/toast.service';

import { NotificationService } from '../../services/notification.service';
import { UserNotificationPreferences, ChannelPreferences, Priority } from '../../types';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputSwitchModule,
    CardModule,
    ButtonModule,
    CalendarModule,
  ],
  template: `
    <p-card header="Preferencias de Notificación">
      @if (loading()) {
        <div class="flex justify-center py-8">
          <i class="pi pi-spinner pi-spin text-2xl"></i>
        </div>
      } @else if (preferences()) {
        <div class="space-y-6">
          <!-- Preferencias por Prioridad -->
          <div>
            <h4 class="text-lg font-medium mb-4">Canales por Prioridad</h4>
            <table class="w-full">
              <thead>
                <tr class="text-left text-sm text-zinc-500">
                  <th class="pb-2">Prioridad</th>
                  <th class="pb-2 text-center">Email</th>
                  <th class="pb-2 text-center">In-App</th>
                </tr>
              </thead>
              <tbody>
                @for (priority of priorities; track priority.value) {
                  <tr class="border-t">
                    <td class="py-3">
                      <span
                        class="px-2 py-1 rounded text-sm"
                        [class]="priority.bgClass"
                      >
                        {{ priority.label }}
                      </span>
                    </td>
                    <td class="py-3 text-center">
                      <p-inputSwitch
                        [(ngModel)]="preferences()!.channelPreferences[priority.key].email"
                        (onChange)="onPreferenceChange()"
                      ></p-inputSwitch>
                    </td>
                    <td class="py-3 text-center">
                      <p-inputSwitch
                        [(ngModel)]="preferences()!.channelPreferences[priority.key].inApp"
                        (onChange)="onPreferenceChange()"
                      ></p-inputSwitch>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            <p class="text-sm text-zinc-500 mt-2">
              Las notificaciones críticas ignoran el horario "No molestar".
            </p>
          </div>

          <!-- Horario No Molestar -->
          <div>
            <h4 class="text-lg font-medium mb-4">Horario "No Molestar"</h4>
            <div class="flex items-center gap-4 mb-4">
              <p-inputSwitch
                [(ngModel)]="preferences()!.quietHoursEnabled"
                (onChange)="onPreferenceChange()"
              ></p-inputSwitch>
              <span>Activar horario silencioso</span>
            </div>

            @if (preferences()!.quietHoursEnabled) {
              <div class="flex items-center gap-4">
                <div>
                  <label class="block text-sm text-zinc-500 mb-1">Desde</label>
                  <p-calendar
                    [(ngModel)]="quietHoursFrom"
                    [timeOnly]="true"
                    [showIcon]="true"
                    icon="pi pi-clock"
                    (onSelect)="onQuietHoursChange()"
                  ></p-calendar>
                </div>
                <div>
                  <label class="block text-sm text-zinc-500 mb-1">Hasta</label>
                  <p-calendar
                    [(ngModel)]="quietHoursTo"
                    [timeOnly]="true"
                    [showIcon]="true"
                    icon="pi pi-clock"
                    (onSelect)="onQuietHoursChange()"
                  ></p-calendar>
                </div>
              </div>
            }
          </div>

          <!-- Botón Guardar -->
          <div class="flex justify-end">
            <button
              pButton
              type="button"
              label="Guardar Preferencias"
              icon="pi pi-save"
              [loading]="saving()"
              (click)="savePreferences()"
            ></button>
          </div>
        </div>
      }
    </p-card>
  `
})
export class NotificationPreferencesComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);

  readonly preferences = signal<UserNotificationPreferences | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  quietHoursFrom: Date | null = null;
  quietHoursTo: Date | null = null;

  readonly priorities = [
    { label: 'Crítica', value: 'CRITICAL', key: 'critical' as const, bgClass: 'bg-red-100 text-red-800' },
    { label: 'Alta', value: 'HIGH', key: 'high' as const, bgClass: 'bg-orange-100 text-orange-800' },
    { label: 'Media', value: 'MEDIUM', key: 'medium' as const, bgClass: 'bg-blue-100 text-blue-800' },
    { label: 'Baja', value: 'LOW', key: 'low' as const, bgClass: 'bg-zinc-100 text-zinc-800' },
  ];

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.loading.set(true);
    this.notificationService.getPreferences().subscribe({
      next: (prefs) => {
        this.preferences.set(prefs);
        if (prefs.quietHoursFrom) {
          this.quietHoursFrom = this.parseTime(prefs.quietHoursFrom);
        }
        if (prefs.quietHoursTo) {
          this.quietHoursTo = this.parseTime(prefs.quietHoursTo);
        }
        this.loading.set(false);
      },
      error: () => {
        // Crear preferencias por defecto
        this.preferences.set({
          userId: 0, // Se asigna en backend
          channelPreferences: {
            critical: { email: true, inApp: true },
            high: { email: true, inApp: true },
            medium: { email: false, inApp: true },
            low: { email: false, inApp: true },
          },
          quietHoursEnabled: false,
        });
        this.loading.set(false);
      }
    });
  }

  onPreferenceChange(): void {
    // Auto-save habilitado (opcional)
  }

  onQuietHoursChange(): void {
    const prefs = this.preferences();
    if (prefs && this.quietHoursFrom && this.quietHoursTo) {
      prefs.quietHoursFrom = this.formatTime(this.quietHoursFrom);
      prefs.quietHoursTo = this.formatTime(this.quietHoursTo);
      this.preferences.set({ ...prefs });
    }
  }

  savePreferences(): void {
    const prefs = this.preferences();
    if (!prefs) return;

    this.saving.set(true);
    this.notificationService.updatePreferences(prefs).subscribe({
      next: () => {
        this.toastService.showSuccess('Guardado', 'Preferencias actualizadas correctamente');
        this.saving.set(false);
      },
      error: () => {
        this.toastService.showError('Error', 'No se pudieron guardar las preferencias');
        this.saving.set(false);
      }
    });
  }

  private parseTime(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  private formatTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
```

---

## 6. Diagrama de Secuencia

### 6.1 Flujo de Notificación por Evento

```
┌─────────┐   ┌────────────┐   ┌───────────────┐   ┌─────────────────┐   ┌───────────┐
│ Usuario │   │ Controller │   │ EventService  │   │NotificationRule │   │Notification│
│         │   │            │   │               │   │    Service      │   │  Service  │
└────┬────┘   └─────┬──────┘   └───────┬───────┘   └────────┬────────┘   └─────┬─────┘
     │              │                  │                    │                   │
     │ POST /events │                  │                    │                   │
     │─────────────>│                  │                    │                   │
     │              │  create(event)   │                    │                   │
     │              │─────────────────>│                    │                   │
     │              │                  │                    │                   │
     │              │                  │ publishEvent()     │                   │
     │              │                  │───────────────────>│                   │
     │              │                  │                    │                   │
     │              │                  │                    │ findMatchingRules()
     │              │                  │                    │───────┐          │
     │              │                  │                    │<──────┘          │
     │              │                  │                    │                   │
     │              │                  │                    │ evaluateConditions()
     │              │                  │                    │───────┐          │
     │              │                  │                    │<──────┘          │
     │              │                  │                    │                   │
     │              │                  │                    │ resolveRecipients()
     │              │                  │                    │───────┐          │
     │              │                  │                    │<──────┘          │
     │              │                  │                    │                   │
     │              │                  │                    │ sendNotification()│
     │              │                  │                    │─────────────────>│
     │              │                  │                    │                   │
     │              │                  │                    │                   │ saveInApp()
     │              │                  │                    │                   │──────┐
     │              │                  │                    │                   │<─────┘
     │              │                  │                    │                   │
     │              │                  │                    │                   │ sendEmail()
     │              │                  │                    │                   │──────┐
     │              │                  │                    │                   │<─────┘
     │              │                  │                    │                   │
     │              │    EventDTO      │                    │                   │
     │<─────────────│<─────────────────│                    │                   │
     │              │                  │                    │                   │
```

---

## 7. Seguridad

### 7.1 Permisos y Roles

```java
// Permisos requeridos para cada endpoint
@PreAuthorize("hasAuthority('NOTIFICATION_RULES_MANAGE')")
// POST/PUT/DELETE /api/notifications/rules

@PreAuthorize("hasAuthority('ALERT_RULES_MANAGE')")
// POST/PUT/DELETE /api/notifications/alerts

@PreAuthorize("isAuthenticated()")
// GET /api/notifications/inbox (solo ve sus propias notificaciones)
// GET/PUT /api/notifications/preferences (solo sus preferencias)

// ==================== PERFILES (Configuración Centralizada) ====================
@PreAuthorize("hasAnyRole('ADMIN', 'BO_ADMIN')")
// POST/PUT/DELETE /api/notifications/profiles
// GET /api/notifications/profiles/entities-tree
// PATCH /api/notifications/profiles/{id}/toggle

// Roles con acceso a configuración centralizada:
// - ADMIN (Tenant): Administrador del tenant con acceso completo
// - BO_ADMIN (Backoffice): Administrador de backoffice con acceso completo
// Nota: BO_ACCOUNT_MANAGER NO tiene acceso a esta funcionalidad
```

### 7.2 Validaciones

- **Usuario solo ve sus notificaciones**: Filtro automático por `userId` del token JWT
- **Emails válidos**: Validación de formato antes de guardar
- **Límites de reglas**: Máximo 50 reglas por tenant
- **Límites de perfiles**: Máximo 20 perfiles de notificación por tenant
- **Rate limiting**: Máximo 100 notificaciones/hora por usuario
- **Selección de entidades**: Mínimo 1 entidad seleccionada por perfil
- **Eventos habilitados**: Mínimo 1 evento habilitado (onCreate/onUpdate/onDelete/onExpiration) por perfil

---

## 8. Características Fase 2 (Pendiente)

### 8.1 WebSocket para Tiempo Real

```java
// NotificationWebSocketHandler.java
@Component
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    public void sendToUser(Long userId, Notification notification) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(
                    objectMapper.writeValueAsString(notification)
                ));
            } catch (IOException e) {
                log.error("Error sending WebSocket message", e);
            }
        }
    }
}
```

### 8.2 Canales Externos

```java
public enum NotificationChannel {
    EMAIL,
    IN_APP,
    SLACK,      // Fase 2
    TEAMS,      // Fase 2
    SMS,        // Fase 2
    WEBHOOK     // Fase 2
}

// SlackNotificationService.java (Fase 2)
@Service
public class SlackNotificationService {

    @Value("${slack.webhook.url}")
    private String webhookUrl;

    public void send(SendNotificationRequest request) {
        SlackMessage message = SlackMessage.builder()
            .channel(request.slackChannel())
            .text(request.title())
            .attachments(List.of(
                Attachment.builder()
                    .color(getPriorityColor(request.priority()))
                    .text(request.message())
                    .build()
            ))
            .build();

        webClient.post()
            .uri(webhookUrl)
            .bodyValue(message)
            .retrieve()
            .toBodilessEntity()
            .block();
    }
}
```

### 8.3 Alertas Compuestas

```java
// Fase 2: Múltiples condiciones con operadores lógicos
public record CompositeAlertCondition(
    LogicalOperator operator,  // AND, OR
    List<AlertCondition> conditions
) {}

public interface AlertCondition {}

public record SimpleCondition(
    MetricType metricType,
    EntityType entityType,
    ThresholdOperator thresholdOperator,
    double thresholdValue
) implements AlertCondition {}
```

### 8.4 Escalamiento Automático

```java
// EscalationRule.java (Fase 2)
@Entity
@Table(name = "escalation_rules")
public class EscalationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alert_rule_id")
    private AlertRule alertRule;

    @Column(name = "escalation_delay_minutes")
    private Integer escalationDelayMinutes; // Ej: 30 min sin respuesta

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "escalation_recipients", columnDefinition = "jsonb")
    private RecipientConfig escalationRecipients;

    @Enumerated(EnumType.STRING)
    @Column(name = "escalation_channels")
    private Set<NotificationChannel> escalationChannels;
}
```

### 8.5 Digestos Periódicos

```java
// DigestScheduler.java (Fase 2)
@Service
@RequiredArgsConstructor
public class DigestScheduler {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final UserPreferencesRepository preferencesRepository;

    @Scheduled(cron = "0 0 8 * * MON-FRI") // 8am días laborales
    public void sendDailyDigest() {
        List<UserNotificationPreferences> usersWithDigest =
            preferencesRepository.findByDailyDigestEnabled(true);

        for (UserNotificationPreferences prefs : usersWithDigest) {
            List<Notification> unread = notificationRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(
                    prefs.getUserId(),
                    NotificationStatus.UNREAD
                );

            if (!unread.isEmpty()) {
                String digestHtml = buildDigestHtml(unread);
                emailService.sendEmail(
                    prefs.getEmail(),
                    "Resumen de notificaciones - " + LocalDate.now(),
                    digestHtml
                );
            }
        }
    }
}
```

---

## 9. Testing

### 9.1 Tests Unitarios Backend

```java
@ExtendWith(MockitoExtension.class)
class NotificationRuleServiceTest {

    @Mock
    private NotificationRuleRepository ruleRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationRuleService ruleService;

    @Test
    void evaluateRulesForEvent_ShouldTriggerMatchingRule() {
        // Given
        NotificationRule rule = NotificationRule.builder()
            .id(1L)
            .entityType(EntityType.RISK)
            .eventTypes(Set.of(EventType.CREATE))
            .conditions(List.of(
                new RuleCondition("riskLevel", "=", "Critical")
            ))
            .recipients(new RecipientConfig(List.of(1L), null, null))
            .channels(Set.of(NotificationChannel.IN_APP))
            .priority(Priority.HIGH)
            .status(RuleStatus.ACTIVE)
            .build();

        when(ruleRepository.findByEntityTypeAndEventTypesContainingAndStatus(
            EntityType.RISK, EventType.CREATE, RuleStatus.ACTIVE
        )).thenReturn(List.of(rule));

        Event risk = new Event();
        risk.setId(100L);
        risk.setRiskLevel("Critical");

        EntityEvent event = EntityEvent.builder()
            .entityType(EntityType.RISK)
            .eventType(EventType.CREATE)
            .entityId(100L)
            .entity(risk)
            .build();

        // When
        ruleService.evaluateRulesForEvent(event);

        // Then
        verify(notificationService, times(1)).sendNotification(any());
    }

    @Test
    void evaluateConditions_ShouldReturnFalse_WhenConditionNotMet() {
        // Given
        List<RuleCondition> conditions = List.of(
            new RuleCondition("status", "=", "ACTIVE")
        );

        Event entity = new Event();
        entity.setStatus("CLOSED");

        // When
        boolean result = ruleService.evaluateConditions(conditions, entity);

        // Then
        assertFalse(result);
    }
}
```

### 9.2 Tests E2E Frontend

```typescript
// notification-center.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationCenterComponent } from './notification-center.component';

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should display unread count badge', () => {
    component.ngOnInit();

    const countReq = httpMock.expectOne('/api/notifications/inbox/count');
    countReq.flush({ count: 5 });

    fixture.detectChanges();

    expect(component.unreadCount()).toBe(5);
  });

  it('should mark notification as read on click', () => {
    const notification = {
      id: 1,
      status: 'UNREAD',
      title: 'Test',
      message: 'Test message',
      createdAt: new Date().toISOString()
    };

    component.notifications.set([notification as any]);
    fixture.detectChanges();

    // Simular click
    component.handleNotificationClick(notification as any, {} as any);

    const markReadReq = httpMock.expectOne('/api/notifications/inbox/1/read');
    expect(markReadReq.request.method).toBe('PATCH');
    markReadReq.flush({});

    expect(component.notifications()[0].status).toBe('READ');
  });
});
```

---

## 10. Métricas y Observabilidad

### 10.1 Métricas Prometheus

```java
@Component
@RequiredArgsConstructor
public class NotificationMetrics {

    private final MeterRegistry meterRegistry;

    private Counter notificationsSent;
    private Counter notificationsFailed;
    private Timer notificationDeliveryTime;

    @PostConstruct
    public void init() {
        notificationsSent = Counter.builder("notifications.sent")
            .description("Total notifications sent")
            .tag("channel", "unknown")
            .register(meterRegistry);

        notificationsFailed = Counter.builder("notifications.failed")
            .description("Total notifications failed")
            .register(meterRegistry);

        notificationDeliveryTime = Timer.builder("notifications.delivery.time")
            .description("Time to deliver notification")
            .register(meterRegistry);
    }

    public void recordSent(NotificationChannel channel) {
        notificationsSent.tag("channel", channel.name()).increment();
    }

    public void recordFailed() {
        notificationsFailed.increment();
    }

    public Timer.Sample startDeliveryTimer() {
        return Timer.start(meterRegistry);
    }
}
```

### 10.2 Logs Estructurados

```java
// Formato de log para notificaciones
log.info("Notification sent",
    StructuredArguments.kv("userId", userId),
    StructuredArguments.kv("channel", channel),
    StructuredArguments.kv("type", eventType),
    StructuredArguments.kv("entityType", entityType),
    StructuredArguments.kv("entityId", entityId),
    StructuredArguments.kv("ruleId", ruleId)
);
```

---

## 11. Configuración

### 11.1 application.yml

```yaml
# Notificaciones
notifications:
  scheduler:
    alerts:
      enabled: true
      interval: 300000  # 5 minutos
    expirations:
      enabled: true
      cron: "0 0 0 * * *"  # Diario a medianoche
  limits:
    max-rules-per-tenant: 50
    max-notifications-per-hour: 100
  cleanup:
    enabled: true
    retention-days: 90  # Eliminar notificaciones > 90 días
```

### 11.2 Email Templates (Thymeleaf)

```html
<!-- templates/email/notification.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #1a1a2e; color: white; padding: 20px; }
        .content { padding: 20px; }
        .priority-critical { border-left: 4px solid #ef4444; }
        .priority-high { border-left: 4px solid #f97316; }
        .priority-medium { border-left: 4px solid #3b82f6; }
        .priority-low { border-left: 4px solid #6b7280; }
        .button { display: inline-block; background: #3b82f6; color: white;
                  padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { color: #666; font-size: 12px; padding: 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 th:text="${title}">Notificación ORCA SNS</h1>
        </div>
        <div class="content" th:classappend="'priority-' + ${priority.toLowerCase()}">
            <p th:text="${message}">Mensaje de la notificación</p>

            <div th:if="${actionUrl}">
                <a class="button" th:href="${actionUrl}">Ver en el sistema</a>
            </div>
        </div>
        <div class="footer">
            <p>Esta notificación fue generada automáticamente por ORCA SNS.</p>
            <p>Para modificar tus preferencias de notificación,
               <a th:href="${preferencesUrl}">haz clic aquí</a>.</p>
        </div>
    </div>
</body>
</html>
```

---

**Última actualización**: 30/12/2024
**Versión**: 1.1
**Estado**: Fase 1 - Completado (Backend + Frontend parcial)

---

## 12. Notas de Implementación (Diciembre 2024)

### 12.1 Funcionalidades Implementadas

#### Backend (Node.js/Express + Prisma)
- **Scheduler Service** (`scheduler.service.js`): Ejecuta tareas programadas con node-cron
  - Alertas por umbral: cada 5 minutos
  - Vencimientos: 8:00 AM diario
  - Entidades vencidas (OVERDUE): 9:00 AM diario
  - Limpieza mensual: día 1 a las 3:00 AM

- **Notification Trigger Service** (`notification-trigger.service.js`): Dispara notificaciones
  - Verificación de cooldown antes de enviar alertas
  - Creación de notificaciones in-app y email

- **Email Service** (`email.service.js`): Servicio de envío de emails
  - Modo MOCK para desarrollo (console.log)
  - Templates HTML para diferentes tipos de notificación

- **Notifications Controller**: API REST completa
  - CRUD de reglas de notificación, alertas y vencimientos
  - Gestión del inbox de notificaciones
  - Preferencias de usuario
  - Árbol de entidades para configuración

#### Frontend (Angular 18+)
- **Página de Configuración** (`notificaciones-config.ts`): Preferencias del usuario
  - Selector de días de la semana para "No Molestar"
  - Cards de frecuencia de email (inmediato, diario, semanal)
  - Campo de hora de resumen
  - Auto-guardado con debounce

- **Servicio de Notificaciones** (`notificaciones.service.ts`): Cliente HTTP
  - Métodos para todas las operaciones de la API
  - Transformación de preferencias para compatibilidad backend

### 12.2 Cooldown de Alertas (Límite de Envío)

El sistema implementa un **cooldown por alerta** para evitar spam:

```javascript
// En AlertRule (Prisma schema)
cooldownMinutos   Int      @default(60) // Evitar spam de alertas

// En notification-trigger.service.js (verificación)
const minutosDesdeUltima = (Date.now() - new Date(alerta.ultimaEjecucion).getTime()) / 60000;
if (minutosDesdeUltima < alerta.cooldownMinutos) {
  console.log(`Alerta ${alerta.id} en cooldown, saltando...`);
  continue;
}
```

- **Cooldown configurable**: 1-1440 minutos (1 min a 24 horas) por alerta
- **Interfaz**: Campo editable en el formulario de alertas (`notificaciones-reglas.ts`)

### 12.3 Pendientes para Fase 2

- **Rate Limiting Global**: Implementar límite de 100 notificaciones/hora por usuario (especificado en sección 7.2)
- **WebSocket**: Notificaciones en tiempo real sin polling
- **Canales externos**: Integración con Slack, Teams, SMS
