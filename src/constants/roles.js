export const ROLES = {
  SUPERADMIN: "superadmin",
  COADMIN: "coadmin",
  VENDEDOR: "vendedor",
  EMPLEADO: "empleado",
  USUARIO: "usuario",
};

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]:
    "Administrador total",

  [ROLES.COADMIN]:
    "Co-admin",

  [ROLES.VENDEDOR]:
    "Vendedor",

  [ROLES.EMPLEADO]:
    "Empleado",

  [ROLES.USUARIO]:
    "Usuario",
};

export const PERMISSIONS = {
  /*
   * ========================================
   * DASHBOARD
   * ========================================
   */

  DASHBOARD_FULL:
    "dashboard.full",

  DASHBOARD_LIMITED:
    "dashboard.limited",

  QUICK_ACTIONS:
    "dashboard.quickActions",

  /*
   * ========================================
   * SALES
   * ========================================
   */

  SALES_VIEW:
    "sales.view",

  SALES_CREATE:
    "sales.create",

  SALES_EDIT:
    "sales.edit",

  SALES_DELETE:
    "sales.delete",

  /*
   * ========================================
   * STATISTICS
   * ========================================
   */

  STATS_VIEW:
    "stats.view",

  STATS_FULL:
    "stats.full",

  /*
   * ========================================
   * INVENTORY
   * ========================================
   */

  INVENTORY_VIEW:
    "inventory.view",

  INVENTORY_CREATE:
    "inventory.create",

  INVENTORY_EDIT:
    "inventory.edit",

  INVENTORY_DELETE:
    "inventory.delete",

  /*
   * ========================================
   * ADMIN
   * ========================================
   */

  ADMIN_VIEW:
    "admin.view",

  ROLES_MANAGE:
    "roles.manage",

  USERS_STATUS:
    "users.status",
};

/*
 * ========================================
 * ROLE PERMISSIONS
 * ========================================
 */

const ROLE_PERMISSIONS = {
  /*
   * ========================================
   * ADMIN TOTAL
   * ========================================
   *
   * Tiene absolutamente todos los permisos.
   */

  [ROLES.SUPERADMIN]: [
    ...Object.values(
      PERMISSIONS
    ),
  ],

  /*
   * ========================================
   * CO-ADMIN
   * ========================================
   *
   * Puede administrar prácticamente
   * toda la operación.
   *
   * NO puede cambiar roles.
   */

  [ROLES.COADMIN]: [
    PERMISSIONS.DASHBOARD_FULL,
    PERMISSIONS.QUICK_ACTIONS,

    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_DELETE,

    PERMISSIONS.STATS_VIEW,
    PERMISSIONS.STATS_FULL,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_DELETE,

    PERMISSIONS.ADMIN_VIEW,
    PERMISSIONS.USERS_STATUS,
  ],

  /*
   * ========================================
   * VENDEDOR
   * ========================================
   *
   * Dashboard limitado.
   *
   * Puede:
   * - ver ventas
   * - crear ventas
   * - editar ventas
   * - eliminar ventas
   *
   * Puede:
   * - ver inventario
   * - agregar inventario
   * - modificar inventario
   * - eliminar inventario
   *
   * Stats limitadas.
   */

  [ROLES.VENDEDOR]: [
    PERMISSIONS.DASHBOARD_LIMITED,
    PERMISSIONS.QUICK_ACTIONS,

    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_EDIT,
    PERMISSIONS.SALES_DELETE,

    PERMISSIONS.STATS_VIEW,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_EDIT,
    PERMISSIONS.INVENTORY_DELETE,
  ],

  /*
   * ========================================
   * EMPLEADO
   * ========================================
   *
   * Dashboard mínimo:
   * - Hola
   * - fecha
   * - acciones rápidas
   *
   * Puede:
   * - ver ventas
   * - crear ventas
   *
   * NO puede:
   * - editar ventas
   * - eliminar ventas
   *
   * Puede:
   * - ver inventario
   * - agregar inventario
   * - modificar inventario
   *
   * NO puede:
   * - eliminar inventario
   * - ver estadísticas
   */

  [ROLES.EMPLEADO]: [
    PERMISSIONS.DASHBOARD_LIMITED,
    PERMISSIONS.QUICK_ACTIONS,

    PERMISSIONS.SALES_VIEW,
    PERMISSIONS.SALES_CREATE,

    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_EDIT,
  ],

  /*
   * ========================================
   * USUARIO
   * ========================================
   *
   * Cuenta verificada pero todavía
   * sin autorización empresarial.
   *
   * Solo puede:
   * - entrar
   * - ver dashboard de espera
   * - ajustes
   * - ayuda
   * - perfil
   *
   * No recibe permisos de negocio.
   */

  [ROLES.USUARIO]: [],
};

