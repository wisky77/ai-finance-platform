'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    router.push('/');
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
      <LogOut className="mr-2 h-4 w-4" />
      <span>Sign Out</span>
    </DropdownMenuItem>
  );
}
