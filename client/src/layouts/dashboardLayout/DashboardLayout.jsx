import { Outlet, useNavigate } from "react-router-dom";
import styles from "./DashboardLayout.module.css";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useId } from "react";
import Spinner from "../../components/Spinner/Spinner";
import ChatList from "../../components/ChatList/ChatList";
function DashboardLayout() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [userId, isLoaded, navigate]);

  if (!isLoaded) return <Spinner />;

  return (
    <div className={styles.dashboardLayout}>
      <div className={styles.menu}>
        <ChatList />
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
