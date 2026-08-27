"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface CsvRow {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

type RowResultStatus =
  | "created"
  | "attached_existing_user"
  | "already_in_org"
  | "error";

interface RowResult {
  email: string;
  result: {
    status: RowResultStatus;
    reason?: string;
    message?: string;
  };
}

interface ImportSummary {
  total: number;
  created: number;
  attached: number;
  alreadyInOrg: number;
  errors: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const BATCH_SIZE = 20;

/** Divide un array en chunks de tamaño máximo `size`. */
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Normaliza una fila raw del CSV en un objeto `CsvRow`.
 * Soporta encabezados en español (nombre, apellido) e inglés (firstName, lastName),
 * y tanto coma como punto y coma como separador (PapaParse lo resuelve).
 * El email se normaliza a minúsculas.
 */
function normalizeRow(raw: Record<string, string>): CsvRow | null {
  const email = (raw["email"] ?? raw["correo"] ?? "").trim().toLowerCase();
  const firstName = (raw["firstName"] ?? raw["nombre"] ?? raw["first_name"] ?? "").trim();
  const lastName = (raw["lastName"] ?? raw["apellido"] ?? raw["last_name"] ?? "").trim();
  const phone = (raw["phone"] ?? raw["telefono"] ?? raw["teléfono"] ?? "").trim() || null;

  if (!email || !firstName || !lastName) return null;
  return { email, firstName, lastName, phone };
}

const STATUS_CONFIG: Record<
  RowResultStatus,
  { label: string; color: string; icon: string }
> = {
  created: {
    label: "Alumno creado",
    color: "text-green-400",
    icon: "✅",
  },
  attached_existing_user: {
    label: "Vinculado desde otro centro",
    color: "text-blue-400",
    icon: "🔗",
  },
  already_in_org: {
    label: "Ya registrado en este centro",
    color: "text-yellow-400",
    icon: "⚠️",
  },
  error: {
    label: "Error",
    color: "text-red-400",
    icon: "❌",
  },
};

// ── Componente ────────────────────────────────────────────────────────────────

export function CsvImporter({ orgId }: { orgId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed and validated rows (before import)
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Import state
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<RowResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  // ── Paso 1: Parsear y validar el CSV en el cliente ──────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsedRows([]);
    setParseErrors([]);
    setResults([]);
    setSummary(null);
    setFatalError(null);
    setProgress(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      // skipBOM: true — PapaParse maneja BOM de UTF-8 con Excel automáticamente
      complete(result) {
        const normalized: CsvRow[] = [];
        const errors: string[] = [];

        // Deduplicación por email en el propio archivo
        const seen = new Set<string>();

        result.data.forEach((raw, idx) => {
          const row = normalizeRow(raw);
          if (!row) {
            errors.push(`Fila ${idx + 2}: faltan campos obligatorios (email, nombre, apellido)`);
            return;
          }
          if (seen.has(row.email)) {
            errors.push(`Fila ${idx + 2}: email duplicado en el archivo (${row.email})`);
            return;
          }
          seen.add(row.email);
          normalized.push(row);
        });

        setParsedRows(normalized);
        setParseErrors(errors);
      },
      error(err) {
        setFatalError(`Error al leer el archivo: ${err.message}`);
      },
    });
  }

  // ── Paso 2: Enviar lotes al backend secuencialmente ─────────────────────────

  async function handleImport() {
    if (parsedRows.length === 0) return;

    setImporting(true);
    setResults([]);
    setSummary(null);
    setFatalError(null);

    const batches = chunk(parsedRows, BATCH_SIZE);
    const allResults: RowResult[] = [];
    setProgress({ done: 0, total: parsedRows.length });

    for (const batch of batches) {
      try {
        const res = await fetch(
          `/manager/api/centros/${orgId}/importar-alumnos/batch`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batch),
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          // Fallo de red/servidor: abortar el proceso completo
          setFatalError(
            `Error del servidor en lote (${allResults.length + 1}–${allResults.length + batch.length}): ${body.error ?? res.statusText}`
          );
          setImporting(false);
          return;
        }

        const data = await res.json();
        allResults.push(...(data.results as RowResult[]));
        setProgress({ done: allResults.length, total: parsedRows.length });
      } catch (networkErr) {
        // Error de red puro (sin respuesta del servidor)
        setFatalError(
          `Error de red al procesar el lote (filas ${allResults.length + 1}–${allResults.length + batch.length}). ` +
            `Las filas anteriores ya fueron procesadas.`
        );
        setImporting(false);
        return;
      }
    }

    // Todos los lotes completados — calcular resumen
    const finalSummary: ImportSummary = {
      total: allResults.length,
      created: allResults.filter((r) => r.result.status === "created").length,
      attached: allResults.filter((r) => r.result.status === "attached_existing_user").length,
      alreadyInOrg: allResults.filter((r) => r.result.status === "already_in_org").length,
      errors: allResults.filter((r) => r.result.status === "error").length,
    };

