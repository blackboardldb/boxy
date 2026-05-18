// src/components/ClassesHomeCard.tsx
"use client";

import { useMemo } from "react";
import { Clock3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { FormattedClassItem } from "@/lib/types";

interface ClassesHomeCardProps {
  classes: FormattedClassItem[];
  onClassClick?: (classItem: FormattedClassItem) => void;
}

export function ClassesHomeCard({
  classes,
  onClassClick,
}: ClassesHomeCardProps) {
  const today = useMemo(() => new Date(), []);

  const todayClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const classDate = parseISO(classItem.dateTime);
      return (
        classDate.getDate() === today.getDate() &&
        classDate.getMonth() === today.getMonth() &&
        classDate.getFullYear() === today.getFullYear()
      );
    });
  }, [classes, today]);

  const upcomingClasses = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return classes
      .filter((classItem) => {
        const classDate = parseISO(classItem.dateTime);
        return classDate >= tomorrow;
      })
      .slice(0, 3);
  }, [classes, today]);

  return (
    <div className="space-y-4 mt-4">
      {/* Clases de Hoy */}
    
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
       
         Hoy
</div>
        <div>
          {todayClasses.length === 0 ? (
            <p className="text-zinc-400">
              No hay clases programadas para hoy
            </p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-zinc-900 border-zinc-950 text-white"
                 
                >
              
                    <div className="inline-flex gap-2 items-center">
                      <p className="font-medium">{classItem.name}</p>
                      <span className="text-sm text-zinc-400">
                        {format(parseISO(classItem.dateTime), "HH:mm", {
                          locale: es,
                        })}
                      </span>
                    
                      <span className="text-sm text-zinc-400">
                       {classItem.duration}
                      </span>

                    </div>
                  
                  <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 mr-1" />
                    <span className="text-sm text-white">
                      {classItem.alumnRegistred || "0/0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


      {/* Próximas Clases */}
               <div className="flex items-center gap-2 text-base font-semibold text-white mt-6">
           
            Próximas Clases
</div>
          {upcomingClasses.length === 0 ? (
            <p className="text-zinc-400">
              No hay clases programadas próximamente
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-zinc-900 border-zinc-950 text-white"
                  onClick={() => onClassClick?.(classItem)}
                >
                  <div className="flex items-center gap-3">
                   
                    <div>
                      <p className="font-medium">{classItem.name}</p>
                      <p className="text-sm text-zinc-400">
                        {format(
                          parseISO(classItem.dateTime),
                          "EEEE, d 'de' MMMM 'a las' HH:mm",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 mr-1" />
                    <span className="text-sm ">
                      {classItem.alumnRegistred || "0/0"}
                    </span>
                   
                  </div>
                </div>
              ))}
            </div>
          )}

    </div>
  );
}
