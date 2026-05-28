import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function RootPage() {
  const token = cookies().get('sh_token')?.value;
  redirect(token ? '/problems' : '/login');
}
