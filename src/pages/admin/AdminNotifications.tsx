import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Bell, Eye } from "lucide-react";

export default function AdminNotifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single();

    if (!roles || roles.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadNotifications();
  };

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        demarches (
          numero_demarche,
          type,
          immatriculation,
          status,
          montant_ttc
        ),
        garages (
          raison_sociale,
          siret
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    loadNotifications();
  };

  const handleViewDemarche = (demarcheId: string) => {
    navigate(`/dashboard/demarche/${demarcheId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Toutes les notifications ont ete lues'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Statut</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Message</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Garage</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Demarche</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className={`border-gray-50 ${!notification.is_read ? "bg-blue-50/50" : ""}`}
                >
                  <TableCell>
                    {!notification.is_read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Nouveau</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{notification.type}</span>
                  </TableCell>
                  <TableCell className="max-w-md text-gray-700 text-sm">
                    {notification.message}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {notification.garages?.raison_sociale || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-700 text-sm">{notification.demarches?.numero_demarche || '-'}</span>
                    {notification.demarches?.immatriculation && (
                      <div className="text-xs text-gray-400">
                        {notification.demarches.immatriculation}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {notification.demarche_id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDemarche(notification.demarche_id)}
                          className="rounded-full text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      )}
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full text-xs"
                        >
                          Marquer lu
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Aucune notification
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
