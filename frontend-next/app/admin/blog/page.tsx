"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit3, ExternalLink, Loader2, ChevronLeft, ChevronRight, Pin } from "lucide-react";

const POSTS_PER_PAGE = 10;

export default function AdminBlogList() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/blogs');
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                const cleanPosts = json.data.map((item: any) => {
                    const baseData = item._doc ? item._doc : item;
                    return { ...baseData, teaser: item.teaser };
                });
                setPosts(cleanPosts);
            }
        } catch (err) {
            console.error("Error fetching blogs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!id) return alert("Error: Post has no ID");
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(prev => prev.filter(p => p._id !== id));
            } else {
                alert("Could not delete the post from the server");
            }
        } catch {
            alert("Network error: Could not delete");
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginated = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

    const goToPage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[hsl(var(--background))]">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--foreground)/0.4)]" />
            <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.3)]">Loading journal…</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <div className="max-w-6xl mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-20">

                {/* ── HEADER ── */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 mb-0 border-b border-[hsl(var(--foreground)/0.08)]">
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--foreground)/0.35)] mb-3">Admin — Journal</p>
                        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-[hsl(var(--ivory))]">
                            Blog
                        </h1>
                    </div>
                    <Link
                        href="/admin/blog/new"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[hsl(var(--ivory))] text-[hsl(var(--background))] font-mono text-[10px] uppercase tracking-[0.25em] hover:bg-[hsl(var(--ivory-dark))] transition-colors self-start md:self-auto"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        New post
                    </Link>
                </header>

                {/* ── TABLE ── */}
                {posts.length > 0 ? (
                    <>
                        <div className="divide-y divide-[hsl(var(--foreground)/0.06)]">
                            {/* Head row */}
                            <div className="hidden md:grid grid-cols-12 gap-4 py-4 px-2">
                                <span className="col-span-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.3)]">Status</span>
                                <span className="col-span-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.3)]">Date</span>
                                <span className="col-span-7 font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.3)]">Title</span>
                                <span className="col-span-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.3)] text-right">Actions</span>
                            </div>

                            {paginated.map((post) => (
                                <div
                                    key={post._id}
                                    className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center py-5 px-2 hover:bg-[hsl(var(--foreground)/0.03)] transition-colors"
                                >
                                    {/* Status */}
                                    <div className="md:col-span-1 flex items-center">
                                        {post.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[hsl(var(--ivory))] text-[hsl(var(--background))] font-mono text-[8px] uppercase tracking-[0.2em]">
                                                <Pin className="h-2 w-2" />
                                                Featured
                                            </span>
                                        ) : (
                                            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[hsl(var(--foreground)/0.25)]">—</span>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="md:col-span-2 font-mono text-[10px] text-[hsl(var(--foreground)/0.4)]">
                                        {post.publishedAt
                                            ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </div>

                                    {/* Title + thumbnail */}
                                    <div className="md:col-span-7 flex items-center gap-4">
                                        {post.image && (
                                            <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 overflow-hidden border border-[hsl(var(--foreground)/0.08)] bg-[hsl(var(--card))]">
                                                <img src={post.image} alt="" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                            </div>
                                        )}
                                        <span className="font-black italic uppercase tracking-tighter text-[hsl(var(--ivory))] text-lg md:text-xl leading-tight line-clamp-1">
                                            {post.title || "Untitled"}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-4">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="text-[hsl(var(--foreground)/0.35)] hover:text-[hsl(var(--ivory))] transition-colors"
                                            title="View post"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={`/admin/blog/edit/${post._id}`}
                                            className="text-[hsl(var(--foreground)/0.35)] hover:text-[hsl(var(--ivory))] transition-colors"
                                            title="Edit post"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post._id)}
                                            className="text-[hsl(var(--foreground)/0.35)] hover:text-red-400 transition-colors"
                                            title="Delete post"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── PAGINATION ── */}
                        {totalPages > 1 && (
                            <div className="mt-12 pt-8 border-t border-[hsl(var(--foreground)/0.07)]">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => goToPage(page - 1)}
                                        disabled={page === 1}
                                        className="flex items-center justify-center w-9 h-9 border border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground)/0.5)] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.4)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                        const isActive = p === page;
                                        const showPage = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                                        const showEllipsisBefore = p === page - 2 && page > 3;
                                        const showEllipsisAfter = p === page + 2 && page < totalPages - 2;

                                        if (showEllipsisBefore || showEllipsisAfter) {
                                            return <span key={p} className="w-9 h-9 flex items-center justify-center font-mono text-[10px] text-[hsl(var(--foreground)/0.25)]">…</span>;
                                        }
                                        if (!showPage) return null;

                                        return (
                                            <button
                                                key={p}
                                                onClick={() => goToPage(p)}
                                                className={`w-9 h-9 flex items-center justify-center font-mono text-[11px] border transition-all ${
                                                    isActive
                                                        ? "bg-[hsl(var(--ivory))] text-[hsl(var(--background))] border-[hsl(var(--ivory))]"
                                                        : "border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground)/0.5)] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.4)]"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => goToPage(page + 1)}
                                        disabled={page === totalPages}
                                        className="flex items-center justify-center w-9 h-9 border border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground)/0.5)] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.4)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.25)] mt-4">
                                    Page {page} of {totalPages} · {posts.length} posts total
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-32 text-center border-t border-[hsl(var(--foreground)/0.07)]">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--foreground)/0.25)]">No posts found</p>
                        <Link
                            href="/admin/blog/new"
                            className="inline-flex items-center gap-2 mt-8 px-5 py-3 border border-[hsl(var(--foreground)/0.2)] text-[hsl(var(--foreground)/0.5)] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.5)] font-mono text-[10px] uppercase tracking-[0.25em] transition-all"
                        >
                            <Plus className="h-3 w-3" /> Write first post
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}