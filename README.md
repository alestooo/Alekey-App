# Alekey — Sistema de Gestión Administrativa

**Alekey** es una aplicación web administrativa desarrollada para centralizar y facilitar la operación diaria del negocio.

El sistema permite gestionar ventas, pedidos, inventario, clientes, centros educativos, pagos, productos pendientes, estadísticas, usuarios, roles y permisos desde una única plataforma.

La aplicación fue diseñada con un enfoque **responsive**, por lo que puede utilizarse tanto desde computadora como desde dispositivos móviles.

---

## Descripción

Alekey nace como una solución interna para sustituir procesos administrativos dispersos y reunir la información del negocio dentro de un solo sistema.

Desde la aplicación es posible administrar:

- Ventas y cotizaciones.
- Pedidos.
- Clientes.
- Centros educativos.
- Inventario y stock.
- Productos pendientes.
- Métodos de pago.
- Pagos pendientes.
- Historial de ventas.
- Estadísticas comerciales.
- Usuarios.
- Roles y permisos.
- Alertas operativas.
- Preferencias visuales.
- Configuración de la aplicación.

La información se almacena utilizando **Supabase**, permitiendo mantener los datos disponibles y sincronizados entre distintos dispositivos.

---

# Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Construcción de la interfaz |
| Vite | Entorno de desarrollo y compilación |
| Tailwind CSS | Diseño y estilos responsive |
| Supabase | Backend, base de datos y autenticación |
| PostgreSQL | Base de datos mediante Supabase |
| Supabase Auth | Gestión de cuentas y sesiones |
| Google OAuth | Inicio de sesión con Google |
| Gmail SMTP | Envío de OTP y recuperación de contraseña |
| React Router | Navegación de la aplicación |
| Recharts | Gráficas y estadísticas |
| Lucide React | Iconografía |
| SweetAlert2 | Alertas y confirmaciones |
| dnd-kit | Drag & drop |
| jsPDF | Generación de documentos PDF |
| jsPDF AutoTable | Tablas dentro de documentos PDF |
| SheetJS / XLSX | Manejo de información tabular |
| Motion | Animaciones de interfaz |
| Vercel | Despliegue de producción |
| pnpm | Gestión de dependencias |

---

# Arquitectura general

La aplicación utiliza una arquitectura basada en componentes y separación de responsabilidades.

```text
Frontend
   ↓
React + Vite
   ↓
Supabase Client
   ↓
Supabase Auth
PostgreSQL
RLS
RPC / funciones SQL
```

El frontend se despliega mediante **Vercel**, mientras que Supabase administra la autenticación, base de datos y políticas de acceso.

---

# Autenticación

Alekey cuenta con un sistema completo de autenticación mediante **Supabase Auth**.

Los usuarios pueden acceder mediante:

- Correo electrónico y contraseña.
- Google OAuth.

También se encuentran disponibles los procesos de:

- Crear cuenta.
- Verificar correo.
- Reenviar código OTP.
- Recuperar contraseña.
- Crear una nueva contraseña.
- Cerrar sesión.

---

## Registro de cuenta

Al crear una cuenta mediante correo electrónico, el sistema verifica primero si el correo ya se encuentra registrado.

```text
Crear cuenta
      ↓
Comprobar correo
      ↓
¿Ya existe?
   ↙       ↘
 Sí        No
 ↓          ↓
Aviso      Crear cuenta
            ↓
          OTP
```

Si el correo ya se encuentra registrado, la aplicación evita crear una cuenta duplicada.

---

## Verificación mediante OTP

Las cuentas creadas mediante correo y contraseña deben verificar su identidad utilizando un código OTP de **6 dígitos**.

El flujo general es:

```text
Crear cuenta
      ↓
Supabase registra la cuenta
      ↓
Gmail SMTP envía OTP
      ↓
Usuario recibe código
      ↓
Ingresa los 6 dígitos
      ↓
Cuenta verificada
```

