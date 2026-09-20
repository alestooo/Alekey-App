# Alekey — Sistema de Gestión Administrativa

**Alekey** es una aplicación web administrativa diseñada para centralizar y facilitar la operación diaria del negocio.

El sistema permite gestionar ventas, pedidos, inventario, clientes, centros educativos, pagos, productos pendientes, usuarios, permisos y estadísticas desde una misma plataforma.

La aplicación fue desarrollada con un enfoque **responsive**, por lo que puede utilizarse cómodamente tanto en computadora como en dispositivos móviles.

---

## Descripción

Alekey nace como una solución interna para sustituir procesos administrativos dispersos y reunir la información del negocio en un único sistema.

Desde la aplicación es posible controlar:

- Ventas y cotizaciones.
- Pedidos realizados.
- Clientes.
- Centros educativos.
- Inventario y stock.
- Productos pendientes.
- Métodos de pago.
- Pagos pendientes.
- Historial de ventas.
- Estadísticas comerciales.
- Usuarios y roles.
- Permisos de acceso.
- Alertas operativas.
- Preferencias visuales.
- Configuración de la aplicación.

La información se almacena en **Supabase**, permitiendo mantener los datos sincronizados y disponibles desde distintos dispositivos.

---

# Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Construcción de la interfaz |
| Vite | Entorno de desarrollo y compilación |
| Tailwind CSS | Diseño y estilos responsive |
| Supabase | Base de datos y autenticación |
| PostgreSQL | Base de datos utilizada mediante Supabase |
| Supabase Auth | Inicio de sesión y gestión de cuentas |
| Google OAuth | Inicio de sesión con Google |
| Gmail SMTP | Envío de OTP y recuperación de contraseña |
| React Router | Navegación de la aplicación |
| Recharts | Gráficas y estadísticas |
| Lucide React | Iconografía |
| SweetAlert2 | Alertas y confirmaciones |
| dnd-kit | Drag & drop |
| jsPDF | Generación de documentos PDF |
| SheetJS / XLSX | Manejo de información tabular |
| Motion | Animaciones de interfaz |
| Vercel | Despliegue de producción |

---

# Autenticación

Alekey cuenta con un sistema completo de autenticación utilizando **Supabase Auth**.

Los usuarios pueden acceder mediante:

- Correo electrónico y contraseña.
- Google OAuth.

También se encuentran disponibles los procesos de:

- Crear una cuenta.
- Verificar correo mediante OTP.
- Reenviar código de verificación.
- Recuperar contraseña.
- Establecer una nueva contraseña.
- Cerrar sesión.

---

## Verificación mediante OTP

Cuando un usuario crea una cuenta mediante correo y contraseña, recibe un código de verificación de **6 dígitos**.

La cuenta no obtiene acceso completo hasta confirmar correctamente dicho código.

Flujo general:

```text
Crear cuenta
      ↓
Se registra el correo
      ↓
Se envía código OTP
      ↓
Usuario ingresa los 6 dígitos
      ↓
Correo verificado
      ↓
Cuenta disponible
```

Si el correo ya se encuentra registrado, el sistema evita crear una cuenta duplicada.

---

## Recuperación de contraseña

Los usuarios registrados pueden solicitar un enlace de recuperación.

```text
Olvidé mi contraseña
        ↓
Verificación del correo
        ↓
Correo de recuperación
        ↓
Nueva contraseña
        ↓
Inicio de sesión
```

Si el correo no se encuentra registrado, el sistema informa al usuario antes de realizar el envío.

---

## Envío de correos

Alekey utiliza **SMTP personalizado mediante Gmail** para los correos de autenticación.

Esto permite gestionar:

- Códigos OTP.
- Reenvío de códigos.
- Recuperación de contraseña.
- Correos relacionados con autenticación.

El envío se realiza desde Supabase y no depende de que una computadora local se encuentre encendida.

---

# Sistema de roles y permisos

Alekey cuenta con cinco niveles de acceso.

