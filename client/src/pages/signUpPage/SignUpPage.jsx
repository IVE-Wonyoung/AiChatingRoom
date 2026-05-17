import { SignUp } from "@clerk/clerk-react";
import styles from "./SignUpPage.module.css";
function SignUpPage() {
  return (
    <div className={styles.signuppage}>
      <SignUp path="/sign-up" signInUrl="/sign-in"></SignUp>
    </div>
  );
}

export default SignUpPage;
