
export interface SnowTask {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: number; // in m2
  price: number; // total price in DKK
  wantsSalt: boolean;
  hasEquipment: boolean;
  description: string;
  createdAt: number;
  status: 'available' | 'taken' | 'completed';
  takenBy?: string;
}

export type ViewState = 'home' | 'post-job' | 'browse-jobs' | 'my-jobs';
