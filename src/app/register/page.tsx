
// src/app/register/page.tsx
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <RegisterForm />
    </div>
  );
}
