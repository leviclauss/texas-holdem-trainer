import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      let userId = localStorage.getItem('rangeiq_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('rangeiq_user_id', userId);
      }
      try {
        const u = await api.createUser(userId);
        setUser(u);
      } catch (err) {
        console.error('Failed to init user:', err);
      }
      setLoading(false);
    }
    initUser();
  }, []);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const u = await api.getUser(user.id);
      setUser(u);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
