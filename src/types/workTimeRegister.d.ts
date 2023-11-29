export interface Data {
  total: number;
  results: Result[];
}

export interface Result {
  id: number;
  type: string;
  user: User;
  assignedUser: AssignedUser;
  actualApprovalUser: ActualApprovalUser;
  reason: string;
  approvalStatus: string;
  note: string;
  timeIntervals: TimeInterval[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface AssignedUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface ActualApprovalUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface TimeInterval {
  day: string;
  from: string;
  to: string;
}

export interface WorkTimeRegistersPages {
  error: string | null;
  data: Data;
}
