"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useBlackSheepStore } from "@/lib/blacksheep-store";
import type { DayOfWeek, Discipline, CancellationRule } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Plus,
  X,
  Clock,
  Calendar,
  Save,
  Edit,
  Trash2,
  AlertTriangle,
  Settings,
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

export default function ScheduleManagerImproved() {
  const {
    disciplines,
    deleteDiscipline,
    fetchDisciplines,
    createDiscipline,
    updateDisciplineById,
  } = useBlackSheepStore();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para gestión de disciplinas
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<string | null>(
    null
  );
  const [disciplineForm, setDisciplineForm] =
    useState<Discipline>(emptyDiscipline);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [expandedDisciplines, setExpandedDisciplines] = useState<Set<string>>(
    new Set()
  );
  const [selectedDayForSchedule, setSelectedDayForSchedule] = useState<
    DayOfWeek | ""
  >("");
  const [selectedCancellationTime, setSelectedCancellationTime] =
    useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [disciplineToDelete, setDisciplineToDelete] = useState<string | null>(
    null
  );
  const [disciplineToDeleteName, setDisciplineToDeleteName] = useState<string>("");

  // Cargar disciplinas al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchDisciplines();
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchDisciplines]);

  // --- Gestión de disciplinas ---
  const handleNewDiscipline = () => {
    setDisciplineForm(emptyDiscipline);
    setEditingDiscipline(null);
    setSelectedDays([]);
    setSelectedDayForSchedule("");
    setSelectedCancellationTime("");
    setShowDisciplineModal(true);
  };

  const handleEditDiscipline = (discipline: Discipline) => {
    setDisciplineForm(discipline);
    setEditingDiscipline(discipline.id);
    setSelectedDays(discipline.schedule.map((s) => s.day));
    setSelectedDayForSchedule("");
    setSelectedCancellationTime("");
    setShowDisciplineModal(true);
  };

  const handleDeleteDiscipline = (id: string, name: string) => {
    setDisciplineToDelete(id);
    setDisciplineToDeleteName(name);
    setShowDeleteModal(true);
  };

  const confirmDeleteDiscipline = async () => {
    if (disciplineToDelete) {
      const result = await deleteDiscipline(disciplineToDelete);
      if (result) {
        toast({
          title: "Disciplina eliminada",
          description: "La disciplina se eliminó permanentemente.",
        });
      }
      // El store ya limpia el estado local o alertará si falla
      setShowDeleteModal(false);
      setDisciplineToDelete(null);
    }
  };

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

  const handleDisciplineChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDisciplineForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleActive = (checked: boolean) => {
    setDisciplineForm((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleAddTimeToDiscipline = (day: DayOfWeek, time: string) => {
    if (!time.match(/^\d{2}:\d{2}$/)) return;
    setDisciplineForm((prev) => {
      const schedule = [...prev.schedule];
      const idx = schedule.findIndex((d) => d.day === day);
      if (idx >= 0) {
        schedule[idx] = {
          ...schedule[idx],
          times: [...schedule[idx].times, time].sort(),
        };
      } else {
        schedule.push({ day, times: [time] });
      }
      return { ...prev, schedule };
    });
  };

  const handleRemoveTimeFromDiscipline = (day: DayOfWeek, time: string) => {
    setDisciplineForm((prev) => {
      const schedule = prev.schedule
        .map((d) =>
          d.day === day ? { ...d, times: d.times.filter((t) => t !== time) } : d
        )
        .filter((d) => d.times.length > 0);
      return { ...prev, schedule };
    });
  };

  const handleAddCancellationRule = (rule: Omit<CancellationRule, "id">) => {
    setDisciplineForm((prev) => ({
      ...prev,
      cancellationRules: [
        ...prev.cancellationRules,
        { ...rule, id: `rule_${Date.now()}` },
      ],
    }));
  };

  const handleRemoveCancellationRule = (id: string) => {
    setDisciplineForm((prev) => ({
      ...prev,
      cancellationRules: prev.cancellationRules.filter((r) => r.id !== id),
    }));
  };

  const handleSaveDiscipline = async () => {
    if (!disciplineForm.name) return;
    setIsSaving(true);

    const filteredSchedule = disciplineForm.schedule.filter((s) =>
      selectedDays.includes(s.day)
    );

    const disciplineData = {
      ...disciplineForm,
      schedule: filteredSchedule,
    };

    let result;
    if (editingDiscipline) {
      result = await updateDisciplineById(editingDiscipline, disciplineData);
    } else {
      result = await createDiscipline(disciplineData);
    }

    setIsSaving(false);
    if (result) {
      toast({
        title: editingDiscipline ? "Disciplina actualizada" : "Disciplina creada",
        description: "Se guardaron los horarios y el estado de la disciplina.",
      });
      setShowDisciplineModal(false);
    }
  };

  // Calcular horarios disponibles para reglas de cancelación
  const availableTimes = disciplineForm.schedule
    .flatMap((daySchedule) => daySchedule.times)
    .filter((time, index, array) => array.indexOf(time) === index) // Remover duplicados
    .sort();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header con gestión de disciplinas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-premium">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración de Horarios</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona tus disciplinas, horarios semanales y reglas de cupos.</p>
        </div>
        <Button onClick={handleNewDiscipline} size="lg" className="rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5 mr-1" /> Nueva Disciplina
        </Button>
      </div>

      {/* Lista de disciplinas */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-xl border-none shadow-md overflow-hidden">
              <Skeleton className="h-2 flex-1 mb-6 rounded-xl" />
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-2/3 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))
        ) : !disciplines || disciplines.length === 0 ? (
          <Card className="col-span-full border-2 border-dashed border-slate-200 bg-transparent flex flex-col items-center justify-center p-16 text-center rounded-xl">
            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center mb-6">
              <Settings className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-500">No hay disciplinas configuradas</h3>
            <p className="text-sm text-slate-400 mt-2 mb-8 max-w-xs mx-auto">Crea una disciplina para empezar a programar tus horarios semanales.</p>
            <Button onClick={handleNewDiscipline} variant="outline" className="rounded-xl h-12 px-8 border-2 font-bold transition-all hover:bg-slate-50">
              Crear Disciplina
            </Button>
          </Card>
        ) : (
          disciplines
            ?.filter((d) => d && d.id)
            .map((d) => (
              <Card key={d.id} className={cn(
                "overflow-hidden border-none shadow-premium rounded-xl transition-all hover:translate-y-[-4px]",
                !d.isActive && "grayscale opacity-80"
              )}>

                <CardHeader className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Switch 
                        checked={d.isActive} 
                        onCheckedChange={async (checked) => {
                          const result = await updateDisciplineById(d.id, { isActive: checked });
                          if (result) {
                            toast({
                              title: checked ? "Disciplina activada" : "Disciplina desactivada",
                              description: checked ? "Los horarios vuelven a estar vigentes." : "Se han eliminado las clases futuras sin alumnos.",
                            });
                          }
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-bold">{d.name}</CardTitle>
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color || "#ccc" }} />
                        {!d.isActive && <span className="text-[10px] font-black uppercase text-slate-400">Inactiva</span>}
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
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleEditDiscipline(d)}>
                          <Edit className="w-4.5 h-4.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-red-50 hover:text-red-500 transition-colors" onClick={() => handleDeleteDiscipline(d.id, d.name)}>
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 empty:hidden">
                  {expandedDisciplines.has(d.id) && (
                    <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-900 animate-in slide-in-from-top-2 duration-300">
                      {d.schedule.length === 0 ? (
                        <div className="p-4 rounded-xl border-2 border-dotted text-center text-xs text-muted-foreground italic">Sin horarios configurados</div>
                      ) : (
                        <div className="space-y-1.5">
                          {d.schedule.map((s) => (
                            <div key={s.day} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                              <span className="text-xs font-bold w-12">{dayLabels[s.day]}</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {s.times.map((t) => (
                                  <Badge key={t} variant="outline" className="text-[10px] bg-white dark:bg-slate-900 border-slate-200 rounded-xl">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {d.cancellationRules.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reglas de Cancelación</p>
                          <div className="flex flex-wrap gap-1.5">
                            {d.cancellationRules.map((r) => (
                              <Badge key={r.id} variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-100 font-bold rounded-xl">
                                {r.time} → {r.hoursBefore}h
                              </Badge>
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

      {/* Modal para crear/editar disciplina */}
      <Dialog open={showDisciplineModal} onOpenChange={setShowDisciplineModal}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col rounded-xl p-0 border-none shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center justify-between w-full pr-6">
              <DialogTitle className="text-lg font-bold">
                {editingDiscipline ? "Editar Disciplina" : "Nueva Disciplina"}
              </DialogTitle>
              <Switch 
                checked={disciplineForm.isActive} 
                onCheckedChange={handleToggleActive}
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white dark:bg-slate-950">
            {/* Información básica */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300">Nombre</Label>
                  <Input
                    name="name"
                    value={disciplineForm.name}
                    onChange={handleDisciplineChange}
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
                      value={disciplineForm.color}
                      onChange={handleDisciplineChange}
                      className="w-14 h-full p-1 rounded-xl cursor-pointer border-slate-200 overflow-hidden"
                    />
                    <Input 
                      value={disciplineForm.color}
                      onChange={handleDisciplineChange}
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
                  value={disciplineForm.description}
                  onChange={handleDisciplineChange}
                  placeholder="Descripción de la disciplina"
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full mt-6" />
            </div>

            {/* Selección de días */}
            <div className="space-y-4">
              <Label className="text-lg font-bold">Días de la semana</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dayLabels).map(([day, label]) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day as DayOfWeek)}
                    className={cn(
                      "px-4 py-2 text-sm font-bold rounded-xl transition-all border",
                      selectedDays.includes(day as DayOfWeek)
                        ? "bg-slate-900 text-white border-slate-900 shadow-md"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horarios por día seleccionado */}
            {selectedDays.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-bold">Horarios por día</Label>

                {/* Inputs para agregar horarios */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border-2 border-dotted border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">Programar nueva hora clase</span>
                  </div>

                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Día</Label>
                      <Select
                        value={selectedDayForSchedule}
                        onValueChange={(value) =>
                          setSelectedDayForSchedule(value as DayOfWeek)
                        }
                      >
                        <SelectTrigger className="w-40 rounded-xl h-10 border-slate-200">
                          <SelectValue placeholder="Elegir día" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {selectedDays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {dayLabels[day]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Hora (HH:MM)</Label>
                      <div className="flex gap-2">
                        <Input
                          className="w-16 rounded-xl h-10"
                          placeholder="HH"
                          maxLength={2}
                          type="number"
                          id="new-hour"
                        />
                        <span className="flex items-center text-lg font-bold">:</span>
                        <Input
                          className="w-16 rounded-xl h-10"
                          placeholder="MM"
                          maxLength={2}
                          type="number"
                          id="new-minute"
                        />
                      </div>
                    </div>

                    <Button
                      disabled={!selectedDayForSchedule}
                      onClick={() => {
                        const hourInput = document.getElementById("new-hour") as HTMLInputElement;
                        const minuteInput = document.getElementById("new-minute") as HTMLInputElement;
                        const hour = hourInput.value.padStart(2, "0");
                        const minute = minuteInput.value.padStart(2, "0");

                        if (selectedDayForSchedule && hour && minute) {
                          handleAddTimeToDiscipline(selectedDayForSchedule, `${hour}:${minute}`);
                          hourInput.value = "";
                          minuteInput.value = "";
                        }
                      }}
                      className="rounded-xl h-10 px-6 font-bold"
                    >
                      Añadir Hora
                    </Button>
                  </div>
                </div>

                {/* Horarios existentes */}
                <div className="grid grid-cols-1 gap-3">
                  {selectedDays.map((day) => {
                    const daySchedule = disciplineForm.schedule.find(
                      (d) => d.day === day
                    ) || { times: [] };
                    if (daySchedule.times.length === 0) return null;

                    return (
                      <div key={day} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="h-8 rounded-xl px-3 bg-slate-50 dark:bg-slate-900 font-bold border-slate-200">
                            {dayLabels[day]}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {daySchedule.times.map((time) => (
                            <Badge
                              key={time}
                              className="bg-primary/5 text-primary border-primary/10 pl-3 pr-1 py-1 h-8 rounded-xl font-bold transition-all hover:bg-primary/10"
                            >
                              <Clock className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                              {time}
                              <button
                                className="ml-1.5 w-6 h-6 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-400"
                                onClick={() => handleRemoveTimeFromDiscipline(day, time)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reglas de cancelación */}
            <div className="space-y-4">
              <Label className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Reglas de Cancelación
              </Label>

              <div className="space-y-4">
                {availableTimes.length > 0 && (
                  <div className="flex flex-wrap gap-4 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-yellow-700">Para la clase de:</Label>
                      <Select value={selectedCancellationTime} onValueChange={setSelectedCancellationTime}>
                        <SelectTrigger className="w-40 rounded-xl h-10 bg-white border-yellow-200">
                          <SelectValue placeholder="Elegir hora" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {availableTimes.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-yellow-700">Horas de anticipación</Label>
                      <div className="flex gap-2">
                        <Input className="w-16 rounded-xl h-10 bg-white border-yellow-200" placeholder="HH" type="number" id="rule-cancel-hour" />
                        <span className="flex items-center font-bold">:</span>
                        <Input className="w-16 rounded-xl h-10 bg-white border-yellow-200" placeholder="MM" type="number" id="rule-cancel-minute" />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      disabled={!selectedCancellationTime}
                      variant="secondary"
                      className="rounded-xl h-10 px-6 font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-none hover:bg-yellow-200"
                      onClick={() => {
                        const cancelHourInput = document.getElementById("rule-cancel-hour") as HTMLInputElement;
                        const cancelMinuteInput = document.getElementById("rule-cancel-minute") as HTMLInputElement;
                        const hour = cancelHourInput.value || "0";
                        const min = cancelMinuteInput.value || "0";
                        const totalHours = parseInt(hour) + parseInt(min) / 60;

                        if (selectedCancellationTime && totalHours >= 0) {
                          handleAddCancellationRule({ time: selectedCancellationTime, hoursBefore: totalHours, priority: 1 });
                          setSelectedCancellationTime("");
                          cancelHourInput.value = "";
                          cancelMinuteInput.value = "";
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Agregar Regla
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {disciplineForm.cancellationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-sm bg-yellow-400" />
                        <span className="text-sm font-bold">Clase: <span className="text-primary">{rule.time}</span></span>
                        <span className="text-sm text-slate-500">Mínimo <span className="font-bold text-slate-700 dark:text-slate-300">{rule.hoursBefore}h</span> antes</span>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={() => handleRemoveCancellationRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex flex-row items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDisciplineModal(false)} className="rounded-xl h-12 px-8 font-bold">Cancelar</Button>
            <Button onClick={handleSaveDiscipline} disabled={isSaving} className="rounded-xl h-12 px-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {editingDiscipline ? "Actualizar Horario" : "Guardar Disciplina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar disciplina */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md rounded-xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-red-600">
              <Trash2 className="w-8 h-8" />
              Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              ¿Estás seguro de que quieres eliminar la disciplina <span className="font-black text-slate-800 dark:text-slate-200">"{disciplineToDeleteName}"</span>?
            </p>
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-400 font-bold flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                Esta acción SOLO funcionará si la disciplina NO tiene historial de clases (pasadas o inscritas).
              </p>
            </div>
            <p className="text-sm text-slate-500 italic">
              * Si tiene historial, te recomendamos usar el interruptor de <span className="font-bold underline">Desactivar</span> en la tarjeta para limpiar el calendario de forma segura.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="destructive" onClick={confirmDeleteDiscipline} className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-none">
              Eliminar Permanentemente
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1 h-12 rounded-xl border-2 font-bold">
              Volver Atrás
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
