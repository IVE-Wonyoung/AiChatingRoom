import { SignIn } from "@clerk/clerk-react";
import styles from "./SignInPage.module.css";
function SignInPage() {
  return (
    <div className={styles.signinpage}>
      <SignIn
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
      ></SignIn>
    </div>
  );
}

export default SignInPage;
