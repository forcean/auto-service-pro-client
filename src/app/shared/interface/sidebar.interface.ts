export interface IResponseMenu {
  role: string;
  menus: menu[];
}

export interface IMenu {
  seq: number;
  key: string;
  displayName: string;
  icon: string;
  endpoint: string;
  children: menu[];
}

interface menu {
  seq: number;
  key: string;
  displayName: string;
  icon: string;
  endpoint: string;
  children: menu[];
}

export interface IAvailableMenu {
  home: MenuOption;
  dashboard: MenuOption;
  report: MenuOption;
  user: MenuOption;
  guide: MenuOption;
}

interface MenuOption {
  displayName: string;
  isShow: boolean;
}