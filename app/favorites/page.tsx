'use client';

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import { api } from "@/app/api/api";
import { toggleFavorite } from "@/app/api/favorites";
import ProductCard from "@/app/components/product/ProductCard";
import type { ApiProduct, Product } from "@/app/components/product/types";

const mapProduct = (p: ApiProduct): Product => ({
    id: p._id,
    title: p.title,
    brand: typeof p.brand === "object" && p.brand !== null ? p.brand.name : "",
    price: p.price,
    imageUrl: p.images?.[0] || "/images/ImagePlaceholder.jpg",
    isFavorite: true,
    seller: {
        rating: p.seller?.stats?.ratingAverage ?? p.seller?.rating,
    },
});

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await api("/api/favorites");
                const data = await res.json();

                if (!data.success) {
                    setError("Could not load favorites.");
                    return;
                }

                setFavorites((data.favorites || []).filter(Boolean));
            } catch {
                setError("Server error.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const handleToggleFavorite = async (id: string) => {
        const ok = await toggleFavorite(id);
        if (ok !== undefined) {
            setFavorites((prev) => prev.filter((p) => String(p._id) !== id));
        }
    };

    if (loading) {
        return <div className="max-w-6xl mx-auto px-4 min-h-screen" />;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pb-16 min-h-screen">
            <div className="pt-10 pb-8 border-b border-border/30">
                <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 fill-accent text-accent" />
                    <h1 className="text-3xl font-serif leading-tight">My favorites</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {favorites.length > 0
                        ? `${favorites.length} ${favorites.length === 1 ? "item" : "items"} saved`
                        : "Items you save will appear here."}
                </p>
            </div>

            {error ? (
                <p className="text-center mt-20 text-red-400">{error}</p>
            ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-24">
                    <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-5">
                        <Heart className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-serif mb-2">No favorites yet</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Tap the heart on any item to save it here for later.
                    </p>
                    <Link
                        href="/"
                        className="px-6 h-12 inline-flex items-center rounded-2xl bg-foreground text-background text-sm font-bold hover:opacity-80 transition"
                    >
                        Start shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
                    {favorites.map((p) => (
                        <ProductCard
                            key={p._id}
                            product={mapProduct(p)}
                            onToggleFavorite={handleToggleFavorite}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
