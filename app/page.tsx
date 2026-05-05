import { redirect } from 'next/navigation';

// Root page redirects — middleware handles the actual routing
// This catches any edge case where middleware doesn't fire
export default function HomePage() {
  redirect('/login');
}
