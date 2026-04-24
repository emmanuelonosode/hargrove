"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  propertyId: number;
  className?: string;
  size?: number;
}

export function FavoriteButton({ propertyId, className, size = 16 }: FavoriteButtonProps) {
  const { user, apiFetch } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    apiFetch("/api/v1/properties/favorites/")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        const favs = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
        setIsFavorite(favs.some((f: any) => f.property?.id === propertyId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, propertyId, apiFetch]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save properties.");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        // Delete favorite
        await apiFetch(`/api/v1/properties/favorites/${propertyId}/`, {
          method: "DELETE",
        });
        setIsFavorite(false);
        toast.success("Removed from saved properties.");
      } else {
        // Add favorite
        const res = await apiFetch("/api/v1/properties/favorites/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ property_id: propertyId }),
        });
        if (!res.ok) throw new Error("Failed to save");
        setIsFavorite(true);
        toast.success("Saved to your properties.");
      }
    } catch (err) {
      toast.error("Failed to update saved properties.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? "Remove from saved properties" : "Save property"}
      className={cn(
        "transition-colors flex items-center gap-1.5",
        isFavorite ? "text-[#FF3B30] hover:text-[#FF3B30]/80" : "text-neutral-500 hover:text-[#FF3B30]",
        className
      )}
    >
      <Heart size={size} className={cn("transition-all", isFavorite && "fill-[#FF3B30]")} />
      {isFavorite ? "Saved" : "Save"}
    </button>
  );
}
