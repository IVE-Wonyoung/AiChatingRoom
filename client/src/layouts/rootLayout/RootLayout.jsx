import { Link, Outlet } from "react-router-dom";
import styles from "./RootLayout.module.css";
import { SignedIn, UserButton } from "@clerk/clerk-react";
function RootLayout() {
  return (
    <div className={styles.rootLayout}>
      <header>
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="" />
          <span>AIChatingRoom</span>
        </Link>
        <div className="user">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
