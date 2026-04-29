"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useClassParticipants, useSaveClassNotes } from "@/lib/react-query/hooks/useClasses";
import { usePaginatedUsers } from "@/lib/react-query/hooks/useUsers";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { ClassListItem } from "@/lib/types";
import { parseISO, format } from "date-fns";
import { Users, Plus, Search, Save, Loader2 } from "lucide-react";
import {
  formatTimeLocal,
  formatWeekday,
  formatDayMonth,
} from "@/lib/utils";

interface AdminClassDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassListItem | null;
  onCancelClass: (classId: string) => void;
}

export default function AdminClassDetailDrawer({
  isOpen,
  onClose,
  classItem,
  onCancelClass,
}: AdminClassDetailDrawerProps) {
  const { toast } = useToast();
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [activeTab, setActiveTab] = useState("inscritos");
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const queryClient = useQueryClient();

  const [currentClassItem, setCurrentClassItem] = useState(classItem);

  const { data: participants = [], isLoading: isLoadingParticipants } = 
    useClassParticipants(isOpen ? classItem?.id : undefined);

  const { data: usersResult, isFetching: isSearchingUsers } = usePaginatedUsers({ 
    search: searchTerm, 
    limit: 20,
    enabled: activeTab === "agregar" && isOpen
  });

  const availableUsers = (usersResult?.users || []).filter((u: any) => {
    const enrolledIds = new Set(participants.map((p: any) => p.userId));
    return !enrolledIds.has(u.id);
  });

  // Inicializar estado al abrir/cerrar el drawer
  useEffect(() => {
    setNotes(classItem?.notes || "");
    setNotesSaved(false);
    setIsAddingStudent(false);
    setCurrentClassItem(classItem);
    setSearchTerm("");
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [classItem, isOpen]);

  const saveNotes = useSaveClassNotes();

  if (!currentClassItem) return null;

  const classDateTime = parseISO(currentClassItem.dateTime);
  const formattedDate =
    formatWeekday(currentClassItem.dateTime) + " " + formatDayMonth(currentClassItem.dateTime);
  const formattedTime = formatTimeLocal(currentClassItem.dateTime);

  const enrolledStudents = participants;

  const handleSaveNotes = async () => {
    try {
      await saveNotes.mutateAsync({
        classId: currentClassItem.id,
        notes,
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (error) {
      console.error("Error al guardar notas:", error);
    }
  };

  const handleAddStudent = async (userId: string) => {
    if (isAddingStudent) return;

    setIsAddingStudent(true);
    try {
      const classId = currentClassItem.id;

      const response = await fetch(`/api/classes/${classId}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        // Actualizar IDs locales optimistamente
        setCurrentClassItem((prev) =>
          prev
            ? {
                ...prev,
                enrolledCount: (prev.enrolledCount || 0) + 1,
              }
            : null
        );

        // Invalidate participants so React Query refetches them
        await queryClient.invalidateQueries({ queryKey: ["classes", "participants", classId] });
        setSearchTerm("");

        const addedUser = availableUsers.find((u) => u.id === userId);
        toast({
          title: "Alumno agregado",
          description: `${addedUser?.firstName} ${addedUser?.lastName} ha sido agregado a la clase`,
        });
        await queryClient.invalidateQueries({ queryKey: ["classes"] });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error al agregar alumno",
          description: errorData.error || errorData.message || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (isAddingStudent) return;

    setIsAddingStudent(true);
    try {
      const response = await fetch(`/api/classes/${currentClassItem.id}/admin/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setCurrentClassItem((prev) =>
          prev
            ? {
                ...prev,
                enrolledCount: Math.max(0, (prev.enrolledCount || 0) - 1),
              }
            : null
        );

        await queryClient.invalidateQueries({ queryKey: ["classes", "participants", currentClassItem.id] });

        const removedStudent = enrolledStudents.find((s: any) => s.userId === userId);
        toast({
          title: "Alumno removido",
          description: `${removedStudent?.firstName} ${removedStudent?.lastName} ha sido removido de la clase`,
        });
        await queryClient.invalidateQueries({ queryKey: ["classes"] });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error al remover alumno",
          description: errorData.error || errorData.message || "Error desconocido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsAddingStudent(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh]">
        <div className="mx-auto w-full max-w-2xl h-full flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle className="text-3xl">
              {currentClassItem.name} {formattedTime}
            </DrawerTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{currentClassItem.instructor}</span>
              <span>•</span>
              <Users className="w-4 h-4" />
              <span>
                {currentClassItem.enrolledCount ?? enrolledStudents.length}/
                {currentClassItem.capacity || "∞"} inscritos
              </span>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6 min-h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl bg-zinc-100 p-1">
                  <TabsTrigger value="inscritos" className="rounded-xl">
                    Inscritos ({currentClassItem.enrolledCount ?? enrolledStudents.length})
                  </TabsTrigger>
                  <TabsTrigger value="agregar" className="rounded-xl">
                    Agregar Alumnos
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="rounded-xl">
                    Notas
                  </TabsTrigger>
                </TabsList>

                {/* Tab: Inscritos */}
                <TabsContent value="inscritos" className="space-y-4">
                  {isLoadingParticipants ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Cargando participantes...
                      </p>
                    </div>
                  ) : enrolledStudents.length > 0 ? (
                    <div className="space-y-2">
                      {enrolledStudents.map((student: any) => (
                        <div
                          key={student.userId}
                          className="flex items-center justify-between p-3 border rounded-xl"
                        >
                          <div className="flex-1">
                           <div className=" flex item-center gap-2 ">
                             <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                              <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
                              {student.membershipType || "Sin estado"}
                            </span>
                           </div>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                          
                            <Button
                            variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.userId)}
                              disabled={isAddingStudent}
                              className="h-8 w-8 p-0 text-red-50 font-bold hover:bg-red-700 rounded-xl"
                            >
                              {isAddingStudent ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "X"
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No hay alumnos inscritos
                    </p>
                  )}
                </TabsContent>

                {/* Tab: Agregar Alumnos */}
                <TabsContent value="agregar" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar alumnos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {isSearchingUsers ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                      </div>
                    ) : (
                      <>
                        {availableUsers.map((user) => {
                          const membershipStatus = user.membership?.status || "Sin estado";
                          const isPending = membershipStatus === "pending";
                          const isExpired = membershipStatus === "expired";

                          return (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  {isPending && (
                                    <Badge variant="secondary" className="text-xs rounded-xl">
                                      Pendiente
                                    </Badge>
                                  )}
                                  {isExpired && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-orange-600 rounded-xl"
                                    >
                                      Expirado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                {isPending && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    ⚠️ Usuario pendiente de aprobación
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddStudent(user.id)}
                                className="h-8 w-8 p-0 rounded-xl"
                                disabled={isPending || isAddingStudent}
                              >
                                {isAddingStudent ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          );
                        })}

                        {availableUsers.length === 0 && searchTerm && (
                          <p className="text-muted-foreground text-center py-4">
                            No se encontraron alumnos
                          </p>
                        )}

                        {availableUsers.length === 0 && !searchTerm && !isSearchingUsers && (
                          <p className="text-muted-foreground text-center py-4">
                            Todos los alumnos están inscritos
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* Tab: Notas */}
                <TabsContent value="notes" className="space-y-4">
                  <Textarea
                    placeholder="Agregar notas para esta clase..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] rounded-xl"
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {saveNotes.isPending && (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Guardando...</span>
                        </>
                      )}
                      {notesSaved && (
                        <span className="text-sm text-green-600">✓ Guardado</span>
                      )}
                    </div>

                    <Button
                      onClick={handleSaveNotes}
                      disabled={saveNotes.isPending}
                      className="flex items-center gap-2 rounded-xl"
                    >
                      <Save className="h-4 w-4" />
                      Guardar Notas
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Acciones */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClose} className="w-full rounded-xl">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
