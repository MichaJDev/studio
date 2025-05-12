
// src/app/login/page.tsx
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <LoginForm />
    </div>
  );
}