| Rol | Nivel de acceso |
|---|---|
| Administrador total | Acceso completo |
| Co-admin | Administración operativa |
| Vendedor | Ventas e inventario |
| Empleado | Operación básica |
| Usuario | Cuenta sin permisos administrativos |

---

## Administrador total

El **Administrador total** es el propietario principal del sistema.

Tiene acceso a todas las funciones de Alekey:

- Dashboard completo.
- Ventas.
- Creación de pedidos.
- Edición de ventas.
- Eliminación de ventas.
- Estadísticas completas.
- Inventario.
- Creación de productos.
- Edición de productos.
- Eliminación de productos.
- Administración de usuarios.
- Activación y desactivación de cuentas.
- Asignación de roles.
- Creación de Co-admins.
- Eliminación completa de cuentas.

La cuenta propietaria del sistema se encuentra protegida y no puede ser eliminada ni modificada desde el panel administrativo.

---

## Co-admin

El Co-admin puede administrar gran parte de la operación del sistema.

Cuenta con acceso a:

- Dashboard completo.
- Ventas.
- Creación de ventas.
- Edición de ventas.
- Eliminación de ventas.
- Estadísticas completas.
- Inventario completo.
- Administración de usuarios.
- Activación y desactivación de usuarios de menor nivel.

No puede:

- Modificar roles.
- Crear otros Co-admins.
- Eliminar cuentas.
- Modificar al Administrador total.

---

## Vendedor

El rol Vendedor está orientado al personal encargado de ventas.

Puede:

- Consultar su Dashboard.
- Crear ventas.
- Consultar ventas.
- Editar ventas.
- Eliminar ventas.
- Consultar estadísticas operativas.
- Consultar inventario.
- Crear productos.
- Editar productos.
- Eliminar productos.

Las estadísticas financieras completas permanecen reservadas para los administradores.

---

## Empleado

El rol Empleado permite trabajar con las operaciones básicas.

Puede:

- Consultar el Dashboard básico.
- Utilizar accesos rápidos.
- Consultar ventas.
- Crear ventas.
- Consultar inventario.
- Crear productos.
- Editar productos.

No puede:

- Editar ventas existentes.
- Eliminar ventas.
- Eliminar productos del inventario.
- Consultar estadísticas.
- Acceder al panel administrativo.

---

## Usuario

Una cuenta nueva comienza con el rol **Usuario**.

Esto significa que la identidad ya puede estar verificada, pero todavía no posee permisos para consultar información administrativa del negocio.

El usuario debe esperar a que un Administrador asigne uno de los roles disponibles.

Mientras tanto puede acceder únicamente a funciones relacionadas con su cuenta y configuración.

---

# Administración de usuarios

El panel de Administración permite visualizar todas las cuentas registradas.

Cada usuario muestra:

- Nombre.
- Correo electrónico.
- Rol.
- Estado.
- Tipo de cuenta.
- Estado de actividad.

Desde este panel, dependiendo del rol del administrador, es posible:

- Buscar usuarios.
- Cambiar roles.
- Activar cuentas.
- Desactivar cuentas.
- Eliminar cuentas.
- Identificar al propietario del sistema.

---

## Eliminación de usuarios

El Administrador total puede eliminar completamente una cuenta.

La eliminación borra al usuario del sistema de autenticación y de los perfiles internos de Alekey.

Una vez eliminada:

```text
Cuenta eliminada
      ↓
Correo disponible nuevamente
      ↓
El usuario puede registrarse otra vez
      ↓
Nuevo OTP
      ↓
Nueva cuenta
```

Esta función se encuentra disponible únicamente para el Administrador total.

---

# Dashboard

El Dashboard funciona como el centro de control principal del sistema.

Dependiendo del rol del usuario puede mostrar diferentes niveles de información.

El Dashboard administrativo incluye:

- Saludo personalizado.
- Fecha actual.
- Ventas totales.
- Piezas pendientes.
- Pedidos realizados.
- Ventas de los últimos siete días.
- Cantidad de clientes.
- Cantidad de piezas vendidas.
- Categorías vendidas.
- Resumen rápido.
- Acciones rápidas.

