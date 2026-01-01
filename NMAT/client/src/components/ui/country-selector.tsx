import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { countries } from "@shared/countries";

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string, dialCode?: string) => void;
}

export function CountrySelector({ value, onValueChange }: CountrySelectorProps) {
  return (
    <Select 
      onValueChange={(val) => {
        const country = countries.find(c => c.name === val);
        onValueChange(val, country?.dial);
      }} 
      defaultValue={value}
    >
      <FormControl>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
      </FormControl>
      <SelectContent className="max-h-[300px]">
        {countries.map((c) => (
          <SelectItem key={c.code} value={c.name}>
            <span className="mr-2 text-muted-foreground font-mono w-8 inline-block text-right">{c.code}</span>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function getDialCode(countryName: string) {
  return countries.find(c => c.name === countryName)?.dial || "";
}
