"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersPage() {
  const { userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole !== 'admin') {
      router.push('/dashboard'); // Redirect if not admin
    }
  }, [userRole, router]);

  if (userRole !== 'admin') {
    return (
       <div className="flex flex-col items-center justify-center gap-4 p-6 h-full">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Users Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage system users and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User management interface will be here. (Table for users, roles, permissions)</p>
        </CardContent>
      </Card>
    </div>
  );
}
