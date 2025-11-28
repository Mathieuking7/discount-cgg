import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useGarageProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [garage, setGarage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleData) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Check if user has a garage profile
      const { data: garageData, error } = await supabase
        .from("garages")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching garage:", error);
        setLoading(false);
        return;
      }

      if (!garageData) {
        // No garage profile, redirect to complete profile
        navigate("/complete-profile");
        return;
      }

      setGarage(garageData);
      setLoading(false);
    };

    checkProfile();
  }, [user, authLoading, navigate]);

  return { garage, loading, isAdmin, user };
}
