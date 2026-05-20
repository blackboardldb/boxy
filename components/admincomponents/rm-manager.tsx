"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Minus, Scale, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { WeightConverter } from "./weight-converted";
import { LIFT_EXERCISES } from "@/lib/types";

export function RMManager() {
  // Para la calculadora
  const [calculatorValue, setCalculatorValue] = useState<number>(100);
  const [calculatorUnit, setCalculatorUnit] = useState<"lbs" | "kg">("lbs");

  const [selectedExercise, setSelectedExercise] = useState<string>("manual");
  const [history, setHistory] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [inputWeight, setInputWeight] = useState<number>(0);
  const [inputUnit, setInputUnit] = useState<"kg" | "lbs">("kg");

  useEffect(() => {
    if (selectedExercise === "manual") {
      setHistory([]);
      setIsExpanded(false);
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/rm/${selectedExercise}`);
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setHistory(json.data);
          const latest = json.data[json.data.length - 1];
          setInputWeight(latest.weight);
          setInputUnit(latest.unit);
          setCalculatorValue(latest.weight);
          setCalculatorUnit(latest.unit);
        } else {
          setHistory([]);
          setInputWeight(0);
          setIsExpanded(true); // Open directly if no history
        }
      } catch (err) {
        console.error("Error fetching RM history", err);
      }
    };
    fetchHistory();
  }, [selectedExercise]);

  const saveRM = async () => {
    if (selectedExercise === "manual" || !inputWeight) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/rm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseKey: selectedExercise,
          weight: inputWeight,
          unit: inputUnit,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsExpanded(false);
        setCalculatorValue(inputWeight);
        setCalculatorUnit(inputUnit);

        const refreshRes = await fetch(`/api/rm/${selectedExercise}`);
        const refreshJson = await refreshRes.json();
        if (refreshJson.success) {
          setHistory(refreshJson.data);
        }
      }
    } catch (err) {
      console.error("Error saving RM", err);
    } finally {
      setIsSaving(false);
    }
  };

  const percentages = [
    100, 98, 95, 93, 90, 87, 85, 83, 80, 78, 75, 73, 70, 68, 65, 63, 60, 58, 55,
    53, 50, 48, 45, 43, 40, 38, 35, 33, 30,
  ];

  const calculatePercentage = (baseValue: number, percentage: number) => {
    const result = (baseValue * percentage) / 100;
    return Math.round(result * 10) / 10;
  };

  return (
    <>
      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Hero section */}

        {/* Tabs principales */}
        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white/10">
            <TabsTrigger
              value="calculator"
              className="flex items-center gap-2 py-3 text-zinc-300 data-[state=active]:text-zinc-950 data-[state=active]:bg-white"
            >
              <Calculator className="h-4 w-4" />
              Calcular RM
            </TabsTrigger>
            <TabsTrigger
              value="converter"
              className="flex items-center gap-2 py-3 text-zinc-300 data-[state=active]:text-zinc-950 data-[state=active]:bg-white"
            >
              <Scale className="h-4 w-4" />
              Convertir kg - lb
            </TabsTrigger>
          </TabsList>

          {/* Tab de Calculadora */}
          <TabsContent value="calculator" className="space-y-6">
            {/* Input simple para calculadora */}
            <Card className="bg-white/5  border-0">
              <CardHeader>
                <h1 className="flex items-center gap-2 text-white text-xl">

                  Ingresa tu RM
                </h1>
                <p className="text-sm text-zinc-400">
                  Calcula de forma libre o elige un ejercicio y agrega tu 1RM.
                </p>

                <div className="mt-4">
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="w-full bg-white/10 text-white border-0">
                      <SelectValue placeholder="Selecciona un ejercicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Libre (Sin guardar)</SelectItem>
                      {LIFT_EXERCISES.map((ex) => (
                        <SelectItem key={ex.key} value={ex.key}>
                          {ex.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedExercise !== "manual" && (
                  <div className="mt-4 bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                      <div className="text-white font-medium">
                        {LIFT_EXERCISES.find(e => e.key === selectedExercise)?.label}
                      </div>
                      <div className="flex items-center gap-4">
                        {history.length > 0 && (
                          <span className="text-sm text-zinc-400">
                            Último: {history[history.length - 1].weight} {history[history.length - 1].unit}
                          </span>
                        )}
                        <span className="font-bold text-sm underline text-white">Editar</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {history.length === 0 ? (
                          <div className="text-center text-zinc-400 py-4 text-sm mb-4">
                            <p>Agrega tu primer registro</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-sm mb-6">
                            <div className="flex flex-col">
                              <span className="text-zinc-500 mb-1">Primer registro</span>
                              <span className="text-white font-medium">{history[0].weight} {history[0].unit}</span>
                              <span className="text-zinc-500 text-xs">
                                {new Date(history[0].recordedAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {history.length >= 2 && (
                              <div className="flex flex-col">
                                <span className="text-zinc-500 mb-1">{history.length === 2 ? 'Último' : 'Penúltimo'}</span>
                                <span className="text-white font-medium">{history[1].weight} {history[1].unit}</span>
                                <span className="text-zinc-500 text-xs">
                                  {new Date(history[1].recordedAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                            {history.length === 3 && (
                              <div className="flex flex-col">
                                <span className="text-zinc-500 mb-1">Último</span>
                                <span className="text-white font-medium">{history[2].weight} {history[2].unit}</span>
                                <span className="text-zinc-500 text-xs">
                                  {new Date(history[2].recordedAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mb-6 flex flex-col gap-2">
                          <Label className="text-zinc-400">Peso</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={inputWeight || ""}
                              onChange={(e) => setInputWeight(Number(e.target.value))}
                              className="bg-white/10 border-white/20 text-white placeholder:text-zinc-500"
                              min="0"
                              step="0.5"
                              placeholder="0"
                              autoFocus={history.length === 0}
                            />
                            <Select
                              value={inputUnit}
                              onValueChange={(value: "kg" | "lbs") => setInputUnit(value)}
                            >
                              <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lbs">lbs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                            onClick={saveRM}
                            disabled={isSaving || inputWeight <= 0}
                          >
                            {isSaving ? "Guardando..." : "Guardar"}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                            onClick={() => setIsExpanded(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCalculatorValue((prev) => Math.max(0, prev - 5))
                    }
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="calculatorValue"
                    type="number"
                    value={calculatorValue}
                    onChange={(e) => setCalculatorValue(Number(e.target.value))}
                    className="text-center text-3xl font-bold flex-1 p-3 appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    step="0.5"
                    placeholder="Ingresa tu RM"
                  />
                  <Select
                    value={calculatorUnit}
                    onValueChange={(value: "kg" | "lbs") =>
                      setCalculatorUnit(value)
                    }
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCalculatorValue((prev) => prev + 5)}
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <SelectTrigger className="w-24 bg-slate-100 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="kg" >Kilos</SelectItem>
                      <SelectItem value="lbs" >Libras</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
              </CardContent>
            </Card>

            {/* Tabla de porcentajes simple */}
            {calculatorValue > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <p className="text-lg font-bold">Tabla de Porcentajes</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {percentages.map((percentage) => (
                      <div
                        key={percentage}
                        className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold w-12 text-center">
                            {percentage}%
                          </div>
                          {percentage === 100 && (
                            <span className="text-xs text-muted-foreground font-medium">
                              RM
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-bold">
                          {calculatePercentage(calculatorValue, percentage)}{" "}
                          {calculatorUnit}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab de Conversor */}
          <TabsContent value="converter">
            <WeightConverter />
          </TabsContent>
        </Tabs>


      </div>
    </>
  );
}
