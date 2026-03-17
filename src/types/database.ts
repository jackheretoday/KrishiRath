export type Role = 'farmer' | 'owner';

export interface Profile {
  id: string; // Database UUID
  role: Role;
  name: string;
  email: string;
  phone?: string;
  village?: string;
  district?: string;
  created_at?: string;
}

export interface Equipment {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  image?: string;
  location: string;
  price_per_hour: number;
  availability: boolean;
  description?: string;
  rating?: number;
  reviews_count?: number;
  created_at?: string;
}

export interface Booking {
  id: string;
  farmer_id: string;
  equipment_id: string;
  date: string;
  hours: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  total_price: number;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
      };
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, 'id' | 'created_at'>;
        Update: Partial<Equipment>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at'>;
        Update: Partial<Booking>;
      };
    };
  };
}
