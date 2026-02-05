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