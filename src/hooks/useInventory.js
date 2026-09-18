import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getActiveInventory,
} from "../services/inventoryService";

export default function useInventory() {
  const [
    inventarioCatalog,
    setInventarioCatalog,
  ] = useState([]);

  const [
    loadingInventory,
    setLoadingInventory,
  ] = useState(true);

  const fetchInventarioCatalog =
    useCallback(async () => {
      try {
        setLoadingInventory(
          true
        );

        const catalogo =
          await getActiveInventory();

        setInventarioCatalog(
          catalogo
        );

        return catalogo;
      } catch (error) {
        console.error(
          "Error cargando el catálogo completo:",
          error
        );

        return [];
      } finally {
        setLoadingInventory(
          false
        );
      }
    }, []);

  useEffect(() => {
    fetchInventarioCatalog();
  }, [
    fetchInventarioCatalog,
  ]);

  return {
    inventarioCatalog,

    setInventarioCatalog,

    loadingInventory,

    fetchInventarioCatalog,
  };
}