Mientras el correo no haya sido verificado, el usuario no obtiene acceso normal a la aplicación.

También es posible solicitar nuevamente el código de verificación respetando los límites de envío configurados.

---

# Inicio de sesión

El sistema permite iniciar sesión utilizando:

```text
Correo + contraseña
```

o:

```text
Google OAuth
```

Cuando las credenciales son incorrectas se muestra:

```text
Correo o contraseña incorrectos.
```

Si una persona falla varias veces utilizando el mismo correo, el sistema puede sugerir utilizar la recuperación de contraseña.

Esto mejora la experiencia del usuario sin revelar cuál de las dos credenciales fue incorrecta durante el inicio de sesión.

---

# Recuperación de contraseña

Los usuarios registrados pueden solicitar un enlace para crear una nueva contraseña.

```text
Olvidé mi contraseña
        ↓
Comprobar correo
        ↓
Correo registrado
        ↓
Enviar recuperación
        ↓
Nueva contraseña
        ↓
Inicio de sesión
```

Si el correo no se encuentra registrado en Alekey, la aplicación informa que no existe una cuenta asociada.

---

# Envío de correos

Alekey utiliza **Gmail SMTP como SMTP personalizado de Supabase**.

Se utiliza para enviar:

- Códigos OTP.
- Reenvío de códigos.
- Recuperación de contraseña.
- Comunicaciones relacionadas con autenticación.

El envío de correos se realiza desde la infraestructura de Supabase y Gmail.

No depende de que una computadora local se encuentre encendida.

```text
Usuario
   ↓
Alekey
   ↓
Supabase Auth
   ↓
Gmail SMTP
   ↓
Correo del usuario
```

---

# Google OAuth

Los usuarios también pueden autenticarse mediante su cuenta de Google.

```text
Alekey
   ↓
Google
   ↓
Supabase Auth
   ↓
Sesión
```

Las cuentas autenticadas mediante Google utilizan la verificación de identidad proporcionada por Google.

---

# Sistema de roles y permisos

Alekey cuenta con cinco niveles principales de acceso.

| Rol | Nivel |
|---|---|
| Administrador total | Acceso completo |
| Co-admin | Administración operativa |
| Vendedor | Ventas e inventario |
| Empleado | Operación básica |
| Usuario | Cuenta sin permisos administrativos |

Los permisos no dependen únicamente del frontend.

Supabase también valida las operaciones mediante políticas RLS y funciones SQL protegidas.

---

# Administrador total

El **Administrador total** representa al propietario principal del sistema.

Cuenta con acceso completo a Alekey.

Puede:

- Consultar el Dashboard completo.
- Crear ventas.
- Consultar ventas.
- Editar ventas.
- Eliminar ventas.
- Consultar estadísticas completas.
- Consultar inventario.
- Crear productos.
- Editar productos.
- Eliminar productos.
- Administrar usuarios.
- Activar usuarios.
- Desactivar usuarios.
- Cambiar roles.
- Asignar Co-admins.
- Eliminar cuentas.
- Administrar el sistema.

La cuenta propietaria está protegida para evitar modificaciones accidentales.

No puede ser eliminada desde el panel administrativo.

---

# Co-admin

El rol **Co-admin** permite administrar gran parte de la operación del sistema.

Puede:

- Consultar el Dashboard completo.
- Crear ventas.
- Consultar ventas.
- Editar ventas.
- Eliminar ventas.
- Consultar estadísticas completas.
- Administrar inventario.
- Crear productos.
- Editar productos.
- Eliminar productos.
- Consultar el panel de usuarios.
- Activar usuarios.
- Desactivar usuarios de menor nivel.

No puede:

- Cambiar roles.
- Crear nuevos Co-admins.
- Eliminar usuarios.
- Modificar al Administrador total.
- Eliminar al propietario.

---

# Vendedor

El rol **Vendedor** está orientado a usuarios encargados de ventas.

Puede:

