# APRENDIZAJE BS: Deuda Técnica, Errores y Arquitectura Evolutiva 🐑

Este documento es una bitácora técnica explícita. Su propósito no es aplaudir los éxitos, sino analizar visceralmente los **errores estructurales** que se cometieron al diseñar este SaaS, por qué se tomaron esas malas decisiones (generalmente para ir más rápido), y mostrar con código **cómo se arreglaron** de forma profesional para que jamás repitas estos errores en otros proyectos.

---

## 🛑 Caso de Análisis 1: El Abuso de las Columnas `JSONB` (HAL-01)

### ¿Qué teníamos? (El Error)
Para evitar hacer tablas relacionadas, se decidió meter TODO el perfil de gimnasio de un alumno en una sola columna tipo `JSON` dentro de la tabla `users`. 

**Snippet antiguo (schema.prisma):**
```prisma
model User {
  id         String @id
  email      String
  membership Json?  // ❌ TODO vivía aquí adentro
}
```

Para buscar quién tenía el plan vencido, el código se veía forzado a hacer esto en la ruta:
```typescript
// ❌ CÓDIGO VIEJO Y TÓXICO
const users = await prisma.$queryRaw`
  SELECT * FROM users 
  WHERE membership->>'status' = 'expired'
`;
```

**Consecuencias desastrosas:**
- **Pérdida de Indexación:** Postgres tiene que escanear y deserializar cada texto. Se volvió lentísimo.
- **Tipos rotos:** TypeScript no sabe qué hay adentro de un JSON en la Base de Datos. Cada vez que pedías un usuario, tocaba adivinar si `membership.clases` era un string o un número.
- **Sobreescritura accidental:** Si el admin descontaba una clase, pero el sistema automático sumaba una asistencia, dependía de quién guardaba el JSONG más pesado al último. El otro perdía sus datos.

### ¿Cómo se mejoró? (La Solución)
Se hizo el "Drop" del JSON y se implementó una relación 1 a 1 pura, creando la tabla `UserMembership`.

**Snippet actual:**
```typescript
// ✅ CÓDIGO NUEVO Y RELACIONAL
const expiredMembers = await prisma.userMembership.findMany({
  where: { status: 'expired' },
  include: { user: true }
});
```
Se actualizó la persistencia mediante **Dual Writes**. En la primera fase mantuvimos el JSON vivo pero la máquina alimentaba en secreto a la nueva tabla `UserMembership` `upsert(...)`. A la semana, cambiamos los lectores, y borramos el JSON para siempre. 

### 💡 Aprendizaje para tus Otros Proyectos:
**¡NUNCA!** utilices una columna `JSON` para almacenar información core de negocio sobre la cual necesites hacer `WHERE`, `COUNT` o interacciones matemáticas (descontar vidas, sumar clases). Usa `JSON` sólo para cosas "ciegas" (Ej: Preferencias de interfaz `{ theme: 'dark', noificaciones: false}`). Si tiene lógica, merece su propia tabla.

---

## 🛑 Caso de Análisis 2: Arrays vs Tablas Pivote Many-to-Many (HAL-03)

### ¿Qué teníamos? (El Error)
Queríamos llevar la lista de alumnos que agendaban sus clases. En lugar de hacer una tabla intermedia estándar (Manejo M:N), se metió un Array de Strings en la propia clase para ahorrarnos queries:

**Snippet antiguo:**
```prisma
model ClassSession {
  id                        String @id
  registeredParticipantsIds String[] // ❌ Una mala idea
}
```

Cuando un alumno cancelaba la clase, el código hacía esto:
```typescript
// ❌ MUTACIÓN PELIGROSA LOCAL EN MEMORIA
const clase = await prisma.classSession.findUnique({ id });
const newLista = clase.registeredParticipantsIds.filter(x => x !== userId);

await prisma.classSession.update({
  where: { id },
  data: { registeredParticipantsIds: newLista }
});
```

**Consecuencias desastrosas:**
1. **Condiciones de Carrera (Race conditions):** Si Ana y Pedro se anotaban a las 19:00:00 exactas, la variable temporal borraba al del otro.
2. **Los Participantes Fantasma:** Si Pedro eliminaba su cuenta (`DELETE FROM User`), su ID de texto **seguía existiendo adentro del array**. Cuando React pintaba la clase, intentaba buscar la foto del ID de Pedro y la pantalla azulaba (Crasheaba) diciendo `Undefined is not an object`. 

