"use client";

import { useState } from "react";
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
import { Calculator, Plus, Minus, Scale } from "lucide-react";
import { WeightConverter } from "./weight-converted";

export function RMManager() {
  // Para la calculadora
  const [calculatorValue, setCalculatorValue] = useState<number>(100);
  const [calculatorUnit, setCalculatorUnit] = useState<"kg" | "lbs">("kg");

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="converter" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Conversor
            </TabsTrigger>
          </TabsList>

          {/* Tab de Calculadora */}
          <TabsContent value="calculator" className="space-y-6">
            {/* Input simple para calculadora */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculadora de Porcentajes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="calculatorValue"
                    className="text-sm font-medium"
                  >
                    RM:
                  </Label>
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
                    className="text-center text-2xl font-bold flex-1 p-3"
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
                    <SelectTrigger className="w-20 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCalculatorValue((prev) => prev + 5)}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de porcentajes simple */}
            {calculatorValue > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Tabla de Porcentajes</CardTitle>
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

        {/* Espacio adicional para navegación móvil */}
        <div className="h-20" />
      </div>
    </>
  );
}