- Consultar su Dashboard.
- Utilizar accesos rápidos.
- Crear ventas.
- Consultar ventas.
- Editar ventas.
- Eliminar ventas.
- Consultar estadísticas operativas.
- Consultar inventario.
- Crear productos.
- Editar productos.
- Eliminar productos.

La información financiera completa permanece reservada para los roles administrativos.

---

# Empleado

El rol **Empleado** permite realizar operaciones básicas.

Puede:

- Consultar un Dashboard simplificado.
- Utilizar accesos rápidos.
- Consultar ventas.
- Crear ventas.
- Consultar inventario.
- Crear productos.
- Editar productos.

No puede:

- Editar ventas existentes.
- Eliminar ventas.
- Eliminar productos.
- Consultar estadísticas administrativas.
- Acceder al panel de administración.

---

# Usuario

Las cuentas nuevas utilizan inicialmente el rol:

```text
usuario
```

Una cuenta puede encontrarse correctamente verificada pero todavía no tener acceso a la información administrativa de Alekey.

Mientras un administrador no asigne un rol superior, el usuario únicamente puede acceder a funciones relacionadas con:

- Su cuenta.
- Perfil.
- Ajustes.
- Ayuda.

El usuario no puede consultar información comercial o administrativa.

---

# Administración de usuarios

Alekey incluye un panel específico para la administración de cuentas.

Cada usuario muestra:

- Nombre.
- Correo.
- Rol.
- Estado.
- Estado de verificación.
- Tipo de cuenta.

El panel permite:

- Buscar usuarios.
- Consultar roles.
- Cambiar roles.
- Activar usuarios.
- Desactivar usuarios.
- Eliminar usuarios.
- Identificar al Administrador total.

Las funciones disponibles dependen del rol del administrador conectado.

---

# Eliminación de usuarios

Únicamente el **Administrador total** puede eliminar completamente una cuenta.

La eliminación borra:

```text
Perfil interno
+
Cuenta de Supabase Auth
```

Una vez eliminada:

```text
Cuenta eliminada
      ↓
Correo disponible
      ↓
Puede registrarse nuevamente
      ↓
Nuevo OTP
      ↓
Nueva cuenta
```

Los Co-admins no tienen permiso para eliminar cuentas.

---

# Protección del propietario

La cuenta propietaria dispone de protecciones adicionales.

No puede:

- Cambiar accidentalmente su rol.
- Ser desactivada.
- Ser eliminada.
- Ser modificada por un Co-admin.

Esto reduce el riesgo de perder el acceso administrativo principal.

---

# Dashboard

El Dashboard funciona como centro de control de Alekey.

El contenido mostrado depende del rol del usuario.

El Dashboard administrativo incluye:

- Saludo personalizado.
- Fecha actual.
- Ventas totales.
- Piezas pendientes.
- Pedidos realizados.
- Gráfica de ventas recientes.
- Cantidad de pedidos.
- Piezas vendidas.
- Clientes.
- Categorías vendidas.
- Resumen rápido.
- Acciones rápidas.

---

## Acciones rápidas

Desde el Dashboard se puede acceder rápidamente a:

- Nueva venta.
- Inventario.
- Historial.
- Estadísticas.

---

# Ventas y cotizaciones

Alekey permite registrar nuevos pedidos utilizando un formulario optimizado para computadora y dispositivos móviles.

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
- Cantidad pendiente.
- Total automático.

La provincia y el cantón son opcionales.

---

# Productos dentro de una venta

Una venta puede contener múltiples productos.

Cada producto puede incluir:

```text
Categoría
Tema
Cantidad
Precio
Pendiente
Subtotal
```

Los productos utilizados se relacionan con el inventario disponible.

---

# Métodos de pago

Actualmente Alekey incluye:

- Efectivo.
- Tarjeta.
- SINPE.
- Centro Educativo.
- Cheque.
- DEBE.

---

# DEBE

El método de pago **DEBE** identifica pedidos cuyo pago todavía se encuentra pendiente.

