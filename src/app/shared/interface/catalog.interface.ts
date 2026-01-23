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