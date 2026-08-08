export interface DashboardUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface DashboardStatistics {
  favorites: number;
  locked: number;
  purchased: number;
  cancelled: number;
}

export interface DashboardBooking {
  id: number;
  property: {
    id: number;
    title: string;
    price: number;
  };
  state: string;
  created_at: string;
}

export interface DashboardFavorite {
  id: number;
  property: {
    id: number;
    title: string;
    price: number;
  };
  created_at: string;
}

export interface DashboardResponse {
  user: DashboardUser;
  statistics: DashboardStatistics;
  recent_bookings: DashboardBooking[];
  recent_favorites: DashboardFavorite[];
}