Estos pedidos cuentan con:

- Indicador visual destacado.
- Color rojo.
- Total resaltado.
- Carpeta automática.
- Edición posterior del método de pago.

Cuando el cliente realiza el pago, se puede modificar el método directamente desde el historial.

Al dejar de utilizar `DEBE`, el pedido desaparece automáticamente de la carpeta correspondiente.

---

# Historial de ventas

El historial permite consultar todos los pedidos registrados.

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

Dependiendo del rol del usuario, es posible:

- Editar.
- Cancelar una edición.
- Eliminar.
- Generar PDF.
- Modificar productos.
- Modificar pendientes.
- Cambiar método de pago.
- Asociar el pedido a un centro educativo.

---

# Filtros de ventas

El historial permite visualizar:

- Todas las ventas.
- Ventas listas.
- Ventas con pendientes.
- Ventas que deben pagar.

También incluye:

- Buscador.
- Paginación.
- Navegación directa a páginas.
- Cantidad configurable de resultados por página.

---

# Centros educativos

Los pedidos pueden organizarse utilizando carpetas asociadas a centros educativos o instituciones.

Cada carpeta puede mostrar:

- Nombre.
- Cantidad de pedidos.
- Total acumulado.

Las carpetas pueden:

- Crearse.
- Editarse.
- Eliminarse.
- Reordenarse.
- Recibir pedidos.

El orden se conserva en la base de datos.

---

# Drag & Drop

Las carpetas utilizan **dnd-kit** para permitir reorganización mediante drag & drop.

La funcionalidad puede utilizarse desde:

- Mouse.
- Pantalla táctil.
- Dispositivos móviles.

---

# Carpetas automáticas

Alekey incluye carpetas administradas automáticamente por el sistema.

---

## DEBE

La carpeta:

```text
DEBE
```

contiene automáticamente todas las ventas cuyo método de pago sea `DEBE`.

Esta carpeta tiene prioridad visual dentro de la organización de pedidos.

---

## PENDIENTES

Los pedidos que contienen productos pendientes pueden identificarse automáticamente dentro de la carpeta correspondiente.

Esto permite localizar rápidamente pedidos que todavía necesitan completar una entrega.

---

# Inventario

El módulo de inventario permite administrar los productos disponibles.

Cada producto puede incluir:

- Categoría.
- Tema.
- Stock.
- Precio.
- Estado.

Dependiendo del rol, un usuario puede:

- Consultar productos.
- Crear productos.
- Editar productos.
- Modificar stock.
- Eliminar productos.

---

# Control de stock

El inventario permite consultar información como:

- Total de productos.
- Total de unidades.
- Stock disponible.
- Productos activos.
- Productos filtrados.

Las ventas pueden modificar las existencias de los productos relacionados.

---

# Estadísticas

Alekey incluye módulos de estadísticas para visualizar el comportamiento del negocio.

Entre los datos disponibles se encuentran:

- Ventas totales.
- Pedidos.
- Piezas vendidas.
- Productos pendientes.
- Clientes.
- Categorías.
- Ventas recientes.
- Gráficas por período.

El contenido visible depende del rol.

Los administradores pueden consultar información financiera completa.

Los vendedores reciben estadísticas operativas limitadas.

---

# Alertas

La aplicación dispone de un sistema de alertas para destacar información relevante.

Puede utilizarse para identificar:

- Productos pendientes.
- Pagos pendientes.
- Eventos importantes.
- Cambios operativos.

---

# Configuración

Cada usuario puede acceder al módulo de configuración.

Entre las opciones disponibles se encuentran:

- Tema visual.
- Modo claro.
- Modo oscuro.
- Tema del sistema.
- Cantidad de ventas por página.
- Cantidad de carpetas por página.
- Cantidad de productos de inventario por página.

Las preferencias visuales se almacenan localmente en el dispositivo.

---

# Modo claro y oscuro

