import { AlertCircle } from "lucide-react";

export function OrgSuspendedAlert() {
  return (
    <div className="bg-red-600 text-white p-3 text-sm text-center font-medium flex items-center justify-center gap-2 shadow-sm">
      <AlertCircle className="h-4 w-4" />
      Este centro se encuentra suspendido. Regularice el pago para evitar interrupciones en el servicio.
    </div>
  );
}
