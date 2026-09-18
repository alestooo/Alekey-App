import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

const getBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const canvas =
          document.createElement("canvas");

        canvas.width = img.width;
        canvas.height = img.height;

        const context =
          canvas.getContext("2d");

        context.drawImage(
          img,
          0,
          0
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg"
          )
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = reject;

    img.src = url;
  });
};

export const exportToPDF = async (venta) => {
  const doc = new jsPDF();

  const logo =
    await getBase64(
      logoAlekey
    );

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

  doc.addImage(
    logo,
    "JPEG",
    155,
    5,
    40,
    40
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(30);

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

  doc.setFontSize(10);

  doc.setTextColor(100);

  doc.text(
    `ORDEN: ${venta.id}`,
    15,
    35
  );

  doc.text(
    `FECHA: ${venta.fecha}`,
    15,
    42
  );

  doc.setFontSize(11);

  doc.setTextColor(40);

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
    venta.nombre || "",
    110,
    71
  );

  doc.text(
    `Tel: ${venta.telefono || ""}`,
    110,
    77
  );

  doc.text(
    `Lugar: ${venta.direccion || ""}`,
    110,
    83
  );

  const tableRows =
    (venta.items || []).map(
      (item) => [
        item.cant,

        `${item.cat} - ${item.tema}`,

        `C ${(item.precio || 0).toLocaleString()}`,

        `C ${(
          item.cant *
          item.precio
        ).toLocaleString()}`,

        item.pendiente > 0
          ? item.pendiente
          : "Entregado",
      ]
    );

  autoTable(doc, {
    startY: 95,

    head: [
      [
        "Cant.",
        "Descripcion",
        "Unitario",
        "Subtotal",
        "Pend.",
      ],
    ],

    body: tableRows,

    headStyles: {
      fillColor: [
        142,
        212,
        190,
      ],
    },
  });

  const finalY =
    doc.lastAutoTable.finalY +
    15;

  doc.setFontSize(14);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    `TOTAL FINAL: C ${(venta.total || 0).toLocaleString()}`,
    195,
    finalY,
    {
      align: "right",
    }
  );

  doc.save(
    `Cotizacion_${venta.nombre}.pdf`
  );
};