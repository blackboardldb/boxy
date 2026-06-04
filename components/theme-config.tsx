"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ThemeConfigProps {
  organizationId: string;
  initialColor: string;
  initialVariant: number;
}

const VARIANTS = [
  { id: 1, label: "Sharp", desc: "Minimal, corporativo", radius: "2px" },
  { id: 2, label: "Rounded", desc: "Moderno, balanceado", radius: "10px" },
  { id: 3, label: "Soft", desc: "Amigable, accesible", radius: "16px" },
  { id: 4, label: "Pill", desc: "Dinámico, energético", radius: "24px" },
];

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6", "#1d4ed8", "#0f172a",
];

export function ThemeConfig({
  organizationId,
  initialColor,
  initialVariant,
}: ThemeConfigProps) {
  const [color, setColor] = useState(initialColor);
  const [variant, setVariant] = useState(initialVariant);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      const res = await fetch("/api/centro/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePrimaryColor: color, themeVariant: variant }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh(); // Refresca para aplicar el nuevo tema en el layout
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Preview en vivo */}
      <div
        className="rounded-xl border p-6 space-y-4 transition-all duration-300"
        style={{
          borderRadius: VARIANTS.find((v) => v.id === variant)?.radius,
          borderColor: color + "40",
          background: color + "08",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest opacity-50">
          Preview en vivo
        </p>
        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 text-white text-sm font-semibold shadow-sm transition-all duration-300"
            style={{
              backgroundColor: color,
              borderRadius: VARIANTS.find((v) => v.id === variant)?.radius,
            }}
          >
            Botón principal
          </button>
          <button
            className="px-4 py-2 text-sm font-medium border transition-all duration-300"
            style={{
              color: color,
              borderColor: color + "60",
              borderRadius: VARIANTS.find((v) => v.id === variant)?.radius,
            }}
          >
            Secundario
          </button>
        </div>
        <div
          className="inline-block px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: color + "20",
            color: color,
            borderRadius: VARIANTS.find((v) => v.id === variant)?.radius,
          }}
        >
          Badge de estado
        </div>
      </div>

      {/* Color primario */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Color primario</h2>

        {/* Colores preset */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-all duration-150 hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "white" : "transparent",
                boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
              }}
              title={c}
            />
          ))}
        </div>

        {/* Color picker libre */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
              id="color-picker"
            />
            <label
              htmlFor="color-picker"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors text-sm"
            >
              <span
                className="w-5 h-5 rounded-full border border-border/50"
                style={{ backgroundColor: color }}
              />
              Color personalizado
            </label>
          </div>
          <code className="text-sm font-mono text-muted-foreground">{color}</code>
        </div>
      </div>

      {/* Variantes visuales */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Variante visual</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className="group relative border p-4 transition-all duration-200 text-left hover:border-current"
              style={{
                borderRadius: v.radius,
                borderColor: variant === v.id ? color : undefined,
                background: variant === v.id ? color + "10" : undefined,
              }}
            >
              {/* Mini preview de bordes */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 flex-1 bg-muted"
                    style={{ borderRadius: v.radius }}
                  />
                ))}
              </div>
              <p className="font-semibold text-xs">{v.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{v.desc}</p>
              {variant === v.id && (
                <div
                  className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-white text-[10px]"
                  style={{ backgroundColor: color, borderRadius: "50%" }}
                >
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {isPending ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm">Tema actualizado correctamente</span>
        )}
      </div>
    </div>
  );
}
