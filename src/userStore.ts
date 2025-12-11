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

type UserStoreListener = (user: UserData | null) => void;

class UserStore {
  private user: UserData | null = null;
  private listeners: Set<UserStoreListener> = new Set();

  setUser(userData: UserData) {
    this.user = userData;
    this.notifyListeners();
  }

  getUser(): UserData | null {
    return this.user;
  }

  clearUser() {
    this.user = null;
    this.notifyListeners();
  }

  subscribe(listener: UserStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }
}

export const userStore = new UserStore();

