import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface PlateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PlateInput = ({ value, onChange }: PlateInputProps) => {
  const [isValid, setIsValid] = useState(true);

  const validatePlate = (plate: string) => {
    if (!plate) return true;
    
    // Formats autorisés : AA-123-AA ou 123-ABC-45
    const newFormat = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i;
    const oldFormat = /^\d{3,4}-[A-Z]{3}-\d{2}$/i;
    
    return newFormat.test(plate) || oldFormat.test(plate);
  };

  useEffect(() => {
    setIsValid(validatePlate(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Plaque d'immatriculation</label>
      <div className="relative">
        <div className="flex items-center border-2 rounded-lg overflow-hidden bg-white" 
             style={{ 
               borderColor: isValid ? 'hsl(var(--border))' : 'hsl(var(--destructive))',
               boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
             }}>
          <div className="bg-blue-600 text-white px-3 py-4 flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, #003399 0%, #0055cc 100%)' }}>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold">F</span>
              <div className="flex gap-0.5 mt-0.5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-0.5 h-0.5 bg-yellow-400 rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="AA-123-AA"
            className="border-0 text-lg font-bold tracking-wider text-center focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ fontFamily: 'monospace' }}
          />
        </div>
      </div>
      {!isValid && value && (
        <p className="text-xs text-destructive">
          Format invalide. Utilisez AA-123-AA ou 123-ABC-45
        </p>
      )}
    </div>
  );
};