Alekey cuenta con soporte para:

```text
Modo claro
Modo oscuro
Tema del sistema
```

La interfaz adapta:

- Fondos.
- Tarjetas.
- Texto.
- Navegación.
- Formularios.
- Ventas.
- Inventario.
- Estadísticas.
- Administración.

---

# Diseño responsive

La aplicación se encuentra optimizada para diferentes tamaños de pantalla.

---

## Computadora

La versión de escritorio incluye:

- Sidebar.
- Dashboard completo.
- Gráficas.
- Paneles amplios.
- Administración.
- Navegación completa.

---

## Dispositivos móviles

La versión móvil incluye:

- Navegación inferior.
- Menús adaptados.
- Formularios responsive.
- Tarjetas adaptadas.
- Acciones rápidas.
- Controles táctiles.

---

# Navegación

La navegación cambia automáticamente según los permisos del usuario.

Las principales secciones son:

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

Un usuario únicamente puede visualizar las rutas autorizadas para su rol.

---

# Perfil de usuario

Cada usuario dispone de una sección personal.

Puede consultar:

- Nombre.
- Correo.
- Rol.
- Estado.
- Estado de verificación.

Cada usuario puede modificar únicamente su propio nombre.

El correo, rol, estado administrativo y permisos se encuentran protegidos.

---

# Seguridad

Alekey utiliza múltiples capas de seguridad tanto en frontend como en backend.

Entre ellas:

- Supabase Auth.
- Sesiones mediante JWT.
- Verificación de correo.
- Google OAuth.
- OTP.
- Protección de rutas.
- Validación de usuarios activos.
- Validación de usuarios verificados.
- Roles y permisos.
- Row Level Security.
- Funciones SQL protegidas.
- RPC.
- Políticas de acceso.
- Seguridad HTTP.
- Content Security Policy.

La seguridad no depende únicamente de ocultar elementos de la interfaz.

Las operaciones sensibles también se validan directamente en Supabase.

---

# Row Level Security

Las políticas **RLS** de Supabase regulan las operaciones permitidas sobre la base de datos.

Dependiendo del rol del usuario se controla el acceso a:

```text
SELECT
INSERT
UPDATE
DELETE
```

sobre información como:

- Ventas.
- Inventario.
- Perfiles.
- Carpetas.
- Información administrativa.

---

# Funciones SQL protegidas

Las operaciones administrativas sensibles utilizan funciones SQL controladas.

Entre ellas se encuentran funciones para:

- Cambiar roles.
- Activar usuarios.
- Desactivar usuarios.
- Eliminar usuarios.
- Editar información personal permitida.
- Comprobar existencia de correos.

Estas funciones validan el rol del usuario antes de realizar cambios.

---

# Seguridad HTTP

La aplicación utiliza cabeceras HTTP de seguridad configuradas mediante **Vercel**.

Entre ellas:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

Estas cabeceras ayudan a reducir riesgos relacionados con:

- Cross-Site Scripting.
- Clickjacking.
- Carga de recursos no autorizados.
- MIME sniffing.
- Filtración innecesaria de información.
- Uso no autorizado de cámara.
- Uso no autorizado de micrófono.
- Uso no autorizado de ubicación.

---

# Content Security Policy

Alekey utiliza una política **Content-Security-Policy (CSP)**.

La CSP restringe los recursos que el navegador tiene permitido cargar.

Entre otros controles, limita:

- Scripts.
- Estilos.
- Imágenes.
- Conexiones.
- Frames.
- Formularios.
- Workers.
- Recursos externos.

Las conexiones necesarias hacia Supabase se encuentran autorizadas explícitamente.

```text
https://*.supabase.co
wss://*.supabase.co
```

Esto permite utilizar Supabase sin permitir conexiones indiscriminadas hacia otros servicios.

---

# Protección contra clickjacking

Alekey utiliza:

```text
X-Frame-Options: DENY
```

y:

```text
frame-ancestors 'none'
```

