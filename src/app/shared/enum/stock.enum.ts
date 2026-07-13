export enum EStockStatus {
  NORMAL = 'normal',
  LOW = 'low',
  OUT = 'out',
}

export enum EProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

export enum EStockMovementType {
  RECEIVE = 'RECEIVE',
  ISSUE = 'ISSUE',
  RETURN = 'RETURN',
  ADJUST = 'ADJUST',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export enum EStockMovementDirection {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

export enum EReferenceType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  SALES_ORDER = 'SALES_ORDER',
  REPAIR_ORDER = 'REPAIR_ORDER',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  STOCK_TRANSFER = 'STOCK_TRANSFER',
  MANUAL = 'MANUAL',
}