"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;

// Tabla de equivalencias de 10 lb a 100 lb en pasos de 5 lb
const conversionTable = [
  { lb: 1, kg: 0.45 },
  { lb: 10, kg: 4.54 },
  { lb: 15, kg: 6.8 },
  { lb: 20, kg: 9.07 },
  { lb: 25, kg: 11.34 },
  { lb: 30, kg: 13.61 },
  { lb: 35, kg: 15.88 },
  { lb: 40, kg: 18.14 },
  { lb: 45, kg: 20.41 },
  { lb: 50, kg: 22.68 },
  { lb: 55, kg: 24.95 },
  { lb: 60, kg: 27.22 },
  { lb: 65, kg: 29.48 },
  { lb: 70, kg: 31.75 },
  { lb: 75, kg: 34.02 },
  { lb: 80, kg: 36.29 },
  { lb: 85, kg: 38.56 },
  { lb: 90, kg: 40.82 },
  { lb: 95, kg: 43.09 },
  { lb: 100, kg: 45.36 },
];

export function WeightConverter() {
  const [inputValue, setInputValue] = useState<number>(0);
  const [fromUnit, setFromUnit] = useState<"kg" | "lb">("kg");

  const toUnit = fromUnit === "kg" ? "lb" : "kg";

  const convertedValue =
    inputValue === 0
      ? 0
      : fromUnit === "kg"
      ? Math.round(inputValue * KG_TO_LB * 100) / 100
      : Math.round(inputValue * LB_TO_KG * 100) / 100;

  const handleSwapUnits = () => {
    setFromUnit(fromUnit === "kg" ? "lb" : "kg");
    // Mantener el valor numérico pero cambiar las unidades
    setInputValue(convertedValue);
  };

  const handleInputChange = (value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    setInputValue(numValue);
  };

  return (
    <div className="space-y-6">
      {/* Conversor principal */}
      <Card className="bg-white">
        <CardHeader className=" px-2">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Convierte Kilos 🔄  Libras
          </CardTitle>
        
        </CardHeader>
        <CardContent className=" flex justify-between gap-1 px-2">
          {/* Input origen */}
 
            <div className="flex items-center gap-0 w-full">
              <Input
                id="input-from"
                type="number"
                value={inputValue || ""}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="0"
                className="text-center text-2xl md:text-2xl font-bold flex-1 p-2 w-full h-12 rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                step="0.1"
              />
              <div className="px-3 py-3 bg-zinc-100 border border-l-0 rounded-r-md font-medium min-w-[50px] text-center h-12">
                {fromUnit}
              </div>
            </div>


          {/* Botón de intercambio */}
 
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapUnits}
              className="h-12 w-12 shrink-0 rounded-full hover:rotate-180 transition-transform duration-300 bg-lime-500 hover:bg-lime-600 text-black"
            >
              <ArrowUpDown className="h-5 w-5 rotate-90"  />
            </Button>


          {/* Input destino */}
       
            <div className="flex items-center gap-0 w-full">
              <Input
                id="input-to"
                type="number"
                value={convertedValue || ""}
                placeholder="0"
                className="text-center text-2xl md:text-2xl font-bold flex-1 bg-muted p-2 w-full h-12 rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled
                readOnly
              />
              <div className="px-3 py-3 bg-zinc-100 border border-l-0 rounded-r-md font-medium min-w-[50px] text-center h-12">
                {toUnit}
              </div>
            </div>
        
        </CardContent>
          
      </Card>

      {/* Tabla de equivalencias */}
      <Card className="bg-white">
        <div className="text-center pt-4">
          <p className="text-lg font-semibold">Tabla de Equivalencias</p>
          
        </div>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 rounded-lg">
            {/* Headers */}
            <div className="font-bold text-2xl text-center pb-2 border-b border-muted-foreground/20">
              Libras
            </div>
            <div className="font-bold text-2xl text-center pb-2 border-b border-muted-foreground/20">
              Kilos
            </div>

            {/* Datos */}
            {conversionTable.map((row, index) => [
              <div
                key={`lb-${index}`}
                className="text-center py-2 hover:bg-muted/50 rounded transition-colors"
              >
                {row.lb} lb
              </div>,
              <div
                key={`kg-${index}`}
                className="text-center py-2 hover:bg-muted/50 rounded transition-colors font-medium"
              >
                {row.kg} kg
              </div>,
            ])}
          </div>
        
        </CardContent>
      </Card>
    </div>
  );
}
