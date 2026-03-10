import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role?: string;
}

export default function ManageUsers() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminAndLoadData();
    }
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) return;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    await loadUsers();
    setLoading(false);
  };

  const loadUsers = async () => {
    const { data: rolesData, error } = await supabase
      .from('user_roles')
      .select('user_id, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    setUsers(rolesData?.map(r => ({
      id: r.user_id,
      email: 'Utilisateur ' + r.user_id.substring(0, 8),
      created_at: r.created_at,
      role: r.role
    })) || []);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminEmail.trim()) {
      toast.error("Veuillez entrer un email");
      return;
    }

    setIsCreating(true);

    try {
      const { data: garageData } = await supabase
        .from('garages')
        .select('user_id')
        .eq('email', newAdminEmail)
        .maybeSingle();

      if (!garageData) {
        toast.error("Cet utilisateur n'existe pas ou n'a pas de garage associe");
        setIsCreating(false);
        return;
      }

      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', garageData.user_id)
        .eq('role', 'admin')
        .maybeSingle();

      if (existingRole) {
        toast.error("Cet utilisateur est deja administrateur");
        setIsCreating(false);
        return;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: garageData.user_id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      toast.success("Administrateur ajoute avec succes");
      setNewAdminEmail("");
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error("Erreur lors de l'ajout de l'administrateur");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success("Role admin supprime");
      await loadUsers();
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting admin role:', error);
      toast.error("Erreur lors de la suppression du role");
    }
  };

  if (authLoading || loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 rounded-full hover:bg-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard admin
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestion des utilisateurs</h1>
          <p className="text-gray-500">Gerer les roles administrateurs</p>
        </div>

        {/* Add Admin Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ajouter un administrateur</h2>
              <p className="text-sm text-gray-500">Entrez l'email du compte garage a promouvoir administrateur</p>
            </div>
          </div>
          <form onSubmit={handleCreateAdmin} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="garage@example.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={isCreating}
                className="rounded-xl border-gray-200"
              />
            </div>
            <Button type="submit" disabled={isCreating} className="rounded-full">
              {isCreating ? "Ajout..." : "Ajouter admin"}
            </Button>
          </form>
        </div>

        {/* Admin list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Administrateurs</h2>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">ID Utilisateur</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date d'ajout</TableHead>
                <TableHead className="text-right text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.filter(u => u.role === 'admin').map((u) => (
                <TableRow key={u.id} className="border-gray-50">
                  <TableCell className="font-medium font-mono text-sm text-gray-700">{u.id}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Shield className="h-3 w-3" />
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToDelete(u.id)}
                        className="rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.filter(u => u.role === 'admin').length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    Aucun administrateur
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le role admin ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retirera le role administrateur de cet utilisateur. Il pourra toujours acceder a son compte en tant qu'utilisateur normal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => userToDelete && handleDeleteRole(userToDelete)} className="rounded-full">
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
