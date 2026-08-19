"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function BrandingUploader({ orgId, initialIconUrl }: { orgId: string, initialIconUrl: string | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState<string | null>(initialIconUrl);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      // Scale down image to 512x512
      const resizedBlob = await new Promise<Blob>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_SIZE = 512;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("No canvas context"));
            
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Canvas to Blob failed"));
            }, "image/png");
          };
          img.onerror = () => reject(new Error("Imagen inválida"));
          if (event.target?.result) img.src = event.target.result as string;
        };
        reader.onerror = () => reject(new Error("Error leyendo el archivo"));
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append("file", resizedBlob, file.name || "logo.png");
      const res = await fetch(`/manager/api/centros/${orgId}/branding`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Error al subir el logo");
      }

      setCurrentIcon(json.customIconUrl);
      setFile(null);
      // Reset el input de file manualmente, o vía reference, pero ya pusimos null a la variable
      // Forzamos refresh para los server components si es necesario
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <div className="bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-300">
        🎨 Branding (Logo PNG)
      </div>
      <div className="px-4 py-6 space-y-4">
        {currentIcon ? (
          <div className="flex items-center gap-4">
            <img src={currentIcon} alt="Current Logo" className="w-16 h-16 object-contain bg-black rounded-lg border border-zinc-800" />
            <span className="text-zinc-500 text-sm">Logo actual</span>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Sin logo configurado.</p>
        )}

        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-fit mt-2 bg-white text-black hover:bg-zinc-200"
          >
            {uploading ? "Subiendo..." : "Subir Logo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