dentro de la CSP.

Esto evita que otras páginas puedan cargar Alekey dentro de un `iframe`.

---

# Permissions Policy

La aplicación restringe funciones del navegador que actualmente no necesita.

Por ejemplo:

```text
camera=()
microphone=()
geolocation=()
```

Esto evita que la aplicación solicite accidentalmente acceso a esos dispositivos.

---

# security.txt

El proyecto incluye el archivo:

```text
/.well-known/security.txt
```

Su función es indicar un canal de contacto para reportar posibles vulnerabilidades o problemas de seguridad relacionados con la aplicación.

En producción puede consultarse desde:

```text
https://alekey-app.vercel.app/.well-known/security.txt
```

---

# HTTPS

La aplicación de producción utiliza HTTPS mediante Vercel.

Esto proporciona comunicación cifrada entre el navegador del usuario y la aplicación.

El entorno de producción utiliza tecnologías como:

- HTTPS.
- TLS.
- HSTS.

---

# Variables de entorno

Las credenciales y configuraciones necesarias para conectar la aplicación con Supabase utilizan variables de entorno.

Los archivos locales como:

```text
.env
.env.local
```

no se almacenan dentro del repositorio.

Estos archivos están incluidos dentro de `.gitignore`.

---

## Variables en Vercel

Las variables necesarias en producción se configuran desde:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Esto permite mantener configuraciones fuera del código fuente.

---

# Información sensible

Nunca deben almacenarse dentro del frontend:

- Service Role Key.
- Contraseñas SMTP.
- Contraseñas personales.
- Google Client Secret.
- Tokens administrativos.
- Credenciales privadas.

El frontend únicamente debe utilizar las credenciales públicas necesarias para conectarse a Supabase.

---

# PDF

Los pedidos pueden exportarse mediante documentos PDF.

La generación utiliza:

```text
jsPDF
jsPDF AutoTable
```

Esto facilita imprimir o compartir información asociada a los pedidos.

---

# Experiencia de usuario

Alekey utiliza diferentes recursos para mejorar la experiencia del usuario.

Entre ellos:

- SweetAlert2.
- Animaciones.
- Confirmaciones.
- Indicadores visuales.
- Estados de carga.
- Iconografía consistente.
- Formularios responsive.
- Mensajes de error personalizados.
- Confirmaciones para acciones destructivas.

---

# Animaciones

La aplicación utiliza **Motion** para determinadas transiciones.

Por ejemplo:

```text
Iniciar sesión
      ↔
Crear cuenta
```

Las animaciones se mantienen cortas y discretas para no afectar la experiencia de uso.

---

# Favicon e iconos

Alekey incluye iconos optimizados para:

- Navegadores.
- Chrome.
- Edge.
- Firefox.
- Safari.
- Android.
- iPhone.
- iPad.

El proyecto contiene:

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

# Open Graph

El archivo `index.html` incluye metadatos Open Graph.

Esto permite mejorar la presentación del enlace cuando se comparte mediante plataformas compatibles como:

- WhatsApp.
- Facebook.
- Discord.
- LinkedIn.

La vista previa puede incluir:

- Nombre de Alekey.
- Descripción.
- Imagen.
- URL.

---

# Manifest

La aplicación incluye:

```text
site.webmanifest
```

con los iconos correspondientes para dispositivos móviles y navegadores compatibles.

---

# Estructura principal