Entre los accesos rápidos se encuentran:

- Nueva venta.
- Inventario.
- Historial.
- Estadísticas.

---

# Ventas y cotizaciones

Alekey permite registrar pedidos mediante un formulario diseñado para ser utilizado tanto en computadora como en dispositivos móviles.

Cada venta puede incluir:

- Nombre del cliente.
- Teléfono.
- Provincia.
- Cantón.
- Vendedor.
- Método de pago.
- Comentarios.
- Múltiples productos.
- Cantidad.
- Precio.
- Productos pendientes.
- Total automático.

La provincia y el cantón son campos opcionales.

Los productos utilizados en las ventas se encuentran relacionados con el inventario.

---

# Métodos de pago

Actualmente se encuentran disponibles los siguientes métodos:

- Efectivo.
- Tarjeta.
- SINPE.
- Centro Educativo.
- Cheque.
- DEBE.

---

## DEBE

El método **DEBE** se utiliza para identificar pedidos cuyo pago todavía se encuentra pendiente.

Las ventas marcadas como DEBE cuentan con:

- Identificación visual destacada.
- Indicador rojo.
- Total resaltado.
- Carpeta automática.
- Modificación posterior del método de pago.

Cuando el cliente realiza el pago, el método puede cambiarse desde el historial.

Al dejar de utilizar `DEBE`, el pedido se elimina automáticamente de la carpeta correspondiente.

---

# Historial de ventas

El historial permite consultar y administrar los pedidos registrados.

Cada venta puede mostrar:

- Cliente.
- Código de pedido.
- Fecha.
- Teléfono.
- Ubicación.
- Vendedor.
- Método de pago.
- Productos.
- Cantidades.
- Productos pendientes.
- Subtotales.
- Total.

Dependiendo de los permisos del usuario, desde una venta se puede:

- Editar.
- Cancelar una edición.
- Eliminar.
- Generar PDF.
- Modificar productos.
- Modificar pendientes.
- Cambiar método de pago.
- Asociar a un centro educativo.

---

# Filtros de ventas

El historial cuenta con diferentes vistas para facilitar la búsqueda de pedidos.

Se pueden consultar:

- Todas las ventas.
- Ventas listas.
- Ventas pendientes.
- Ventas con pagos pendientes.

También incluye:

- Buscador.
- Paginación.
- Navegación por páginas.
- Cantidad configurable de resultados por página.

---

# Centros educativos

Los pedidos pueden organizarse mediante carpetas asociadas a centros educativos o instituciones.

Cada carpeta muestra:

- Nombre.
- Cantidad de pedidos.
- Total acumulado.

Las carpetas permiten:

- Crear.
- Editar.
- Eliminar.
- Reordenar.
- Mover pedidos.

El orden se almacena en la base de datos.

---

# Drag & Drop

Las carpetas pueden reorganizarse mediante **drag & drop** utilizando `dnd-kit`.

La funcionalidad está diseñada para funcionar tanto con:

- Mouse.
- Pantallas táctiles.
- Dispositivos móviles.

---

# Carpetas automáticas

Alekey incluye carpetas especiales administradas automáticamente por el sistema.

---

## DEBE

La carpeta `DEBE` contiene automáticamente todas las ventas cuyo método de pago sea:

```text
DEBE
```

Esta carpeta tiene prioridad visual y aparece primero dentro de la organización de pedidos.

---

## PENDIENTES

Los pedidos que contienen productos pendientes también pueden organizarse automáticamente.

Esto permite identificar rápidamente cuáles pedidos todavía requieren completar una entrega.

---

# Inventario

El módulo de Inventario permite administrar los productos disponibles en Alekey.

Cada producto puede contener:

- Categoría.
- Tema.
- Stock.
- Precio.
- Estado.

Dependiendo del rol, los usuarios pueden:

