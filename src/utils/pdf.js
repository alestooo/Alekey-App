import {
  jsPDF,
} from "jspdf";

import autoTable from "jspdf-autotable";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

/* =========================================================
   IMAGE TO BASE64
========================================================= */

const getBase64 = (
  url
) => {
  return new Promise(
    (resolve) => {
      const image =
        new Image();

      image.crossOrigin =
        "Anonymous";

      image.onload =
        () => {
          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            image.width;

          canvas.height =
            image.height;

          const context =
            canvas.getContext(
              "2d"
            );

          context?.drawImage(
            image,
            0,
            0
          );

          resolve(
            canvas.toDataURL(
              "image/jpeg"
            )
          );
        };

      image.onerror =
        () =>
          resolve(
            null
          );

      image.src =
        url;
    }
  );
};

/* =========================================================
   EXPORT SALE TO PDF
========================================================= */

export async function exportToPDF(
  venta
) {
  const doc =
    new jsPDF();

  const logo =
    await getBase64(
      logoAlekey
    );

  /* =======================================================
     HEADER
  ======================================================= */

  doc.setFillColor(
    245,
    247,
    250
  );

  doc.rect(
    0,
    0,
    210,
    50,
    "F"
  );

  if (logo) {
    doc.addImage(
      logo,
      "JPEG",
      155,
      5,
      40,
      40
    );
  }

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(
    30
  );

  doc.setTextColor(
    30,
    41,
    59
  );

  doc.text(
    "FACTURA",
    15,
    25
  );

  doc.setFontSize(
    10
  );

  doc.setTextColor(
    100
  );

  doc.text(
    `ORDEN: ${
      venta.id ||
      ""
    }`,
    15,
    35
  );

  doc.text(
    `FECHA: ${
      venta.fecha ||
      ""
    }`,
    15,
    42
  );

  /* =======================================================
     BUSINESS INFO
  ======================================================= */

  doc.setFontSize(
    11
  );

  doc.setTextColor(
    40
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "Isabel Viquez Fernandez",
    15,
    65
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    "San Joaquín de Flores",
    15,
    71
  );

  /* =======================================================
     CLIENT INFO
  ======================================================= */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "CLIENTE:",
    110,
    65
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.text(
    String(
      venta.nombre ||
      ""
    ),
    110,
    71
  );

  doc.text(
    `Tel: ${
      venta.telefono ||
      ""
    }`,
    110,
    77
  );

  doc.text(
    `Lugar: ${
      venta.direccion ||
      ""
    }`,
    110,
    83
  );

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const rows =
    (
      venta.items ||
      []
    ).map(
      (item) => [
        Number(
          item.cant
        ) || 0,

        `${
          item.cat ||
          ""
        } - ${
          item.tema ||
          ""
        }`,

        `C ${(
          Number(
            item.precio
          ) || 0
        ).toLocaleString()}`,

        `C ${(
          (
            Number(
              item.cant
            ) || 0
          ) *
          (
            Number(
              item.precio
            ) || 0
          )
        ).toLocaleString()}`,

        Number(
          item.pendiente
        ) > 0
          ? Number(
              item.pendiente
            )
          : "Entregado",
      ]
    );

  autoTable(
    doc,
    {
      startY: 100,

      head: [
        [
          "Cant.",
          "Descripción",
          "Unitario",
          "Subtotal",
          "Pend.",
        ],
      ],

      body:
        rows,

      headStyles: {
        fillColor: [
          142,
          212,
          190,
        ],
      },
    }
  );

  /* =======================================================
     TOTALS
  ======================================================= */

  const finalY =
    doc.lastAutoTable
      .finalY +
    15;

  const descuento =
    Math.max(
      0,
      Number(
        venta.descuento
      ) || 0
    );

  let totalY =
    finalY;

  /* =======================================================
     DISCOUNT
  ======================================================= */

  if (
    descuento >
    0
  ) {
    doc.setFontSize(
      11
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setTextColor(
      126,
      34,
      206
    );

    doc.text(
      `DESCUENTO: - C ${descuento.toLocaleString()}`,
      195,
      finalY,
      {
        align:
          "right",
      }
    );

    totalY =
      finalY +
      10;
  }

  /* =======================================================
     FINAL TOTAL
  ======================================================= */

  doc.setTextColor(
    40
  );

  doc.setFontSize(
    14
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    `TOTAL FINAL: C ${(
      Number(
        venta.total
      ) || 0
    ).toLocaleString()}`,
    195,
    totalY,
    {
      align:
        "right",
    }
  );

  /* =======================================================
     DEBT WARNING
  ======================================================= */

  if (
    String(
      venta.metodo_pago ||
      ""
    ).toUpperCase() ===
    "DEBE"
  ) {
    doc.setTextColor(
      220,
      38,
      38
    );

    doc.setFontSize(
      12
    );

    doc.text(
      "PAGO PENDIENTE - DEBE",
      15,
      totalY +
        12
    );
  }

  /* =======================================================
     SAVE PDF
  ======================================================= */

  doc.save(
    `Cotizacion_${
      venta.nombre ||
      venta.id
    }.pdf`
  );
}