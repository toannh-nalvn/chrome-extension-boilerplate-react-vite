export interface Auth {
  user: User;
  isAuthorized: boolean;
  token?: string;
  refreshToken?: string;
  expiredIn?: number;
  userInfo?: string;
}

export interface Token {
  data: { email: string };
  iat: number;
  exp: number;
}

export interface UserInfo {
  data: {
    username: string;
    staffId: number;
    firstName: string;
    lastName: string;
    gender: string;
    birthday: string;
    email: string;
    phoneNumber: string;
    roles: string;
    joinedDate: string;
    contractType: string;
    contractDate: string;
    quittingDate: string;
    id: number;
    superuser: boolean;
    remoteStaff: boolean;
    status: string;
    identityCardNumber: string;
    taxCode: string;
    companyInfo: CompanyInfo[];
    avatar: string;
    timekeeping: number;
    fullName: string;
  };
  error: string;
}

export interface CompanyInfo {
  id: number;
  companyName: string;
  description: string;
  status: string;
}
