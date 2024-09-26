import { Link } from 'react-router-dom'
import { UserAuthForm } from './components/user-auth-form'
import { IconLink } from '@tabler/icons-react'

export default function SignIn() {
  return (
    <>
      <div className='container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
        <div className='relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex'>
          <div className='absolute inset-0 bg-zinc-900' />
          <div className="w-full h-full z-10 p-5">
            <Link to="https://chiragsaroj.github.io/portfolio/" className='text-blue-200 font-medium text-2xl mb-1 flex gap-1 items-center hover:text-blue-300'>Portfolio Website <IconLink /></Link>
            <iframe
              className="w-full h-full bg-white rounded"
              src="https://chiragsaroj.github.io/portfolio/"
              title="Portfolio Chirag Saroj"
              sandbox="allow-scripts allow-same-origin" 
              />
          </div>
        </div>
        <div className='lg:p-8'>
          <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
            <div className='flex flex-col space-y-2 text-left'>
              <h1 className='text-3xl font-semibold tracking-tight'>Login</h1>
              <p className='text-sm text-muted-foreground'>
                Enter your email and password below <br />
                to log into your account
              </p>
            </div>
            <UserAuthForm />
            <div className='text-center text-primary py-3 text-sm'>
              Create account?{' '}
              <Link
                to='/sign-up'
                className='underline underline-offset-4 hover:text-primary'
              >
                Register
              </Link>
            </div>
            <p className='px-8 text-center text-sm text-muted-foreground'>
              By clicking login, you agree to our{' '}
              <a
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
