import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  supabase,
} from "./lib/supabase";

/* =========================================================
   CONTEXTS
========================================================= */

import {
  useAuth,
} from "./contexts/AuthContext";

import {
  SettingsProvider,
} from "./contexts/AppSettingsContext";

/* =========================================================
   ROLES / PERMISSIONS
========================================================= */

import {
  hasPermission,
  PERMISSIONS,
  ROLES,
} from "./constants/roles";

/* =========================================================
   LAYOUT
========================================================= */

import AppLayout from "./layouts/AppLayout";

/* =========================================================
   AUTH COMPONENTS
========================================================= */

import ProtectedRoute from "./components/auth/ProtectedRoute";

import AdminRoute from "./components/auth/AdminRoute";

import PermissionRoute from "./components/auth/PermissionRoute";

/* =========================================================
   COMMON
========================================================= */

import SplashScreen from "./components/common/SplashScreen";

/* =========================================================
   APP PAGES
========================================================= */

import DashboardPage from "./pages/DashboardPage";

import RoleDashboardPage from "./pages/RoleDashboardPage";

import NewSalePage from "./pages/NewSalePage";

import SalesPage from "./pages/SalesPage";

import StatisticsPage from "./pages/StatisticsPage";

import VendorStatisticsPage from "./pages/VendorStatisticsPage";

import InventoryPage from "./pages/InventoryPage";

import SettingsPage from "./pages/SettingsPage";

import HelpPage from "./pages/HelpPage";

/* =========================================================
   AUTH / USER PAGES
========================================================= */

import LoginPage from "./pages/LoginPage";

import VerifyAccountPage from "./pages/VerifyAccountPage";

import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import ResetPasswordPage from "./pages/ResetPasswordPage";

import UserPage from "./pages/UserPage";

import AdminUsersPage from "./pages/AdminUsersPage";

import InactiveAccountPage from "./pages/InactiveAccountPage";

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </SettingsProvider>
  );
}

/* =========================================================
   APP CONTENT
========================================================= */

