"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import type { Discipline, DayOfWeek, CancellationRule } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const dayLabels: Record<DayOfWeek, string> = {
  lun: "Lunes",
  mar: "Martes",
  mie: "Miércoles",
  jue: "Jueves",
  vie: "Viernes",
  sab: "Sábado",
  dom: "Domingo",
};

const emptyDiscipline: Discipline = {
  id: "",
  name: "",
  description: "",
  color: "#3b82f6",
  isActive: true,
  schedule: [],
  cancellationRules: [],
};

export default function DisciplinesManager() {
  const {
    disciplines,
    deleteDiscipline,
    createDiscipline,
    updateDisciplineById,
  } = useBlackSheepStore();

  const { toast } = useToast();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Discipline>(emptyDiscipline);
  const [showModal, setShowModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(
    new Set()
  );

  const toggleDisciplineExpansion = (id: string) => {
    setExpandedDisciplines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // --- Handlers generales ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  // --- Gestión de días seleccionados ---
  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  // --- Horarios ---
  const handleAddTime = (day: DayOfWeek, time: string) => {
    if (!time.match(/^\d{2}:\d{2}$/)) return;
    setForm((prev) => {
      const schedule = [...prev.schedule];
      const idx = schedule.findIndex((d) => d.day === day);
      if (idx >= 0) {
        schedule[idx] = {
          ...schedule[idx],
          times: [...schedule[idx].times, time],
        };
      } else {
        schedule.push({ day, times: [time] });
      }
      return { ...prev, schedule };
    });
  };

  const handleRemoveTime = (day: DayOfWeek, time: string) => {
    setForm((prev) => {
      const schedule = prev.schedule
        .map((d) =>
          d.day === day ? { ...d, times: d.times.filter((t) => t !== time) } : d
        )
        .filter((d) => d.times.length > 0);
      return { ...prev, schedule };
    });
  };

  // --- Reglas de cancelación ---
  const handleAddRule = (rule: Omit<CancellationRule, "id">) => {
    setForm((prev) => ({
      ...prev,
      cancellationRules: [
        ...prev.cancellationRules,
        { ...rule, id: `rule_${Date.now()}` },
      ],
    }));
  };

  const handleRemoveRule = (id: string) => {
    setForm((prev) => ({
      ...prev,
      cancellationRules: prev.cancellationRules.filter((r) => r.id !== id),
    }));
  };

  // --- Guardar/Editar/Eliminar ---
  const handleSave = async () => {
    if (!form.name) return;
    setIsLoading(true);

    const filteredSchedule = form.schedule.filter((s) =>
      selectedDays.includes(s.day)
    );

    const disciplineData = {
      ...form,
      schedule: filteredSchedule,
    };

    let result;
    if (editing) {
      result = await updateDisciplineById(editing, disciplineData);
    } else {
      result = await createDiscipline(disciplineData);
    }

    setIsLoading(false);
    if (result) {
      toast({
        title: editing ? "Disciplina actualizada" : "Disciplina creada",
        description: "Los cambios se guardaron. Si desactivaste la disciplina, las clases futuras sin alumnos se eliminaron automáticamente.",
      });
      handleCloseModal();
    } else {
      toast({
        title: "Error",
        description: "Hubo un error al procesar la solicitud.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (d: Discipline) => {
    setForm(d);
    setEditing(d.id);
    setSelectedDays(d.schedule.map((s) => s.day));
    setShowModal(true);
  };

  const handleNew = () => {
    setForm(emptyDiscipline);
    setEditing(null);
    setSelectedDays([]);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmation = window.confirm(
      `¿Estás seguro de que deseas eliminar "${name}"?\n\nSolo podrá eliminarse si no tiene historial de clases (pasadas o canceladas). Si tiene historial, la mejor opción es marcarla como "Inactiva" para limpiar el calendario.`
    );
    
    if (confirmation) {
      const result = await deleteDiscipline(id);
      if (result) {
        toast({
          title: "Disciplina eliminada",
          description: "Se ha eliminado del sistema permanentemente.",
        });
      }
    }
  };

  const handleCloseModal = () => {
    setForm(emptyDiscipline);
    setEditing(null);
    setSelectedDays([]);
    setShowModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-premium">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Disciplinas</h2>
          <p className="text-sm text-muted-foreground mt-1">Configura horarios, reglas de cancelación y disponibilidad.</p>
        </div>
        <Button onClick={handleNew} size="lg" className="rounded-xl shadow-lg transition-all hover:scale-105">
          <Plus className="w-5 h-5 mr-1" /> Nueva Disciplina
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col rounded-xl p-0 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center justify-between w-full pr-6">
              <DialogTitle className="text-lg font-bold">
                {editing ? "Editar Disciplina" : "Crear Nueva Disciplina"}
              </DialogTitle>
              <Switch 
                checked={form.isActive} 
                onCheckedChange={handleToggleActive}
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-slate-950">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Nombre</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: CrossFit, Yoga"
                    className="rounded-xl h-11 border-slate-200"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Color</Label>
                  <div className="flex gap-2 h-11">
                    <Input
                      name="color"
                      type="color"
                      value={form.color}
                      onChange={handleChange}
                      className="w-14 h-full p-1 rounded-xl cursor-pointer border-slate-200 overflow-hidden"
                    />
                    <Input 
                      value={form.color}
                      onChange={handleChange}
                      name="color"
                      className="flex-1 h-full rounded-xl border-slate-200 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700 dark:text-slate-300">Descripción</Label>
                <Input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descripción breve..."
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mt-6" />
            </div>

            {/* Days Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-bold">Días y Horarios</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day as DayOfWeek)}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-xl transition-all border",
                      selectedDays.includes(day as DayOfWeek)
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {selectedDays.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-4">
                  {selectedDays.map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800/40">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="font-bold">{dayLabels[day]}</span>
                      </div>

                      <div className="flex-1 flex flex-wrap gap-2">
                        {(form.schedule.find((d) => d.day === day) || { times: [] }).times.map((time) => (
                          <Badge key={time} variant="secondary" className="pl-3 pr-1 py-1.5 h-8 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-none">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            {time}
                            <button
                              onClick={() => handleRemoveTime(day, time)}
                              className="w-6 h-6 flex items-center justify-center rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </Badge>
                        ))}
                        <div className="flex gap-1 h-8">
                          <Input
                            className="w-20 text-xs rounded-xl h-8"
                            placeholder="hh:mm"
                            maxLength={5}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddTime(day, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                          <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl" onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (input.value) { handleAddTime(day, input.value); input.value = ""; }
                          }}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cancellation Rules Section */}
            <div className="space-y-4">
              <Label className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Reglas de Cancelación Especiales
              </Label>
              <div className="space-y-3">
                {form.cancellationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-xl text-xs font-bold">
                        {rule.time}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-yellow-900 dark:text-yellow-200">{rule.hoursBefore} horas de anticipación</p>
                        <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70">{rule.description || "Sin descripción"}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-xl h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleRemoveRule(rule.id)}>
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dotted border-slate-300 dark:border-slate-800">
                  <Input className="sm:w-24 rounded-xl h-10" placeholder="Hora" id="rule-time" />
                  <Input className="sm:w-24 rounded-xl h-10" placeholder="Horas" type="number" id="rule-hours" />
                  <Input className="flex-1 rounded-xl h-10" placeholder="Motivo/Descripción" id="rule-desc" />
                  <Button size="sm" className="rounded-xl h-10 px-6" onClick={() => {
                    const time = (document.getElementById("rule-time") as HTMLInputElement)?.value;
                    const hours = Number((document.getElementById("rule-hours") as HTMLInputElement)?.value);
                    const desc = (document.getElementById("rule-desc") as HTMLInputElement)?.value;
                    if (time && hours >= 0) {
                      handleAddRule({ time, hoursBefore: hours, priority: 1, description: desc });
                      (document.getElementById("rule-time") as HTMLInputElement).value = "";
                      (document.getElementById("rule-hours") as HTMLInputElement).value = "";
                      (document.getElementById("rule-desc") as HTMLInputElement).value = "";
                    }
                  }}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar Regla
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-row items-center justify-end gap-3">
            <Button variant="ghost" onClick={handleCloseModal} className="rounded-xl h-12 px-8 font-bold">Cancelar</Button>
            <Button onClick={handleSave} disabled={isLoading} className="rounded-xl h-12 px-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xl hover:scale-105 transition-transform disabled:opacity-70">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {editing ? "Actualizar Disciplina" : "Guardar Disciplina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4">
        {!disciplines || disciplines.length === 0 ? (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center p-16 text-center rounded-xl">
            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-500">No hay disciplinas registradas</h3>
            <p className="text-sm text-slate-400 mt-2 mb-8 max-w-xs mx-auto">Comienza creando tu primera disciplina para configurar los horarios de clases.</p>
            <Button onClick={handleNew} variant="outline" className="rounded-xl h-12 px-8 border-2 font-bold transition-all hover:bg-slate-50">
              <Plus className="w-5 h-5 mr-1" /> Crear Disciplina
            </Button>
          </Card>
        ) : (
          disciplines.map((d) => (
            <Card key={d.id} className={cn(
               "overflow-hidden border-none shadow-premium rounded-xl transition-all hover:translate-y-[-4px]",
               !d.isActive && "grayscale opacity-80"
            )}>

              <CardHeader className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Switch 
                      id={`active-${d.id}`}
                      checked={!!d.isActive} 
                      onCheckedChange={async (checked) => {
                        const result = await updateDisciplineById(d.id, { isActive: checked });
                        if (result) {
                          toast({
                            title: checked ? "Disciplina activada" : "Disciplina desactivada",
                            description: checked ? "Los alumnos podrán inscribirse nuevamente." : "Se han eliminado las clases futuras sin alumnos.",
                          });
                        }
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-bold">{d.name}</CardTitle>
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color || "#ccc" }} />
                      {!d.isActive && <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Inactiva</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDisciplineExpansion(d.id)}
                      className="text-xs font-bold h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800"
                    >
                      {d.schedule.length} {d.schedule.length === 1 ? "Día" : "Días"} — {expandedDisciplines.has(d.id) ? "Ocultar horarios" : "Ver horarios"}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleEdit(d)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background text-zinc-900 hover:bg-zinc-100 h-10 w-10 rounded-xl"
                      >
                        <Edit />
                      </Button>
                      <Button 
                        onClick={() => handleDelete(d.id, d.name)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 w-10 rounded-xl"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6 empty:hidden">
                {expandedDisciplines.has(d.id) && (
                  <div className="space-y-6 pt-2 border-t border-slate-50 dark:border-slate-900 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Días y Horarios</span>
                    <Badge variant="outline" className="rounded-xl text-[9px] uppercase font-bold px-2 py-0 border-slate-200">Cronograma</Badge>
                  </div>

                  {d.schedule.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dotted border-slate-200 dark:border-slate-800 text-center text-xs text-muted-foreground">
                      Sin horarios definidos
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5 px-1">
                      {d.schedule.map((s) => (
                        <div key={s.day} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 transition-colors hover:bg-slate-100/50">
                          <span className="text-xs font-bold w-16">{dayLabels[s.day]}</span>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[140px]">
                            {s.times.map((t) => (
                              <span key={t} className="text-[9px] font-black px-2 py-0.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {d.cancellationRules.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 pl-1">Política de Cancelación</span>
                    <div className="flex flex-wrap gap-2 pr-2">
                       {d.cancellationRules.map((r) => (
                         <div key={r.id} className="text-[9px] font-black px-2.5 py-1 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/10 flex items-center gap-1.5 shadow-sm">
                           <Clock className="w-3 h-3 text-yellow-500/50" />
                           {r.time} → {r.hoursBefore}h
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
