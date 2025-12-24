
export interface HandState {
  isPinching: boolean;
  isOpen: boolean;
  x: number;
  y: number;
  rotation: number;
}

export interface ChristmasWish {
  title: string;
  message: string;
  language: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}
