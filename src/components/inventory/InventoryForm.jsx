import Swal from "sweetalert2";

/*
 * ========================================
 * HELPERS
 * ========================================
 */

const escapeHtml = (
  value = ""
) => {
  return String(value).replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };

      return entities[
        character
      ];
    }
  );
};

const getNumber = (
  id,
  type = "int"
) => {
  const element =
    document.getElementById(
      id
    );

  if (!element) {
    return 0;
  }

  if (
    type === "float"
  ) {
    return Math.max(
      0,
      Number.parseFloat(
        element.value
      ) || 0
    );
  }

  return Math.max(
    0,
    Number.parseInt(
      element.value,
      10
    ) || 0
  );
};

/*
 * ========================================
 * HTML DEL FORMULARIO
 * ========================================
 */

const createFormHtml = ({
  categorias = [],
  item = null,
}) => {
  const categoria =
    item?.categoria || "";

  const tema =
    item?.tema || "";

  const stock =
    Number(item?.stock) || 0;

  const precio =
    Number(item?.precio) || 0;

  const options =
    categorias
      .filter(Boolean)
      .map(
        (category) =>
          `<option value="${escapeHtml(
            category
          )}"></option>`
      )
      .join("");

  return `
    <div
      style="
        display:flex;
        flex-direction:column;
        gap:16px;
        text-align:left;
        padding:6px 4px 0;
      "
    >

      <div>
        <label
          for="inventory-category"
          style="
            display:block;
            font-size:11px;
            font-weight:900;
            text-transform:uppercase;
            letter-spacing:.12em;
            color:#94a3b8;
            margin:0 0 7px 5px;
          "
        >
          Categoría
        </label>

        <input
          id="inventory-category"
          list="inventory-category-list"
          type="text"
          value="${escapeHtml(
            categoria
          )}"
          placeholder="Ej: Banderín"
          style="
            width:100%;
            box-sizing:border-box;
            padding:14px 16px;
            border:2px solid #e2e8f0;
            border-radius:16px;
            outline:none;
            font-weight:800;
            font-size:14px;
          "
        />

        <datalist
          id="inventory-category-list"
        >
          ${options}
          <option value="OTROS..."></option>
        </datalist>
      </div>


      <div>
        <label
          for="inventory-theme"
          style="
            display:block;
            font-size:11px;
            font-weight:900;
            text-transform:uppercase;
            letter-spacing:.12em;
            color:#94a3b8;
            margin:0 0 7px 5px;
          "
        >
          Nombre / Tema
        </label>

        <input
          id="inventory-theme"
          type="text"
          value="${escapeHtml(
            tema
          )}"
          placeholder="Ej: Abeja Acuarela"
          style="
            width:100%;
            box-sizing:border-box;
            padding:14px 16px;
            border:2px solid #e2e8f0;
            border-radius:16px;
            outline:none;
            font-weight:800;
            font-size:14px;
          "
        />
      </div>


      <div
        style="
          display:grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap:12px;
        "
      >

        <div>
          <label
            for="inventory-stock"
            style="
              display:block;
              font-size:11px;
              font-weight:900;
              text-transform:uppercase;
              letter-spacing:.12em;
              color:#94a3b8;
              margin:0 0 7px 5px;
            "
          >
            Stock
          </label>

          <input
            id="inventory-stock"
            type="number"
            min="0"
            step="1"
            value="${stock}"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px 16px;
              border:2px solid #e2e8f0;
              border-radius:16px;
              outline:none;
              font-weight:800;
              font-size:14px;
            "
          />
        </div>


        <div>
          <label
            for="inventory-price"
            style="
              display:block;
              font-size:11px;
              font-weight:900;
              text-transform:uppercase;
              letter-spacing:.12em;
              color:#94a3b8;
              margin:0 0 7px 5px;
            "
          >
            Precio
          </label>

          <input
            id="inventory-price"
            type="number"
            min="0"
            step="1"
            value="${precio}"
            style="
              width:100%;
              box-sizing:border-box;
              padding:14px 16px;
              border:2px solid #e2e8f0;
              border-radius:16px;
              outline:none;
              font-weight:800;
              font-size:14px;
            "
          />
        </div>

      </div>
    </div>
  `;
};

/*
 * ========================================
 * OBTENER DATOS
 * ========================================
 */

const readFormValues =
  () => {
    const categoria =
      document
        .getElementById(
          "inventory-category"
        )
        ?.value.trim() ||
      "";

    const tema =
      document
        .getElementById(
          "inventory-theme"
        )
        ?.value.trim() ||
      "";

    const stock =
      getNumber(
        "inventory-stock"
      );

    const precio =
      getNumber(
        "inventory-price",
        "float"
      );

    if (!categoria) {
      Swal.showValidationMessage(
        "Debes escribir una categoría."
      );

      return false;
    }

    if (!tema) {
      Swal.showValidationMessage(
        "Debes escribir el nombre o tema del producto."
      );

      return false;
    }

    return {
      categoria,
      tema,
      stock,
      precio,
    };
  };

/*
 * ========================================
 * NUEVO PRODUCTO
 * ========================================
 */

export async function openInventoryForm(
  categorias = []
) {
  const result =
    await Swal.fire({
      title:
        "Nuevo producto",

      html: createFormHtml({
        categorias,
      }),

      width: 560,

      showCancelButton:
        true,

      confirmButtonText:
        "Agregar",

      cancelButtonText:
        "Cancelar",

      confirmButtonColor:
        "#C0C976",

      cancelButtonColor:
        "#64748b",

      focusConfirm:
        false,

      preConfirm:
        readFormValues,

      customClass: {
        popup:
          "rounded-[2rem]",
      },
    });

  if (!result.value) {
    return null;
  }

  const {
    categoria,
    tema,
    stock,
    precio,
  } = result.value;

  return {
    hoja_origen: "APP",

    categoria,

    titulo_interno_original:
      "APP",

    numero: 0,

    tema,

    cantidad: stock,

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
}

/*
 * ========================================
 * EDITAR PRODUCTO
 * ========================================
 */

export async function openInventoryEditForm(
  item,
  categorias = []
) {
  const result =
    await Swal.fire({
      title:
        "Editar producto",

      html: createFormHtml({
        categorias,
        item,
      }),

      width: 560,

      showCancelButton:
        true,

      confirmButtonText:
        "Guardar cambios",

      cancelButtonText:
        "Cancelar",

      confirmButtonColor:
        "#C0C976",

      cancelButtonColor:
        "#64748b",

      focusConfirm:
        false,

      preConfirm:
        readFormValues,

      customClass: {
        popup:
          "rounded-[2rem]",
      },
    });

  if (!result.value) {
    return null;
  }

  return result.value;
}

/*
 * Se conserva un default export
 * para no romper imports antiguos.
 */

export default function InventoryForm() {
  return null;
}