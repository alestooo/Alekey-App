# Alekey - Sistema de Gestión Administrativa

Sistema web administrativo desarrollado para **Alekey**, enfocado en la gestión de ventas, pedidos, inventario, clientes, centros educativos y estadísticas del negocio.

La aplicación centraliza la operación diaria en una interfaz moderna, responsive y optimizada tanto para computadora como para dispositivos móviles.

---

## Descripción

Alekey permite administrar desde un mismo sistema:

- Ventas y cotizaciones.
- Pedidos pendientes.
- Clientes.
- Centros educativos.
- Métodos de pago.
- Inventario y stock.
- Productos pendientes de entregar.
- Estadísticas comerciales.
- Alertas operativas.
- Configuración visual y preferencias de la aplicación.

El sistema utiliza **Supabase** como base de datos y está desarrollado con **React, Vite y Tailwind CSS**.

---

## Funcionalidades principales

### Dashboard

El Dashboard funciona como centro de control general de Alekey.

Incluye:

- Ventas totales.
- Cantidad de pedidos realizados.
- Piezas pendientes.
- Resumen general del negocio.
- Ventas de los últimos días.
- Últimos pedidos.
- Estado de pedidos.
- Top cliente.
- Accesos rápidos a:
  - Nueva venta.
  - Historial.
  - Estadísticas.
  - Inventario.

---

## Ventas y cotizaciones

El sistema permite crear nuevos pedidos mediante un formulario optimizado para escritorio y dispositivos móviles.

Cada venta puede incluir:

- Nombre del cliente.
- Teléfono.
- Provincia.
- Cantón.
- Vendedor.
- Método de pago.
- Comentarios.
- Múltiples productos.
- Cantidad por producto.
- Precio.
- Cantidad pendiente.
- Total automático.

La provincia y el cantón son opcionales.

Los productos se conectan directamente con el inventario disponible.

---

## Métodos de pago

Los métodos de pago disponibles son:

- Efectivo.
- Tarjeta.
- SINPE.
- Centro Educativo.
- Cheque.
- DEBE.

### DEBE

Cuando una venta utiliza el método de pago **DEBE**, el sistema la identifica inmediatamente como un pago pendiente.

Estas ventas cuentan con:

- Marcado visual rojo.
- Indicador destacado dentro del historial.
- Total resaltado.
- Acceso rápido para modificar posteriormente el método de pago.
- Inclusión automática dentro de la carpeta `DEBE`.

Cuando el cliente realiza el pago, el método puede modificarse desde el historial y el pedido deja automáticamente la carpeta DEBE.

---

## Historial de ventas

El historial permite consultar y administrar todos los pedidos registrados.

Cada venta muestra:

- Cliente.
- Código del pedido.
- Fecha.
- Teléfono.
- Ubicación.
- Vendedor.
- Método de pago.
- Productos.
- Cantidades.
- Productos pendientes.
- Subtotales.
- Total final.

Desde cada pedido se puede:

- Editar.
- Cancelar una edición.
- Eliminar.
- Imprimir o generar PDF.
- Agregar a un centro educativo.
- Cambiar el método de pago.
- Modificar pendientes.
- Modificar productos.

---

## Filtros de ventas

El historial permite visualizar:

- Todas las ventas.
- Ventas listas.
- Ventas con productos pendientes.
- Ventas que deben pagar.

También cuenta con:

- Buscador.
- Paginación.
- Navegación directa hacia una página específica.
- Cantidad configurable de ventas por página.

---

## Centros educativos

Los pedidos pueden organizarse mediante carpetas correspondientes a centros educativos o instituciones.

Cada carpeta muestra:

- Nombre del centro.
- Cantidad de pedidos.
- Total acumulado.

Las carpetas pueden:

- Crearse.
- Editarse.
- Eliminarse.
- Reordenarse mediante drag & drop.
- Moverse fácilmente tanto desde PC como desde dispositivos táctiles.

La posición de las carpetas se conserva en la base de datos.

---

## Carpetas automáticas

El sistema incluye carpetas especiales administradas automáticamente.

### DEBE

Siempre aparece como la primera carpeta.

Contiene todos los pedidos cuyo método de pago sea:

```text
DEBE