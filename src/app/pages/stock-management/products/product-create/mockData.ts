import { ICategory } from "../../../../shared/interface/category.interface";
import { VehicleCompatibility } from "../../../../shared/interface/vehicle.interface";


export const CATEGORY_MOCK: ICategory[] = [
  {
    id: 'cat-brake',
    name: 'Brake',
    slug: 'brake',
    code: 'BRAKE',
    level: 1,
    path: ['BRAKE'],
    isSelectable: false,
    allowVehicleBinding: false,
    allowStock: false,
    children: [
      {
        id: 'cat-brake-pad',
        name: 'Brake Pad',
        slug: 'brake-pad',
        code: 'BRKP',
        level: 2,
        path: ['BRAKE', 'BRKP'],
        isSelectable: true,
        allowVehicleBinding: true,
        allowStock: true,
        children: []
      },
      {
        id: 'cat-brake-disc',
        name: 'Brake Disc',
        slug: 'brake-disc',
        code: 'BRKD',
        level: 2,
        path: ['BRAKE', 'BRKD'],
        isSelectable: true,
        allowVehicleBinding: true,
        allowStock: true,
        children: []
      }
    ]
  },
  {
    id: 'cat-engine',
    name: 'Engine',
    slug: 'engine',
    code: 'ENG',
    level: 1,
    path: ['ENG'],
    isSelectable: false,
    allowVehicleBinding: false,
    allowStock: false,
    children: [
      {
        id: 'cat-oil-filter',
        name: 'Oil Filter',
        slug: 'oil-filter',
        code: 'OILF',
        level: 2,
        path: ['ENG', 'OILF'],
        isSelectable: false,
        allowVehicleBinding: false,
        allowStock: false,
        children: [
          {
            id: 'cat-oil-filter-1',
            name: 'Oil Filter 1',
            slug: 'oil-filter-1',
            code: 'OILF1',
            level: 3,
            path: ['ENG', 'OILF', 'OILF1'],
            isSelectable: true,
            allowVehicleBinding: true,
            allowStock: true,
            children: []
          }
        ]
      }
    ]
  }
];

export const BRAND_MOCK = {
  'cat-brake-pad': [
    { id: 'brand-abc', name: 'Brand ABC', code: 'ABC' },
    { id: 'brand-def', name: 'Brand DEF', code: 'DEF' },
    { id: 'brand-ghi', name: 'Brand GHI', code: 'GHI' },
  ],
  'cat-oil-filter-1': [
    { id: 'brand-xyz', name: 'Brand XYZ', code: 'XYZ' }
  ]
};

export const MOCK_VEHICLE_BRANDS = [
  { id: '1', name: 'Toyota' },
  { id: '2', name: 'Honda' },
  { id: '3', name: 'Ford' }
];

export const MOCK_VEHICLE_MODELS_1 = [
  { id: '1', name: 'Camry' },
  { id: '2', name: 'Corolla' },
  { id: '3', name: 'Prius' },
  { id: '4', name: 'City' }
];

export const MOCK_VEHICLE_MODELS_2 = [
  { id: '3', name: 'Civic' },
  { id: '4', name: 'Accord' }
];

export const MOCK_VEHICLES: VehicleCompatibility[] = [
  {
    vehicleId: 'v1',
    brand: 'Toyota',
    model: 'Camry',
    yearFrom: 2015,
    yearTo: 2020,
    engines: ['2.0L', '2.5L'],
  },
  {
    vehicleId: 'v2',
    brand: 'Honda',
    model: 'Civic',
    yearFrom: 2018,
    yearTo: 2022,
    engines: ['1.5L', '1.8L'],
  },
  {
    vehicleId: 'v3',
    brand: 'Ford',
    model: 'Focus',
    yearFrom: 2014,
    yearTo: 2018,
    engines: ['2.0L'],
  }
];