- Consultar productos.
- Crear productos.
- Editar productos.
- Modificar stock.
- Eliminar productos.

---

## Control de stock

El inventario permite consultar:

- Total de productos.
- Total de unidades.
- Stock disponible.
- Productos activos.
- Productos filtrados.

Las ventas pueden modificar las existencias correspondientes a los productos utilizados.

---

# Estadísticas

Alekey incluye un módulo de estadísticas para visualizar el comportamiento del negocio.

Entre los datos disponibles se encuentran:

- Ventas totales.
- Pedidos.
- Piezas vendidas.
- Productos pendientes.
- Clientes.
- Categorías.
- Ventas recientes.
- Gráficas por período.

El nivel de información visible depende del rol.

Los administradores pueden consultar información financiera completa, mientras que otros roles reciben únicamente métricas operativas autorizadas.

---

# Alertas

La aplicación cuenta con un sistema de alertas para destacar información importante.

Puede utilizarse para identificar situaciones como:

- Productos pendientes.
- Pagos pendientes.
- Eventos operativos.
- Cambios relevantes dentro del sistema.

---

# Configuración

Los usuarios pueden acceder al módulo de configuración para modificar preferencias de la aplicación.

Entre las opciones disponibles se encuentran:

- Tema visual.
- Modo claro.
- Modo oscuro.
- Tema del sistema.
- Cantidad de ventas por página.
- Cantidad de carpetas por página.
- Cantidad de productos de inventario por página.

Las preferencias se conservan localmente en el dispositivo.

---

# Modo claro y oscuro

Alekey cuenta con soporte completo para:

```text
Modo claro
Modo oscuro
Tema del sistema
```

La interfaz adapta automáticamente:

- Fondos.
- Tarjetas.
- Texto.
- Controles.
- Navegación.
- Panel administrativo.
- Inventario.
- Ventas.
- Estadísticas.

---

# Diseño responsive

La interfaz está optimizada para distintos tamaños de pantalla.

### Computadora

Incluye:

- Sidebar lateral.
- Paneles amplios.
- Estadísticas completas.
- Gráficas.
- Navegación administrativa.

### Dispositivos móviles

Incluye:

- Navegación inferior.
- Menús adaptados.
- Formularios optimizados.
- Tarjetas responsive.
- Acciones rápidas.
- Controles táctiles.

---

# Navegación

La navegación disponible cambia automáticamente dependiendo de los permisos del usuario.

Entre las secciones principales se encuentran:

```text
Inicio
Nueva venta
Ventas
Estadísticas
Stock
Administración
Ajustes
Ayuda
Perfil
```

Un usuario solo puede visualizar las secciones correspondientes a su rol.

---

# Perfil de usuario

Cada usuario dispone de una sección personal.

Desde ella puede consultar:

- Nombre.
- Correo.
- Rol.
- Estado.
- Estado de verificación.

El usuario puede modificar únicamente su propio nombre.

Datos como correo, rol, estado administrativo y permisos están protegidos.

---

# Seguridad

Alekey utiliza diferentes capas de seguridad.

Entre ellas:

- Supabase Auth.
- Autenticación mediante JWT.
- Row Level Security.
- Funciones SQL protegidas.
- Control de permisos por rol.
- Protección de rutas.
- Verificación de correo.
- Validación de usuarios activos.
- Separación entre identidad y autorización.

La seguridad no depende únicamente de la interfaz.

Las operaciones sensibles también se validan directamente en Supabase.

Esto evita que un usuario pueda obtener permisos simplemente modificando el frontend.

---

# Row Level Security

Las políticas RLS de Supabase controlan las operaciones permitidas sobre la base de datos.

Dependiendo del rol se regula el acceso a:

```text
SELECT
INSERT
UPDATE
DELETE
```

en tablas como:

- Ventas.
- Inventario.
- Perfiles.
- Carpetas.
- Información administrativa.

---

# Protección del Administrador total

La cuenta propietaria del sistema dispone de protecciones adicionales.

No puede:

