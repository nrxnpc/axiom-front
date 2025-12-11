interface UserData {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  userType?: string;
  points?: number;
  role?: string;
  registrationDate?: string;
  lastLogin?: string;
  isActive?: boolean;
}

class UserStore {
  private user: UserData | null = null;

  setUser(userData: UserData) {
    this.user = userData;
  }

  getUser(): UserData | null {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }
}

export const userStore = new UserStore();

