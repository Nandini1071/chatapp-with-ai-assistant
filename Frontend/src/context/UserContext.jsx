import React from "react";
import { useState } from "react";
import { createContext } from "react";

export const userContext = createContext();

const UserContext = ({ children }) => {
  const [user, setuser] = useState(null);
  return (
    <div>
      <userContext.Provider value={{ user, setuser }}>
        {children}
      </userContext.Provider>
    </div>
  );
};

export default UserContext;
