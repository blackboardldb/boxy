import { AlertCircle } from "lucide-react";

export function OrgSuspendedAlert() {
  return (
    <div className="bg-orange-500/10 text-orange-600 border-b border-orange-500/20 p-3 text-sm text-center font-medium flex items-center justify-center gap-2">
      <AlertCircle className="h-4 w-4" />
      Este centro se encuentra temporalmente suspendido. Regularice el pago para evitar interrupciones en el servicio a los alumnos.
    </div>
  );
}
