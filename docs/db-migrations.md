# Guía: Cómo aplicar índices con `CONCURRENTLY` en Boxy

Debido a que Prisma `migrate dev` no puede crear la *shadow database* correctamente sobre el pooler de Supabase en este proyecto (error `P3006` u otros problemas de permisos), el flujo estándar de creación de índices que requieren `CONCURRENTLY` (para no bloquear la base de datos de producción) necesita un procedimiento manual específico.

Si intentas aplicar `CONCURRENTLY` dentro de una migración normal de Prisma, fallará porque Prisma envuelve las migraciones en una transacción (y Postgres prohíbe `CONCURRENTLY` dentro de un bloque de transacción).

Para evitar *drift* en Prisma y asegurar la integridad de la base de datos, sigue estrictamente este patrón:

### 1. Actualizar el Schema local
Agrega el índice deseado (ej. `@@index`) en el modelo correspondiente dentro de `prisma/schema.prisma`.

### 2. Crear la migración localmente (Sin aplicarla)
Dado que `migrate dev --create-only` puede fallar por la shadow DB rota, crea la migración manualmente:
1. Crea una carpeta en `prisma/migrations` con el formato `YYYYMMDDHHMMSS_nombre_descriptivo`.
2. Dentro, crea un archivo `migration.sql`.
3. Escribe el `CREATE INDEX` en SQL estándar **SIN** `CONCURRENTLY`.
   *Ejemplo:* `CREATE INDEX "tu_indice_idx" ON "public"."tu_tabla"("campo");`

*Esto asegura que si el proyecto alguna vez se reconstruye desde cero o en un entorno de CI limpio, Prisma pueda correr la migración estándar.*

### 3. Verificar duplicados (Si es un índice UNIQUE)
Antes de ejecutar nada en producción, verifica que los datos actuales cumplan la condición del índice, especialmente si es un índice único o parcial. Si `CREATE UNIQUE INDEX CONCURRENTLY` falla por duplicados, dejará un índice `INVALID` que bloquea futuras correcciones.
*Ejemplo:* `SELECT campo1, campo2, COUNT(*) FROM tu_tabla GROUP BY campo1, campo2 HAVING COUNT(*) > 1;`

### 4. Aplicar el índice en Supabase (CONCURRENTLY)
Ve al SQL Editor de Supabase en el entorno de producción (Dashboard web o mediante conexión directa) y ejecuta la creación del índice **CON** `CONCURRENTLY`:
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS "tu_indice_idx" ON "public"."tu_tabla"("campo");
```

### 5. Validar que el índice es válido
Confirma que Postgres lo construyó correctamente verificando la columna `indisvalid`:
```sql
SELECT indexrelid::regclass::text AS index_name, indisvalid
FROM pg_index
WHERE indexrelid::regclass::text LIKE '%tu_indice_idx%';
```
Debe devolver `indisvalid = true`. Si devuelve `false`, debes hacer un `DROP INDEX CONCURRENTLY "tu_indice_idx";`, arreglar los datos (duplicados, etc) y volver al paso 4.

### 6. Resolver la migración en Prisma
Una vez que el índice es válido en la DB de producción, dile a Prisma que la migración local ya fue aplicada para que no intente correrla de nuevo en el próximo deploy:
```bash
npx prisma migrate resolve --applied YYYYMMDDHHMMSS_nombre_descriptivo
```

### 7. Verificación final (Opcional pero recomendada)
Para asegurar que todo está alineado y que el schema coincide 100% con la base de datos de producción:
```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url "$DATABASE_URL" --script
```
(El diff no debería mostrar que falta crear tu nuevo índice).
