# Recetas de layout Lexy

Composiciones canónicas listas para adaptar. Cada receta indica para qué **mundo**
es (cliente o CRM), qué componentes del registry usa y el patrón. Úsalas como punto
de partida; no como plantilla rígida que se pega sin pensar la tarea real.

## Antes de copiar

- **Las recetas 1–5 y 7 existen como blocks instalables**: `npx create-lexy add
  intake-wizard | confirmacion | login | crm-desk | crm-detalle-caso | crm-app-layout`
  instala la vista en tu proyecto con todos sus componentes resueltos — parte de ahí
  y edítala con libertad en vez de copiar el código de esta pauta.
- **Si copias a mano, instala los componentes primero.** Cada componente de la receta
  debe estar en tu proyecto: `npx create-lexy add button input label …` (resuelve
  dependencias internas solo).
- **Imports locales.** Los ejemplos usan el deletreo de la arquitectura *layer*
  (`@/components/base/X`); en *feature* es `@/shared/components/base/X`. El patrón exacto
  de tu proyecto está en `componentImportPattern` de `ai/lexy-ai-manifest.json` — síguelo.
- Aplica densidad y tokens según [sistema-visual.md](sistema-visual.md) y las reglas de [buenas-practicas.md](buenas-practicas.md).

---

## 1. Cliente — Intake / ficha web (paso de wizard)

**Mundo:** cliente. **Patrón:** un paso enfocado, columna angosta, calma, CTA al final.
**Componentes:** `Progress`, `Input`, `Label`, `Button`, `Textarea`.

```tsx
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Label } from "@/components/base/Label";
import { Progress } from "@/components/base/Progress";

export function IntakeDatosPersonales() {
  return (
    <main className='mx-auto w-full max-w-xl px-4 py-10'>
      <div className='mb-8'>
        <p className='mb-2 text-sm text-muted-foreground'>Paso 2 de 4</p>
        <Progress value={50} aria-label='Avance del formulario' />
      </div>

      <header className='mb-6'>
        <h1 className='text-2xl font-bold text-foreground'>Cuéntanos tus datos</h1>
        <p className='mt-2 text-base text-muted-foreground'>
          Usaremos esta información para preparar la primera revisión de tu caso.
        </p>
      </header>

      <form className='space-y-5'>
        <fieldset className='space-y-5 border-0 p-0'>
          <legend className='sr-only'>Datos personales</legend>

          <div className='space-y-2'>
            <Label htmlFor='nombre'>Nombre completo</Label>
            <Input id='nombre' name='nombre' placeholder='Escribe tu nombre' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='correo'>Correo</Label>
            <Input id='correo' name='correo' type='email' placeholder='tu@correo.cl' />
            <p className='text-xs text-muted-foreground'>
              Te escribiremos solo para avanzar con tu caso.
            </p>
          </div>
        </fieldset>

        <div className='flex items-center justify-between pt-2'>
          <Button type='button' variant='ghost'>Volver</Button>
          <Button type='submit'>Guardar y continuar</Button>
        </div>
      </form>
    </main>
  );
}
```

**Evita:** hero comercial, eyebrow decorativo, una card por campo, mostrar los 4 pasos
en una sola pantalla.

---

## 2. Cliente — Confirmación / éxito

**Mundo:** cliente. **Patrón:** celebra breve, di qué pasa ahora y dónde seguir.
**Componentes:** `Button` (e icono de lucide).

```tsx
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/base/Button";

export function EnvioConfirmado() {
  return (
    <main className='mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center'>
      <span className='mb-4 flex size-12 items-center justify-center rounded-full bg-success/10'>
        <CheckCircle2 className='size-6 text-success' aria-hidden />
      </span>
      <h1 className='text-2xl font-bold text-foreground'>
        ¡Enviamos tus documentos!
      </h1>
      <p className='mt-2 text-base text-muted-foreground'>
        El equipo legal los está revisando. Podrás seguir su estado en la pestaña
        «Enviados» y te avisaremos si falta algo.
      </p>
      <Button className='mt-6'>Volver al inicio</Button>
    </main>
  );
}
```

---

## 3. Cliente — Acceso (login)

**Mundo:** cliente. **Patrón:** una sola tarea, foco único, ayuda contextual breve.
**Componentes:** `Card`, `Input`, `Label`, `Button`, `Logo`.

