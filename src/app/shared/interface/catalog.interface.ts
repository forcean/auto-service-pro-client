export interface IQueryCatalogProducts {
    isActive?: boolean;
    isSelectable?: boolean;
    categoriesId?: string;
}

export interface IQueryCatalogVehicles extends IQueryCatalogProducts {
    vehicleId?: string;
    brandId?: string;
    modelId?: string;
}

export interface IResVehicles {
    vehicles?: IVehicle[];
    brands?: IVehicle[];
    models?: IVehicle[];
}

export interface IVehicle {
    vehicleId: string;
    brand: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    engines: string[];
    remark?: string;
}