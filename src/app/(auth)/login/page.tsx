// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm';
import Logo from '@/components/Logo'; // Import the new Logo component

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-block mb-4">
            <Logo className="h-auto" width={250} height={62.5}/> {/* Adjusted for PNG */}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Lifeweaver Notes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Please sign in to continue.
          </p>
        </div>
        <LoginForm />
         <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Demo users:</p>
          <ul className="list-disc list-inside">
            <li>superadmin@lifeweaver.com</li>
            <li>admin@lifeweaver.com</li>
            <li>clinician@lifeweaver.com</li>
            <li>(Or any other email to login as a clinician)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
