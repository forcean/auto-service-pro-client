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
  brands?: IBrand[];
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

export interface IBrand {
  id: string;
  name: string;
}

export interface IResCategories {
  category: ICategory[]
}
export interface ICategory {
  id: string;
  name: string;
  slug: string;
  code: string;
  level: number;
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



