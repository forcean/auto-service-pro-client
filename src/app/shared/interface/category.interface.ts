export interface ICategory {
  id: string;
  name: string;
  slug: string;
  code: string;

  level: number;
  path: string[];

  isSelectable: boolean;
  allowVehicleBinding: boolean;
  allowStock: boolean;

  children: ICategory[];
}