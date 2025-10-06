import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ChangePasswordForm } from "@modules/auth/components/ResetPasswordForm"

interface ResetPasswordPageProps {
  email: string
  token: string
}

export default function ResetPasswordPage({ email, token }: ResetPasswordPageProps) {
  return (
    <>
      <Head>
        <title>Reset Password - AKSHAR AYURVED</title>
        <meta name="description" content="Reset your password for AKSHAR AYURVED account" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="mt-2 text-gray-600">
              Enter your new password to complete the reset process
            </p>
          </div>
          <ChangePasswordForm email={email} token={token} customer={false} />
          <div className="text-center">
            <Link href="/login" className="text-[#cc8972] hover:text-[#cc8972] text-sm font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { email, token } = context.query

  if (
    typeof email !== "string" ||
    typeof token !== "string" ||
    !email ||
    !token
  ) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      email,
      token,
    },
  }
}