/*
 * ========================================
 * CHECK PERMISSION
 * ========================================
 */

export function hasPermission(
  role,
  permission
) {
  const permissions =
    ROLE_PERMISSIONS[
      role
    ] || [];

  return permissions.includes(
    permission
  );
}

/*
 * ========================================
 * ROLE LABEL
 * ========================================
 */

export function getRoleLabel(
  role
) {
  return (
    ROLE_LABELS[
      role
    ] ||
    ROLE_LABELS[
      ROLES.USUARIO
    ]
  );
}

/*
 * ========================================
 * BUSINESS DATA ACCESS
 * ========================================
 */

export function canAccessBusinessData(
  role
) {
  return [
    ROLES.SUPERADMIN,
    ROLES.COADMIN,
    ROLES.VENDEDOR,
    ROLES.EMPLEADO,
  ].includes(role);
}

/*
 * ========================================
 * ADMIN PANEL ACCESS
 * ========================================
 */

export function canAdministerUsers(
  role
) {
  return [
    ROLES.SUPERADMIN,
    ROLES.COADMIN,
  ].includes(role);
}

/*
 * ========================================
 * CHANGE ROLES
 * ========================================
 *
 * Solamente el Administrador total.
 */

export function canManageRoles(
  role
) {
  return (
    role ===
    ROLES.SUPERADMIN
  );
}

/*
 * ========================================
 * ROLE LEVEL
 * ========================================
 *
 * Útil para comparaciones visuales
 * o reglas futuras.
 */

export const ROLE_LEVELS = {
  [ROLES.USUARIO]:
    0,

  [ROLES.EMPLEADO]:
    1,

  [ROLES.VENDEDOR]:
    2,

  [ROLES.COADMIN]:
    3,

  [ROLES.SUPERADMIN]:
    4,
};

/*
 * ========================================
 * GET ROLE LEVEL
 * ========================================
 */

export function getRoleLevel(
  role
) {
  return (
    ROLE_LEVELS[
      role
    ] ?? 0
  );
}

/*
 * ========================================
 * CHECK MINIMUM ROLE
 * ========================================
 */

export function hasMinimumRole(
  role,
  minimumRole
) {
  return (
    getRoleLevel(role) >=
    getRoleLevel(
      minimumRole
    )
  );
}

/*
 * ========================================
 * IS ADMIN
 * ========================================
 */

export function isAdminRole(
  role
) {
  return [
    ROLES.SUPERADMIN,
    ROLES.COADMIN,
  ].includes(role);
}

/*
 * ========================================
 * IS BUSINESS ROLE
 * ========================================
 */

export function isBusinessRole(
  role
) {
  return [
    ROLES.SUPERADMIN,
    ROLES.COADMIN,
    ROLES.VENDEDOR,
    ROLES.EMPLEADO,
  ].includes(role);
}

/*
 * ========================================
 * IS NORMAL USER
 * ========================================
 */

export function isNormalUserRole(
  role
) {
  return (
    role ===
    ROLES.USUARIO
  );
}

/*
 * ========================================
 * ASSIGNABLE ROLES
 * ========================================
 *
 * El superadmin puede asignar estos roles.
 *
 * SUPERADMIN nunca aparece como opción
 * porque el propietario es único.
 */

export const ASSIGNABLE_ROLES = [
  {
    value:
      ROLES.USUARIO,

    label:
      "Usuario",
  },

  {
    value:
      ROLES.EMPLEADO,

    label:
      "Empleado",
  },

  {
    value:
      ROLES.VENDEDOR,

    label:
      "Vendedor",
  },

  {
    value:
      ROLES.COADMIN,

    label:
      "Co-admin",
  },
];

/*
 * ========================================
 * NAVIGATION HELPERS
 * ========================================
 */

export function canSeeSales(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.SALES_VIEW
  );
}

export function canCreateSales(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.SALES_CREATE
  );
}

export function canEditSales(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.SALES_EDIT
  );
}

export function canDeleteSales(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.SALES_DELETE
  );
}

export function canSeeStats(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.STATS_VIEW
  );
}

export function canSeeFullStats(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.STATS_FULL
  );
}

export function canSeeInventory(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.INVENTORY_VIEW
  );
}

export function canCreateInventory(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.INVENTORY_CREATE
  );
}

export function canEditInventory(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.INVENTORY_EDIT
  );
}

export function canDeleteInventory(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.INVENTORY_DELETE
  );
}

export function canSeeAdmin(
  role
) {
  return hasPermission(
    role,
    PERMISSIONS.ADMIN_VIEW
  );
}