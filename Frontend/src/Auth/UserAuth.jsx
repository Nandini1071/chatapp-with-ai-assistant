import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../context/UserContext";

const UserAuth = ({ children }) => {
  const { user, loading } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Checking auth...</div>;

  return <>{children}</>;
};

export default UserAuth;
