
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
  takenByPhone?: string;
}

export type ViewState = 'home' | 'post-job' | 'browse-jobs' | 'my-jobs';

export interface CreateTaskPayload {
  name: string;
  phone: string;
  address: string;
  area: number;
  price: number;
  wantsSalt: boolean;
  hasEquipment: boolean;
  description: string;
  ownerPassword: string;
}
