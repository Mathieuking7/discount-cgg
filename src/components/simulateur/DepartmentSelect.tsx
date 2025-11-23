import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departementsTarifs, departementsLabels } from "@/data/departementsTarifs";

interface DepartmentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const DepartmentSelect = ({ value, onChange }: DepartmentSelectProps) => {
  const departements = Object.keys(departementsTarifs).sort((a, b) => {
    // Trier numériquement, mettre les départements DOM-TOM à la fin
    const aNum = a.length === 3 ? 1000 + parseInt(a) : parseInt(a);
    const bNum = b.length === 3 ? 1000 + parseInt(b) : parseInt(b);
    return aNum - bNum;
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Département</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un département" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {departements.map((dept) => (
            <SelectItem key={dept} value={dept}>
              {dept} - {departementsLabels[dept]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
