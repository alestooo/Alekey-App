import Swal from "sweetalert2";

export async function openInventoryForm(
  categorias = []
) {
  const {
    value: formValues,
  } = await Swal.fire({
    title:
      "Nuevo Item de Inventario",

    html:
      `
        <input
          id="swal-cat"
          list="productos-list-inventory"
          class="swal2-input"
          placeholder="Categoría"
        >
      ` +
      `
        <input
          id="swal-tema"
          class="swal2-input"
          placeholder="Tema o diseño"
        >
      ` +
      `
        <input
          id="swal-stock"
          type="number"
          class="swal2-input"
          placeholder="Cantidad / Stock inicial"
          min="0"
        >
      ` +
      `
        <input
          id="swal-precio"
          type="number"
          class="swal2-input"
          placeholder="Precio"
          min="0"
        >
      ` +
      `
        <datalist id="productos-list-inventory">
          ${categorias
            .map(
              (categoria) =>
                `<option value="${categoria}"></option>`
            )
            .join("")}
          <option value="OTROS..."></option>
        </datalist>
      `,

    focusConfirm: false,

    showCancelButton:
      true,

    confirmButtonColor:
      "#C0C976",

    confirmButtonText:
      "Agregar",

    cancelButtonText:
      "Cancelar",

    preConfirm: () => {
      const categoria =
        document
          .getElementById(
            "swal-cat"
          )
          ?.value?.trim();

      const tema =
        document
          .getElementById(
            "swal-tema"
          )
          ?.value?.trim();

      const stock =
        parseInt(
          document
            .getElementById(
              "swal-stock"
            )
            ?.value
        ) || 0;

      const precio =
        parseInt(
          document
            .getElementById(
              "swal-precio"
            )
            ?.value
        ) || 0;

      if (
        !categoria ||
        !tema
      ) {
        Swal.showValidationMessage(
          "La categoría y el tema son obligatorios."
        );

        return false;
      }

      return {
        hoja_origen:
          "APP",

        categoria,

        titulo_interno_original:
          "APP",

        numero: 0,

        tema,

        cantidad:
          stock,

        vendidos: 0,

        x_mayor: 0,

        stock,

        precio,

        precio_mayor: 0,

        total: 0,

        notas:
          "Agregado desde la app",

        cantidad_stock_igual:
          "Sí",

        activo: true,
      };
    },
  });

  return (
    formValues || null
  );
}

export default function InventoryForm() {
  return null;
}