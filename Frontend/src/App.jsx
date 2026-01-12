import React from "react";
import AppRoutes from "./routes/AppRoutes";
import UserContext from "./context/UserContext";

const App = () => {
  return (
    <div>
      <UserContext>
        <AppRoutes />
      </UserContext>
    </div>
  );
};

export default App;
