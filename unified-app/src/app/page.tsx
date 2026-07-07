import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const isAdmin = host.startsWith('admin.') || host.includes('admin.');
  
  if (isAdmin) {
    redirect('/admin/dashboard');
  }
  
  redirect('/home');
}
