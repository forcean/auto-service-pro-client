export interface VehicleCompatibility {
    vehicleId: string;
    brand: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    engines?: string[];
    isNew?: boolean;
    selectedEngines?: string[];
    remark?: string;
}
