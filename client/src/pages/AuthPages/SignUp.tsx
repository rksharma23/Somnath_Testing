import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up | Firefox Dashboard"
        description="Create a new account to access the Firefox Dashboard bike monitoring system"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