```tsx
import { Button } from "@/components/base/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/base/Card";
import { Input } from "@/components/base/Input";
import { Label } from "@/components/base/Label";

export function Login() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle>Ingresa a Lexy</CardTitle>
          <CardDescription>Te acompañamos con tu caso desde aquí.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Correo</Label>
              <Input id='email' type='email' placeholder='tu@correo.cl' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='pass'>Contraseña</Label>
              <Input id='pass' type='password' placeholder='Ingresa tu contraseña' />
            </div>
            <Button type='submit' className='w-full'>Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
```

---

## 4. CRM — Desk con tabla y acciones

**Mundo:** CRM. **Patrón:** ancho completo, toolbar con búsqueda y acción primaria,
tabla densa y escaneable con estado por fila, paginación al pie cuando hay más
registros de los que caben. **Componentes:** `Searchbox` (o `Input`), `Button`,
`Table`, `StatusDot`, `Tag`, `Pagination`.

```tsx
import { Plus } from "lucide-react";
import { Button } from "@/components/base/Button";
import { Input } from "@/components/base/Input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/base/Pagination";
import { StatusDot } from "@/components/base/StatusDot";
import { Table } from "@/components/base/Table";

export function CasosDesk() {
  return (
    <main className='w-full p-4'>
      <header className='mb-4 flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold text-foreground'>Casos</h1>
          <p className='text-sm text-muted-foreground'>24 activos · 3 vencen hoy</p>
        </div>
        <div className='flex items-center gap-2'>
          <Input className='h-9 w-64' placeholder='Buscar por cliente o RUT' aria-label='Buscar casos' />
          <Button size='sm'>
            <Plus /> Nuevo caso
          </Button>
        </div>
      </header>

      <Table columns='2fr 1.5fr 1fr 1fr' stickyHeader>
        <Table.Header>
          <Table.Cell>Cliente</Table.Cell>
          <Table.Cell>Materia</Table.Cell>
          <Table.Cell>Estado</Table.Cell>
          <Table.Cell>Plazo</Table.Cell>
        </Table.Header>
        <Table.Content>
          <Table.Row onClick={() => {}}>
            <Table.Cell className='font-medium'>María Pérez</Table.Cell>
            <Table.Cell>Despido</Table.Cell>
            <Table.Cell><StatusDot tone='warning'>En revisión</StatusDot></Table.Cell>
            <Table.Cell className='text-warning'>Vence hoy</Table.Cell>
          </Table.Row>
          <Table.Row onClick={() => {}}>
            <Table.Cell className='font-medium'>Juan Soto</Table.Cell>
            <Table.Cell>Deuda</Table.Cell>
            <Table.Cell><StatusDot tone='success'>Al día</StatusDot></Table.Cell>
            <Table.Cell className='text-muted-foreground'>12 días</Table.Cell>
          </Table.Row>
        </Table.Content>
      </Table>

      <footer className='mt-4 flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>Mostrando 1–20 de 64 casos</p>
        <Pagination className='mx-0 w-auto justify-end'>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href='#' /></PaginationItem>
            <PaginationItem><PaginationLink href='#' isActive>1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href='#'>2</PaginationLink></PaginationItem>
            <PaginationItem><PaginationLink href='#'>3</PaginationLink></PaginationItem>
            <PaginationItem><PaginationNext href='#' /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </footer>
    </main>
  );
}
```

**Evita:** envolver cada fila en una card, espaciado de cliente, color como único
signo de estado (por eso `StatusDot` lleva texto), y listas de cientos de filas
sin `Pagination`.

---

## 5. CRM — Detalle de caso (master-detail)

**Mundo:** CRM. **Patrón:** contexto a la izquierda, trabajo al centro, acciones a la
mano. La información que se consulta junta vive junta. **Componentes:** `Tabs`,
`Button`, `Separator`, `Tag`, `Avatar`.