```text
alekey-app/
│
├── public/
│   ├── .well-known/
│   │   └── security.txt
│   │
│   ├── alekey.png
│   ├── apple-touch-icon.png
│   ├── favicon-96x96.png
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── site.webmanifest
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
│
├── src/
│   ├── assets/
│   │   └── images/
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
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── vercel.json
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

Ejecutar el entorno de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

---

# Compilación

Para generar la versión de producción:

```bash
pnpm build
```

El resultado se genera dentro de:

```text
dist/
```

Para probar localmente el build:

```bash
pnpm preview
```

---

# Administrador de paquetes

El proyecto utiliza:

```text
pnpm
```

Se recomienda utilizar exclusivamente:

```bash
pnpm install
pnpm add
pnpm remove
pnpm dev
pnpm build
```

Esto evita conflictos entre diferentes administradores de paquetes.

El proyecto utiliza:

```text
pnpm-lock.yaml
```

como archivo de bloqueo de dependencias.

---

# Archivos ignorados por Git

El repositorio no almacena archivos generados o información sensible como:

```text
node_modules/
dist/
.env
.env.local
.vercel/
*.log
```

Esto mantiene el repositorio limpio y evita publicar información privada.

---

# Vercel

Alekey se despliega mediante **Vercel**.

El flujo general es:

```text
Desarrollo local
      ↓
Git
      ↓
GitHub
      ↓
main
      ↓
Vercel
      ↓
Producción
```

Los nuevos commits enviados a la rama principal pueden iniciar automáticamente un nuevo despliegue.

---

# Configuración de Vercel

El archivo:

```text
vercel.json
```

contiene configuración necesaria para el entorno de producción.

Incluye:

- Rewrites para React Router.
- Security Headers.
- Content Security Policy.
- Restricciones de permisos del navegador.

---

## React Router en Vercel

La aplicación utiliza un rewrite hacia:

```text
/index.html
```

para permitir acceder directamente a rutas como:

```text
/login
/ventas
/inventario
/stats
/admin/usuarios
```

sin obtener un error `404` al recargar la página.

---

# Build de producción

Antes de realizar un despliegue se recomienda ejecutar:

```bash
pnpm build
```

Un build correcto debería finalizar con un mensaje similar a:

```text
✓ built in ...
```

Los avisos relacionados con tamaño de chunks no necesariamente representan errores de compilación.

---

# Rendimiento

La aplicación utiliza varias librerías para proporcionar funcionalidades avanzadas como:

- Gráficas.
- PDF.
- XLSX.
- Drag & drop.
- Alertas.
- Animaciones.

Como parte de la evolución del proyecto se pueden aplicar optimizaciones como:

- Lazy loading.
- Dynamic imports.
- Code splitting.
- Optimización de imágenes.
- Reducción del tamaño del bundle.
- Carga diferida de módulos pesados.

---

# Objetivo del proyecto

Alekey busca digitalizar y simplificar procesos administrativos que anteriormente podían requerir múltiples herramientas o controles manuales.

Los principales objetivos son:

- Centralizar información.
- Reducir errores.
- Mantener inventario actualizado.
- Organizar pedidos.
- Controlar pagos.
- Detectar pendientes.
- Consultar estadísticas.
- Administrar usuarios.
- Aplicar permisos.
- Facilitar el trabajo desde computadora o celular.
- Mantener la información disponible desde diferentes dispositivos.

---

# Estado del proyecto

Alekey se encuentra en desarrollo activo.

Actualmente incluye los módulos principales de:

```text
Autenticación
OTP
Google OAuth
Recuperación de contraseña
Usuarios
Roles
Permisos
Dashboard
Ventas
Historial
Centros educativos
Inventario
Estadísticas
Alertas
Configuración
Perfil
Seguridad HTTP
CSP
```

El sistema continúa evolucionando mediante mejoras en:

- Seguridad.
- Rendimiento.
- Experiencia de usuario.
- Automatización.
- Administración.
- Diseño responsive.

---

# Producción

La aplicación se encuentra preparada para funcionar tanto en:

```text
Desarrollo local
```

como en:

```text
Vercel
```

La versión de producción está disponible mediante:

```text
https://alekey-app.vercel.app
```

---

# Autor

**Alejandro Soto Víquez**

Ingeniería de Software  
Universidad CENFOTEC

GitHub:

```text
alestooo
```

---

# Alekey

Sistema de gestión administrativa desarrollado específicamente para apoyar y digitalizar la operación diaria de **Alekey**.