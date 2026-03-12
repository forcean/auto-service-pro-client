export interface IQueryCatalogProducts {
  isActive?: boolean;
  isSelectable?: boolean;
  categoriesId?: string;
}

export interface IQueryCatalogVehicles extends IQueryCatalogProducts {
  vehicleId?: string;
  brandCode?: string;
  modelCode?: string;
  generation?: string;
}

export interface IResVehicles {
  vehicles?: IVehicle[];
  vehicleBrands?: IBrandVehicle[];
  vehicleModels?: IModelVehicle[];
}

export interface IVehicle {
  id: string;
  brand: string;
  brandCode: string;
  model: string;
  modelCode: string;
  generation: string;
  platform: string;
  yearFrom: number;
  yearTo: number;
  engines: IEngine[];
  remark?: string;
  isActive: boolean;
  selectedEngines?: string[];
  isNew?: boolean;
}

export interface IEngine {
  code: string;
  fuel: string;
}

export interface IBrandVehicle {
  id: string;
  name: string;
  code: string;
}

export interface IModelVehicle {
  id: string;
  model: string;
  modelCode: string;
  generation: string;
}

export interface IResCategories {
  categories: ICategory[]
}
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  code: string;
  level: number;
  parentId: string;
  path: string[];
  expanded?: boolean;
  isSelectable: boolean;
  allowVehicleBinding: boolean;
  allowStock: boolean;
  isSelected?: boolean;
  children: ICategory[];
}

export interface IProductBrand {
  id: string;
  name: string;
  code: string;
  country?: string;
  logoUrl?: string;
}
export interface IResBrands {
  brands: IProductBrand[]
}



