import {
  useMemo,
} from "react";

import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import DashboardPage from "./pages/DashboardPage";
import NewSalePage from "./pages/NewSalePage";
import SalesPage from "./pages/SalesPage";
import StatisticsPage from "./pages/StatisticsPage";
import InventoryPage from "./pages/InventoryPage";

import useSales from "./hooks/useSales";
import useInventory from "./hooks/useInventory";

export default function App() {
  const {
    ventas,
    alGuardarEnNube,
    alEliminar,
    alActualizar,
  } = useSales();

  const {
    inventarioCatalog,
    setInventarioCatalog,
    fetchInventarioCatalog,
  } = useInventory();

  /*
   * ========================================
   * DATALIST DE CATEGORÍAS
   * ========================================
   */

  const categoriasDatalist =
    useMemo(() => {
      const categorias = [
        ...new Set(
          (
            inventarioCatalog ||
            []
          )
            .map(
              (item) =>
                item.categoria
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "es",
          {
            sensitivity:
              "base",
          }
        )
      );

      return [
        ...categorias,
        "OTROS...",
      ];
    }, [
      inventarioCatalog,
    ]);

  /*
   * ========================================
   * DATALIST DE TEMAS
   * ========================================
   */

  const temasDatalist =
    useMemo(() => {
      return [
        ...new Set(
          (
            inventarioCatalog ||
            []
          )
            .map(
              (item) =>
                item.tema
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "es",
          {
            sensitivity:
              "base",
          }
        )
      );
    }, [
      inventarioCatalog,
    ]);

  return (
    <Router>
      <Routes>
        <Route
          element={
            <AppLayout
              categoriasDatalist={
                categoriasDatalist
              }
              temasDatalist={
                temasDatalist
              }
            />
          }
        >
          <Route
            path="/"
            element={
              <DashboardPage
                historial={
                  ventas
                }
              />
            }
          />

          <Route
            path="/cotizar"
            element={
              <NewSalePage
                alGuardar={
                  alGuardarEnNube
                }
                inventarioCatalog={
                  inventarioCatalog
                }
                refrescarInventario={
                  fetchInventarioCatalog
                }
              />
            }
          />

          <Route
            path="/ventas"
            element={
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
            }
          />

          <Route
            path="/stats"
            element={
              <StatisticsPage
                ventas={
                  ventas
                }
              />
            }
          />

          <Route
            path="/inventario"
            element={
              <InventoryPage
                inventarioCatalog={
                  inventarioCatalog
                }
                setInventarioCatalog={
                  setInventarioCatalog
                }
              />
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}