### ¿Cómo se mejoró? (La Solución)
Fundamos la tabla `ClassRegistration` con status (`registered | waitlist | cancelled`). PERO el Frontend dependía del array y no podíamos rehacer 20 vistas de React. Para arreglarlo sin downtime implementamos un **Map Entity Repo**.

**La magia oculta (Mappers en `class-repository.ts`):**
```typescript
// ✅ El Frontend todavía pide su "Array", 
// pero en vez de leer de la DB corrompida, el Backend se lo CONSTRUYE al vuelo:
return {
  ...prismaSession,
  registeredParticipantsIds: prismaSession.registrations
    ?.filter(r => r.status === 'registered')
    .map(r => r.userId) ?? []
};
```
De golpe erradicamos el Race-Condition, re-conseguimos Integridad Referencial (Foreign Keys), y las clases nunca más marcaron cupos fantasmas. Y todo sin que el Frontend se diera cuenta.

### 💡 Aprendizaje para tus Otros Proyectos:
Si un evento u objeto en tu app le pertenece a MUCHOS, la única estructura legal es una **Tabla Pivote N:M** (`TablaA_TablaB`). Ni un array, ni cadenas separadas por coma. Y si necesitas arreglar arquitectura sin romper apis, empapa tu código de **Repository Mappers** que aíslen el modelo transaccional de lo que React consume en pantalla.

---

## 🛑 Caso de Análisis 3: Castings Ciegos y el Cuelgue del Next 15 (HAL-06b / HAL-15)

### ¿Qué teníamos? (El Error)
Asumíamos de forma ingenua que lo que enviaba el botón Front-End, era exactamente lo que Prisma necesitaba en formato. 

**Snippet antiguo:**
```typescript
// ❌ CÓDIGO SUICIDA (Falta de firewall)
export async function POST(req: NextRequest) {
  const data = await req.json() as any; 
  // Entra data.name y se lo traga Prisma, si viene "fecha" en vez de "startDate", 
  // Prisma tira un error 500 y muere la web.
  await prisma.expense.create({ data });
}
```

**Consecuencias desastrosas:**
Un re-diseño del Admin hizo cambiar en el frontend la llave `amount` a `monto`. La base de datos estalló, el usuario no vio errores en pantalla, simplemente quedó una pantalla girando, y el admin perdió la noción de los registros. Además, la actualización a Next 15 rompió rutas enteras porque la resolución de variables URL `/usuarios/[id]` pasó de síncrona a asíncrona.

### ¿Cómo se mejoró? (La Solución)
Impedir el paso de red a nivel de red, e imponer el tipo inferido: ¡Zod Parsing Expreso!

**Snippet actual:**
```typescript
// ✅ ESCUDO IMPENETRABLE
const createExpenseSchema = z.object({
  motivo: z.string().min(1),
  fecha:  z.string().min(1), // Se aceptan ambos, frontend libre
  monto:  z.number().positive(),
});

export async function POST(req: NextRequest) {
  const parsed = createExpenseSchema.safeParse(await req.json());
  if (!parsed.success) return res.json({ error: parsed.error }, { status: 400 });
  
  // Aquí `parsed.data` es 100% confiable y autocompleta. Cero `as any`.
}
```
Y para el Async de Next 15, envolvimos todos los constructores así: `const { id } = await params;` purgando 84 fallas TS simultáneas.

### 💡 Aprendizaje para tus Otros Proyectos:
**NUNCA USES `as any` al cruzar barreras de red (APIs).** 
La regla de oro moderna de Typescript + Next es: *El Front-end siempre es un agente enemigo y mentiroso.* Toda información recibida debe parsearse y limpiarse en la puerta 0 de tu endpoint mediante un Schema estricto (Zod/Yup). Si el Payload no coincide, expulsa al request inmediatamente con un HTTP 400 (Bad Request). Validar tarde cuesta carísimo. 

---

## Resumen Ejecutivo para tu Equipo

> *"Diseñar una base de datos rápido para un SaaS te permite lanzar rápido, pero es como pedir un préstamo hipotecario a 1 día para apostarlo en un casino. Si no se invierte tiempo normalizando las relaciones a las 5 semanas de lanzamiento... Terminas refactorizando con el barco hundiéndose meses después."* 

Las tres cosas que jamás deben aplicarse en tus arranques:
1. No metas estados lógicos manipulables dentro de un bloque `JSONB`.
2. No enumeres usuarios dentro de un Array dentro de la base de datos (Adiós Joins, hola inconsistencias).
3. Nunca parches tipado con un mágico `as any` en Next.js. Las librerías y contratos se oxidan, e implotarán la web a la menor actualización.
