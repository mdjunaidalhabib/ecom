"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Helper: fetch user by token
  const fetchMe = async (token) => {
    try {
      const res = await fetch(
        `/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMe(data);
      } else {
        localStorage.removeItem("token");
        setMe(null);
      }
    } catch (err) {
      console.error("❌ Failed to load user:", err);
      localStorage.removeItem("token");
      setMe(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // ✅ App শুরু হলে localStorage থেকে token চেক করো
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchMe(token);
    } else {
      setLoadingUser(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ me, setMe, loadingUser, fetchMe }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