- Cambiar su propio rol.
- Desactivarse desde el panel.
- Eliminarse.
- Ser modificada por un Co-admin.

Esto reduce el riesgo de perder accidentalmente el acceso administrativo principal.

---

# PDF

Los pedidos pueden exportarse mediante documentos PDF.

La generación de documentos utiliza:

```text
jsPDF
jsPDF AutoTable
```

Esto facilita imprimir o compartir información relacionada con los pedidos.

---

# Experiencia de usuario

La aplicación utiliza diferentes recursos para mejorar la experiencia:

- SweetAlert2 para confirmaciones.
- Animaciones de transición.
- Indicadores visuales.
- Iconografía consistente.
- Feedback al guardar cambios.
- Estados de carga.
- Formularios adaptados.
- Confirmaciones antes de acciones destructivas.

---

# Favicon y aplicación web

Alekey cuenta con iconos optimizados para:

- Navegadores web.
- Chrome.
- Edge.
- Firefox.
- Safari.
- Android.
- iPhone.
- iPad.

El proyecto incluye:

```text
favicon.ico
favicon.svg
favicon-96x96.png
apple-touch-icon.png
site.webmanifest
web-app-manifest-192x192.png
web-app-manifest-512x512.png
```

---

# Estructura principal

```text
alekey-app/
│
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── favicon-96x96.png
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── inventory/
│   │   ├── navigation/
│   │   └── sales/
│   │
│   ├── constants/
│   │
│   ├── contexts/
│   │   ├── AppSettingsContext.jsx
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── layouts/
│   │
│   ├── lib/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │
│   ├── styles/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
└── README.md
```

---

# Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar al proyecto:

```bash
cd alekey-app
```

Instalar dependencias:

```bash
pnpm install
```

Ejecutar en desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

---

# Compilación

Para generar una versión de producción:

```bash
pnpm build
```

Para probar localmente el build:

```bash
pnpm preview
```

---

# Variables de entorno

La conexión con Supabase debe configurarse mediante variables de entorno.

Las credenciales privadas o claves administrativas nunca deben almacenarse directamente dentro del código fuente ni subirse al repositorio.

El frontend debe utilizar únicamente las credenciales públicas correspondientes al cliente de Supabase.

---

# Despliegue

La aplicación se encuentra preparada para desplegarse mediante **Vercel**.

El flujo utilizado es:

```text
GitHub
   ↓
main
   ↓
Vercel
   ↓
Producción
```

Cada actualización enviada a la rama principal puede generar automáticamente un nuevo despliegue.

---

# Desarrollo

El proyecto utiliza **pnpm** como administrador de paquetes.

Se recomienda utilizar exclusivamente:

```bash
pnpm install
pnpm add
pnpm dev
pnpm build
```

para evitar conflictos entre distintos gestores de dependencias.

---

# Objetivo del proyecto

Alekey busca digitalizar y simplificar procesos que anteriormente podían requerir múltiples herramientas o controles manuales.

El objetivo principal es disponer de una plataforma centralizada que permita:

- Reducir errores.
- Mantener el inventario actualizado.
- Organizar pedidos.
- Controlar pagos.
- Detectar productos pendientes.
- Consultar estadísticas.
- Gestionar usuarios.
- Mantener información accesible.
- Facilitar el trabajo desde computadora o celular.

---

# Estado del proyecto

Alekey se encuentra en desarrollo activo.

Actualmente cuenta con los módulos principales de:

```text
Autenticación
Usuarios y permisos
Dashboard
Ventas
Historial
Centros educativos
Inventario
Estadísticas
Alertas
Configuración
Perfil
```

El sistema continúa evolucionando mediante mejoras en experiencia de usuario, seguridad, automatización y administración del negocio.

---

## Autor

**Alejandro Soto Víquez**

Ingeniería de Software  
Universidad CENFOTEC

GitHub: `alestooo`

---

## Alekey

Sistema interno de gestión administrativa desarrollado específicamente para apoyar la operación diaria de **Alekey**.