function AppContent() {
  const {
    user,
    role,
    loading:
      authLoading,
  } = useAuth();

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const canReadSales =
    hasPermission(
      role,
      PERMISSIONS.SALES_VIEW
    );

  const canCreateSales =
    hasPermission(
      role,
      PERMISSIONS.SALES_CREATE
    );

  const canEditSales =
    hasPermission(
      role,
      PERMISSIONS.SALES_EDIT
    );

  const canDeleteSales =
    hasPermission(
      role,
      PERMISSIONS.SALES_DELETE
    );

  const canReadInventory =
    hasPermission(
      role,
      PERMISSIONS.INVENTORY_VIEW
    );

  /* =======================================================
     STATE
  ======================================================= */

  const [
    ventas,
    setVentas,
  ] = useState([]);

  const [
    inventarioCatalog,
    setInventarioCatalog,
  ] = useState([]);

  const [
    showSplash,
    setShowSplash,
  ] = useState(false);

  /* =======================================================
     FETCH SALES
  ======================================================= */

  const fetchVentas =
    useCallback(
      async () => {
        try {
          const {
            data,
            error,
          } = await supabase
            .from("ventas")
            .select("*")
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            );

          if (error) {
            throw error;
          }

          setVentas(
            data || []
          );
        } catch (error) {
          console.error(
            "Error cargando ventas:",
            error
          );

          setVentas([]);
        }
      },
      []
    );

  /* =======================================================
     FETCH INVENTORY
  ======================================================= */

  const fetchInventarioCatalog =
    useCallback(
      async () => {
        try {
          const BLOCK_SIZE =
            1000;

          let desde = 0;

          let catalogo = [];

          let hayMas = true;

          while (hayMas) {
            const {
              data,
              error,
            } = await supabase
              .from(
                "inventario"
              )
              .select("*")
              .eq(
                "activo",
                true
              )
              .order(
                "categoria",
                {
                  ascending:
                    true,
                }
              )
              .order(
                "tema",
                {
                  ascending:
                    true,
                }
              )
              .range(
                desde,
                desde +
                  BLOCK_SIZE -
                  1
              );

            if (error) {
              throw error;
            }

            const bloque =
              data || [];

            catalogo = [
              ...catalogo,
              ...bloque,
            ];

            hayMas =
              bloque.length ===
              BLOCK_SIZE;

            desde +=
              BLOCK_SIZE;
          }

          setInventarioCatalog(
            catalogo
          );
        } catch (error) {
          console.error(
            "Error cargando inventario:",
            error
          );

          setInventarioCatalog(
            []
          );
        }
      },
      []
    );

  /* =======================================================
     LOAD BUSINESS DATA
  ======================================================= */

  useEffect(() => {
    /*
     * Esperamos a conocer el perfil
     * y el rol real.
     */

    if (authLoading) {
      return;
    }

    /*
     * Sin sesión no dejamos datos
     * empresariales en memoria.
     */

    if (!user?.id) {
      setVentas([]);

      setInventarioCatalog(
        []
      );

      return;
    }

    /*
     * USUARIO normal:
     * no carga ventas.
     */

    if (canReadSales) {
      fetchVentas();
    } else {
      setVentas([]);
    }

    /*
     * USUARIO normal:
     * no carga inventario.
     */

    if (canReadInventory) {
      fetchInventarioCatalog();
    } else {
      setInventarioCatalog(
        []
      );
    }
  }, [
    user?.id,
    role,
    authLoading,
    canReadSales,
    canReadInventory,
    fetchVentas,
    fetchInventarioCatalog,
  ]);

  /* =======================================================
     SPLASH SCREEN
  ======================================================= */

  useEffect(() => {
    const standalone =
      window.matchMedia?.(
        "(display-mode: standalone)"
      )?.matches ||
      window.navigator
        .standalone ===
        true ||
      document.referrer.includes(
        "android-app://"
      );

    if (!standalone) {
      return;
    }

    setShowSplash(true);

    const timer =
      window.setTimeout(
        () => {
          setShowSplash(
            false
          );
        },
        1800
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  /* =======================================================
     CREATE SALE
  ======================================================= */

  const alGuardar =
    async (
      nuevaVenta
    ) => {
      /*
       * Protección visual adicional.
       *
       * Supabase RLS sigue siendo
       * la seguridad real.
       */

      if (!canCreateSales) {
        await Swal.fire({
          title:
            "Sin permisos",

          text:
            "Tu cuenta no puede crear ventas.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return false;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from("ventas")
          .insert([
            nuevaVenta,
          ])
          .select();

        if (error) {
          throw error;
        }

        if (data?.length) {
          setVentas(
            (previous) => [
              data[0],
              ...previous,
            ]
          );
        } else {
          await fetchVentas();
        }

        await Swal.fire({
          title:
            "¡Pedido Guardado!",

          icon:
            "success",

          confirmButtonColor:
            "#8ED4BE",

          customClass: {
            popup:
              "rounded-[3rem] font-black italic",
          },
        });

        return true;
      } catch (error) {
        console.error(
          "Error guardando venta:",
          error
        );

        await Swal.fire({
          title:
            "Error",

          text:
            error.message ||
            "No se pudo guardar la venta.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });

        return false;
      }
    };

  /* =======================================================
     DELETE SALE
  ======================================================= */

  const alEliminar =
    async (id) => {
      /*
       * Empleado NO puede eliminar.
       *
       * Superadmin, Co-admin
       * y Vendedor sí.
       */

      if (!canDeleteSales) {
        await Swal.fire({
          title:
            "Sin permisos",

          text:
            "Tu rol no puede eliminar ventas.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return false;
      }

      const result =
        await Swal.fire({
          title:
            "¿Eliminar Venta?",

          text:
            "Esta acción no se puede revertir.",

          icon:
            "warning",

          showCancelButton:
            true,

          confirmButtonText:
            "Sí, eliminar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#F79598",

          cancelButtonColor:
            "#cbd5e1",
        });

      if (!result.isConfirmed) {
        return false;
      }

      try {
        const { error } =
          await supabase
            .from("ventas")
            .delete()
            .eq("id", id);

        if (error) {
          throw error;
        }

        setVentas(
          (previous) =>
            previous.filter(
              (venta) =>
                venta.id !== id
            )
        );

        return true;
      } catch (error) {
        console.error(
          "Error eliminando venta:",
          error
        );

        await Swal.fire({
          title:
            "Error",

          text:
            error.message ||
            "No se pudo eliminar la venta.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });

        return false;
      }
    };

  /* =======================================================
   UPDATE SALE
  ======================================================= */

const alActualizar =
  async (
    id,
    dataEditada
  ) => {
    if (!canEditSales) {
      await Swal.fire({
        title:
          "Sin permisos",

        text:
          "Tu rol no puede editar ventas.",

        icon:
          "warning",

        confirmButtonColor:
          "#8ED4BE",
      });

      return false;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("ventas")
        .update({
          ...dataEditada,
        })
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      const actualizada =
        data?.[0] || {
          id,
          ...dataEditada,
        };

      setVentas(
        (previous) =>
          previous.map(
            (venta) =>
              venta.id === id
                ? {
                    ...venta,
                    ...actualizada,
                  }
                : venta
          )
      );

      await Swal.fire({
        title:
          "¡Actualizado!",

        icon:
          "success",

        timer:
          1200,

        showConfirmButton:
          false,
      });

      return true;
    } catch (error) {
      console.error(
        "Error actualizando venta:",
        error
      );

      await Swal.fire({
        title:
          "Error",

        text:
          error?.message ||
          "No se pudo actualizar la venta.",

        icon:
          "error",

        confirmButtonColor:
          "#8ED4BE",
      });

      return false;
    }
  };

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const dashboardElement =
    role ===
      ROLES.SUPERADMIN ||
    role ===
      ROLES.COADMIN ? (
      /*
       * ADMIN TOTAL / CO-ADMIN
       *
       * Dashboard completo.
       */

      <DashboardPage
        historial={ventas}
      />
    ) : (
      /*
       * VENDEDOR
       * EMPLEADO
       * USUARIO
       *
       * Dashboard personalizado
       * según rol.
       */

      <RoleDashboardPage
        ventas={ventas}
      />
    );

  /* =======================================================
     ROUTES
  ======================================================= */

  return (
    <>
      {showSplash && (
        <SplashScreen />
      )}

      <Routes>
        {/* ================================================
            PUBLIC AUTH
        ================================================ */}

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        {/* ================================================
            EMAIL OTP
        ================================================ */}

        <Route
          path="/verificar"
          element={
            <VerifyAccountPage />
          }
        />

        {/* ================================================
            PASSWORD RECOVERY
        ================================================ */}

        <Route
          path="/recuperar-contrasena"
          element={
            <ForgotPasswordPage />
          }
        />

        <Route
          path="/nueva-contrasena"
          element={
            <ResetPasswordPage />
          }
        />

        {/* ================================================
            DISABLED ACCOUNT
        ================================================ */}

        <Route
          path="/cuenta-desactivada"
          element={
            <InactiveAccountPage />
          }
        />

        {/* ================================================
            PROTECTED ALEKEY
        ================================================ */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout
                ventas={ventas}
                inventarioCatalog={
                  inventarioCatalog
                }
              />
            </ProtectedRoute>
          }
        >
          {/* =============================================
              DASHBOARD
          ============================================= */}

          <Route
            index
            element={
              dashboardElement
            }
          />

          {/* =============================================
              NUEVA VENTA
          ============================================= */}

          <Route
            path="cotizar"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS
                    .SALES_CREATE
                }
              >
                <NewSalePage
                  alGuardar={
                    alGuardar
                  }
                  inventarioCatalog={
                    inventarioCatalog
                  }
                  refrescarInventario={
                    fetchInventarioCatalog
                  }
                />
              </PermissionRoute>
            }
          />

          {/* =============================================
              VENTAS
          ============================================= */}

          <Route
            path="ventas"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS
                    .SALES_VIEW
                }
              >
                <SalesPage
                  ventas={
                    ventas
                  }
                  onDelete={
                    alEliminar
                  }
                  onUpdate={
                    alActualizar
                  }
                  inventarioCatalog={
                    inventarioCatalog
                  }
                />
              </PermissionRoute>
            }
          />

          {/* =============================================
              STATISTICS
          ============================================= */}

          <Route
            path="stats"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS
                    .STATS_VIEW
                }
              >
                {role ===
                ROLES.VENDEDOR ? (
                  /*
                   * VENDEDOR:
                   * estadísticas
                   * operativas limitadas.
                   */

                  <VendorStatisticsPage
                    ventas={
                      ventas
                    }
                  />
                ) : (
                  /*
                   * SUPERADMIN / COADMIN:
                   * estadísticas completas.
                   */

                  <StatisticsPage
                    ventas={
                      ventas
                    }
                  />
                )}
              </PermissionRoute>
            }
          />

          {/* =============================================
              INVENTORY
          ============================================= */}

          <Route
            path="inventario"
            element={
              <PermissionRoute
                permission={
                  PERMISSIONS
                    .INVENTORY_VIEW
                }
              >
                <InventoryPage
                  inventarioCatalog={
                    inventarioCatalog
                  }
                  setInventarioCatalog={
                    setInventarioCatalog
                  }
                />
              </PermissionRoute>
            }
          />

          {/* =============================================
              SETTINGS

              Todos los usuarios autenticados
              pueden entrar.
          ============================================= */}

          <Route
            path="ajustes"
            element={
              <SettingsPage />
            }
          />

          {/* =============================================
              HELP

              Todos los usuarios autenticados
              pueden entrar.
          ============================================= */}

          <Route
            path="ayuda"
            element={
              <HelpPage />
            }
          />

          {/* =============================================
              PERSONAL PROFILE

              Todos pueden entrar.
              Solo pueden modificar su nombre.
          ============================================= */}

          <Route
            path="usuario"
            element={
              <UserPage />
            }
          />

          {/* =============================================
              ADMIN PANEL

              SUPERADMIN + COADMIN

              El SQL decide qué operaciones
              puede ejecutar realmente cada uno.
          ============================================= */}

          <Route
            path="admin/usuarios"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* ================================================
            NOT FOUND
        ================================================ */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}