
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { medicines } from "@/data/medicines";
import { Medicine } from "@/types";

interface MedicineSearchProps {
  onSelectMedicine: (medicine: Medicine) => void;
}

const MedicineSearch = ({ onSelectMedicine }: MedicineSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return medicines.slice(0, 10); // Show first 10 by default
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    
    return medicines.filter(medicine => 
      medicine.name.toLowerCase().includes(lowerCaseSearch) ||
      medicine.category.toLowerCase().includes(lowerCaseSearch) ||
      medicine.description.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search Medicines</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search by name, category, or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredMedicines.map((medicine) => (
          <Card key={medicine.id} className="overflow-hidden h-full">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{medicine.name}</h3>
                  <Badge variant="outline" className="mt-1">{medicine.category}</Badge>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {medicine.description}
                  </p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="mt-1"
                  onClick={() => onSelectMedicine(medicine)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredMedicines.length === 0 && (
          <div className="col-span-full text-center p-8">
            <p className="text-muted-foreground">No medicines found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineSearch;