    setResults(allResults);
    setSummary(finalSummary);
    setImporting(false);
    setProgress(null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const isReady = parsedRows.length > 0 && !importing && results.length === 0;
  const isDone = results.length > 0;

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
        📥 Importar alumnos por CSV
      </div>

      <div className="p-4 space-y-4">

        {/* Instrucciones */}
        {!isDone && (
          <div className="text-xs text-zinc-500 space-y-1">
            <p>El CSV debe contener las columnas: <code className="text-zinc-300">email</code>, <code className="text-zinc-300">firstName</code> (o <code className="text-zinc-300">nombre</code>), <code className="text-zinc-300">lastName</code> (o <code className="text-zinc-300">apellido</code>). Teléfono opcional.</p>
            <p>Se importan máximo 300 alumnos por operación. Los emails duplicados en el archivo se omiten automáticamente.</p>
          </div>
        )}

        {/* Selector de archivo */}
        {!isDone && (
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={importing}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="px-3 py-1.5 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {parsedRows.length > 0 ? "Cambiar archivo" : "Seleccionar CSV"}
            </button>
            {parsedRows.length > 0 && (
              <span className="text-sm text-zinc-400">
                {parsedRows.length} fila{parsedRows.length !== 1 ? "s" : ""} válida{parsedRows.length !== 1 ? "s" : ""} listas para importar
              </span>
            )}
          </div>
        )}

        {/* Errores de parseo */}
        {parseErrors.length > 0 && (
          <div className="bg-yellow-950/40 border border-yellow-800/50 rounded-lg p-3 space-y-1">
            <p className="text-yellow-400 text-xs font-semibold">
              {parseErrors.length} fila{parseErrors.length !== 1 ? "s" : ""} omitida{parseErrors.length !== 1 ? "s" : ""} por error de formato:
            </p>
            <ul className="text-xs text-yellow-500 space-y-0.5 list-disc list-inside">
              {parseErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error fatal */}
        {fatalError && (
          <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3">
            <p className="text-red-400 text-xs font-semibold">Error al importar</p>
            <p className="text-red-500 text-xs mt-1">{fatalError}</p>
          </div>
        )}

        {/* Botón de importar */}
        {isReady && (
          <button
            id="csv-import-start-btn"
            onClick={handleImport}
            className="w-full py-2 text-sm font-semibold bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
          >
            Importar {parsedRows.length} alumno{parsedRows.length !== 1 ? "s" : ""}
          </button>
        )}

        {/* Progreso */}
        {importing && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Procesando…</span>
              <span>{progress.done} / {progress.total}</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.done / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Resumen final */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-green-950/40 border border-green-800/30 rounded-lg p-2 text-center">
              <p className="text-green-400 text-lg font-bold">{summary.created}</p>
              <p className="text-green-600 text-xs">Creados</p>
            </div>
            <div className="bg-blue-950/40 border border-blue-800/30 rounded-lg p-2 text-center">
              <p className="text-blue-400 text-lg font-bold">{summary.attached}</p>
              <p className="text-blue-600 text-xs">Vinculados</p>
            </div>
            <div className="bg-yellow-950/40 border border-yellow-800/30 rounded-lg p-2 text-center">
              <p className="text-yellow-400 text-lg font-bold">{summary.alreadyInOrg}</p>
              <p className="text-yellow-600 text-xs">Ya registrados</p>
            </div>
            <div className="bg-red-950/40 border border-red-800/30 rounded-lg p-2 text-center">
              <p className="text-red-400 text-lg font-bold">{summary.errors}</p>
              <p className="text-red-600 text-xs">Con error</p>
            </div>
          </div>
        )}

        {/* Tabla de resultados por fila */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 font-medium">Resultado por fila</p>
              <button
                onClick={() => {
                  setParsedRows([]);
                  setResults([]);
                  setSummary(null);
                  setParseErrors([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Nueva importación
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800 border border-zinc-800 rounded-lg">
              {results.map((r, i) => {
                const config = STATUS_CONFIG[r.result.status];
                return (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                    <span className="shrink-0 mt-0.5">{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-zinc-300 truncate block">{r.email}</span>
                      <span className={config.color}>
                        {config.label}
                        {r.result.status === "attached_existing_user" && (
                          <span className="text-zinc-500"> — existía en otro centro</span>
                        )}
                        {r.result.status === "error" && r.result.reason && (
                          <span className="text-zinc-500"> — {r.result.reason}</span>
                        )}
                        {r.result.status === "already_in_org" && r.result.message && (
                          <span className="text-zinc-500"> — {r.result.message}</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
