import SaleForm from "../components/sales/SaleForm";

export default function NewSalePage({
  alGuardar,
  inventarioCatalog = [],
  refrescarInventario,
}) {
  return (
    <SaleForm
      alGuardar={alGuardar}
      inventarioCatalog={inventarioCatalog}
      refrescarInventario={refrescarInventario}
    />
  );
}