```tsx
import { Button } from "@/components/base/Button";
import { Separator } from "@/components/base/Separator";
import { Tag } from "@/components/base/Tag";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/base/Tabs";

export function CasoDetalle() {
  return (
    <main className='flex w-full gap-4 p-4'>
      <aside className='w-72 shrink-0 space-y-4'>
        <div>
          <h1 className='text-lg font-semibold text-foreground'>María Pérez</h1>
          <p className='text-sm text-muted-foreground'>Caso #1042 · Despido</p>
        </div>
        <Tag tone='warning'>En revisión</Tag>
        <Separator />
        <dl className='space-y-2 text-sm'>
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Abogado</dt>
            <dd className='text-foreground'>C. Rivera</dd>
          </div>
          <div className='flex justify-between'>
            <dt className='text-muted-foreground'>Plazo</dt>
            <dd className='text-warning'>Vence hoy</dd>
          </div>
        </dl>
      </aside>

      <section className='min-w-0 flex-1'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-base font-semibold text-foreground'>Gestiones</h2>
          <Button size='sm'>Nueva gestión</Button>
        </div>
        <Tabs defaultValue='actividad'>
          <TabsList>
            <TabsTrigger value='actividad'>Actividad</TabsTrigger>
            <TabsTrigger value='documentos'>Documentos</TabsTrigger>
            <TabsTrigger value='notas'>Notas</TabsTrigger>
          </TabsList>
          <TabsContent value='actividad'>{/* timeline */}</TabsContent>
          <TabsContent value='documentos'>{/* lista */}</TabsContent>
          <TabsContent value='notas'>{/* notas */}</TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
```

---

## 6. Estados de datos: loading, empty, error

**Mundo:** ambos (obligatorio en toda vista con datos). **Patrón:** nunca dejes una
vista en blanco mientras carga ni un vacío sin salida. **Componentes:** `Skeleton`
(layout conocido) o `Spinner` (espera puntual), `Empty`, `Button`.

```tsx
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/base/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/base/Empty";
import { Skeleton } from "@/components/base/Skeleton";

function ListaLoading() {
  // Skeleton con la forma del contenido real. Usa Spinner solo para esperas
  // puntuales sin layout (p. ej. dentro de un botón al enviar).
  return (
    <div className='space-y-3' aria-busy='true' aria-live='polite'>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className='h-12 w-full' />
      ))}
    </div>
  );
}

function ListaVacia() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <FolderOpen className='size-6' aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Aún no hay casos</EmptyTitle>
        <EmptyDescription>Cuando crees un caso, aparecerá aquí.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size='sm'>Crear primer caso</Button>
      </EmptyContent>
    </Empty>
  );
}

function ListaError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No pudimos cargar los casos</EmptyTitle>
        <EmptyDescription>Revisa tu conexión e inténtalo de nuevo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size='sm' variant='outline' onClick={onRetry}>
          Reintentar
        </Button>
      </EmptyContent>
    </Empty>
  );
}
```

**Regla:** cada vista que trae datos resuelve los cuatro estados —loading, vacío,
error y contenido—. El éxito puntual (guardado, envío) se comunica con `Toast`.

---

## 7. CRM — Layout de aplicación (sidebar + contenido)

**Mundo:** CRM. **Patrón:** estructura persistente de la app interna: navegación
lateral colapsable data-driven y área de trabajo. Las vistas de las recetas 4 y 5
viven dentro de `SidebarInset`. **Componentes:** `SidebarProvider`, `AppSidebar`,
`SidebarInset`, `Logo`.

```tsx
import { FolderKanban, Inbox, Settings } from "lucide-react";
import { AppSidebar } from "@/components/base/AppSidebar";
import { Logo } from "@/components/base/Logo";
import { SidebarInset, SidebarProvider } from "@/components/base/Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar
        logo={<Logo layout='horizontal' />}
        groups={[
          {
            label: "Trabajo",
            items: [
              { title: "Casos", icon: FolderKanban, url: "/casos", isActive: true },
              { title: "Bandeja", icon: Inbox, url: "/bandeja" },
            ],
          },
          {
            label: "Sistema",
            items: [{ title: "Configuración", icon: Settings, url: "/config" }],
          },
        ]}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
```

**Reglas:** la navegación va data-driven con `AppSidebar` (lee `AppSidebar.md`
antes de usarla; no compongas a mano las primitivas de `Sidebar`). **Evita:**
usar este layout en pantallas de cliente sin panel lateral (ahí va
`AppHeaderBar` + secciones) y duplicar el logo dentro del contenido.
