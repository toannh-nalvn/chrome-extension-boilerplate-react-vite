export interface CheckInCheckOut {
  checkIn: string;
  checkOut: string;
  createdAt: string | null;
  day: string;
  deletedAt: string | null;
  id: number;
  type: string;
  updatedAt: string | null;
  userId: number;
  userReference: null;
}

export interface CheckInCheckOutPages {
  data: {
    total: number;
    results: CheckInCheckOut[];
  };
  error: string;
}
