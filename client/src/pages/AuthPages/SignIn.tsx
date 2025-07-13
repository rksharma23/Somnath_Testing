import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Firefox Dashboard"
        description="Sign in to access the Firefox Dashboard bike monitoring system"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
