import SignUpComponent from "@/components/sign-up"

const SignUpPage = () => {
  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-md w-full space-y-8">
        <SignUpComponent />
      </div>
    </div>
  )
}

export default SignUpPage;
