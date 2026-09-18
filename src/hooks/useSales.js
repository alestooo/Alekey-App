import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  createSale,
  deleteSale,
  getSales,
  updateSale,
} from "../services/salesService";

export default function useSales() {
  const [
    ventas,
    setVentas,
  ] = useState([]);

  const [
    loadingSales,
    setLoadingSales,
  ] = useState(true);

  const fetchVentas =
    useCallback(async () => {
      try {
        setLoadingSales(true);

        const data =
          await getSales();

        setVentas(data);
      } catch (error) {
        console.error(
          "Error cargando ventas:",
          error
        );
      } finally {
        setLoadingSales(
          false
        );
      }
    }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const alGuardarEnNube =
    async (nuevaVenta) => {
      try {
        const data =
          await createSale(
            nuevaVenta
          );

        if (
          data &&
          data.length > 0
        ) {
          setVentas(
            (
              previous
            ) => [
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

          icon: "success",

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

        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo guardar la venta.",
          "error"
        );

        return false;
      }
    };

  const alEliminar =
    async (id) => {
      const result =
        await Swal.fire({
          title:
            "¿Eliminar Venta?",

          text:
            "Esta acción no se puede revertir",

          icon: "warning",

          showCancelButton:
            true,

          confirmButtonColor:
            "#F79598",

          cancelButtonColor:
            "#cbd5e1",
        });

      if (
        !result.isConfirmed
      ) {
        return false;
      }

      try {
        await deleteSale(id);

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

        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo eliminar la venta.",
          "error"
        );

        return false;
      }
    };

  const alActualizar =
    async (
      id,
      dataEditada
    ) => {
      try {
        await updateSale(
          id,
          dataEditada
        );

        setVentas(
          (previous) =>
            previous.map(
              (venta) =>
                venta.id === id
                  ? {
                      ...venta,
                      ...dataEditada,
                    }
                  : venta
            )
        );

        await Swal.fire({
          title:
            "¡Actualizado!",

          icon: "success",

          timer: 1500,

          showConfirmButton:
            false,
        });

        return true;
      } catch (error) {
        console.error(
          "Error actualizando venta:",
          error
        );

        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo actualizar la venta.",
          "error"
        );

        return false;
      }
    };

  return {
    ventas,
    setVentas,

    loadingSales,

    fetchVentas,

    alGuardarEnNube,
    alEliminar,
    alActualizar,
  };
}