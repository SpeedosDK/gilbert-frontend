"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, ChevronLeft, ChevronRight, Pin } from "lucide-react";

const POSTS_PER_PAGE = 6;
const API_URL = ''; // relative ? Next.js proxy handles routing to backend

interface BlogPost {
    _id: string;
    title?: string;
    slug?: string;
    image?: string;
    isActive?: boolean;
    publishedAt?: string;
    teaser?: string;
}

export default function PublicBlogIndex() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${API_URL}/api/blogs`);
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    const cleanPosts = json.data.map((item: BlogPost & { _doc?: BlogPost }) => {
                        const baseData = item._doc ? item._doc : item;
                        return { ...baseData, teaser: item.teaser || "" };
                    });
                    setPosts(cleanPosts);
                }
            } catch (err) {
                console.error("Error fetching blog posts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // Split: featured post (isActive) stays pinned at top, rest are paginated
    const featuredPost = posts.find((p) => p.isActive) ?? null;
    const restPosts = posts.filter((p) => !p.isActive);

    const totalPages = Math.ceil(restPosts.length / POSTS_PER_PAGE);
    const paginated = restPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

    const goToPage = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[hsl(var(--background))]">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--foreground)/0.4)]" />
        </div>
    );

    return (
        <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

            {/* ── HEADER ── */}
            <header className="max-w-6xl mx-auto px-5 md:px-10 pt-20 md:pt-32 pb-12 md:pb-20">
                <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--foreground)/0.35)] mb-4">
                    Gilbert — Stories
                </p>
                <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-[hsl(var(--ivory))]">
                    Journal
                </h1>
                <div className="mt-6 h-[1px] w-full bg-[hsl(var(--foreground)/0.08)]" />
            </header>

            <section className="max-w-6xl mx-auto px-5 md:px-10 pb-10">

                {/* ── FEATURED / PINNED POST ── */}
                {featuredPost && (
                    <div className="mb-0">
                        <article className="group py-10 md:py-14 border-b border-[hsl(var(--foreground)/0.07)]">
                            <Link href={`/blog/${featuredPost.slug}`} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-10">

                                {/* Image — large */}
                                <div className="md:col-span-6 aspect-[16/9] md:aspect-[4/3] overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--foreground)/0.07)]">
                                    {featuredPost.image ? (
                                        <img
                                            src={featuredPost.image}
                                            alt={featuredPost.title}
                                            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-[1.04] group-hover:scale-100 transition-all duration-700 ease-in-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--foreground)/0.2)]">No image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text */}
                                <div className="md:col-span-6 flex flex-col gap-4">

                                    {/* FEATURED badge */}
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--ivory))] text-[hsl(var(--background))] font-mono text-[9px] uppercase tracking-[0.25em]">
                                            <Pin className="h-2.5 w-2.5" />
                                            Featured
                                        </span>
                                        <div className="h-[1px] flex-1 bg-[hsl(var(--foreground)/0.1)]" />
                                        {featuredPost.publishedAt && (
                                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.4)]">
                                                {new Date(featuredPost.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-[hsl(var(--ivory))] group-hover:text-[hsl(var(--ivory)/0.8)] transition-colors duration-300">
                                        {featuredPost.title}
                                    </h2>

                                    {featuredPost.teaser && (
                                        <div
                                            className="text-[hsl(var(--foreground)/0.55)] leading-relaxed font-serif text-sm md:text-base line-clamp-3 max-w-xl"
                                            dangerouslySetInnerHTML={{ __html: featuredPost.teaser }}
                                        />
                                    )}

                                    <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[hsl(var(--foreground)/0.5)] group-hover:text-[hsl(var(--ivory))] transition-colors mt-1">
                                        Read the article
                                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </div>
                                </div>
                            </Link>
                        </article>
                    </div>
                )}

                {/* ── REMAINING POSTS ── */}
                {paginated.length > 0 ? (
                    <div className="divide-y divide-[hsl(var(--foreground)/0.07)]">
                        {paginated.map((post) => (
                            <article key={post._id} className="group py-10 md:py-14">
                                <Link href={`/blog/${post.slug}`} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-10">

                                    {/* Image — compact */}
                                    <div className="md:col-span-4 aspect-[4/3] overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--foreground)/0.07)]">
                                        {post.image ? (
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-[1.04] group-hover:scale-100 transition-all duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--foreground)/0.2)]">No image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div className="md:col-span-8 flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.4)]">
                                                {post.publishedAt
                                                    ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : 'Journal'}
                                            </span>
                                            <div className="h-[1px] w-8 bg-[hsl(var(--foreground)/0.15)]" />
                                        </div>

                                        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-[0.9] text-[hsl(var(--ivory))] group-hover:text-[hsl(var(--ivory)/0.8)] transition-colors duration-300">
                                            {post.title}
                                        </h2>

                                        {post.teaser && (
                                            <div
                                                className="text-[hsl(var(--foreground)/0.55)] leading-relaxed font-serif text-sm md:text-base line-clamp-2 max-w-2xl"
                                                dangerouslySetInnerHTML={{ __html: post.teaser }}
                                            />
                                        )}

                                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[hsl(var(--foreground)/0.5)] group-hover:text-[hsl(var(--ivory))] transition-colors mt-1">
                                            Read the article
                                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1.5 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : !featuredPost ? (
                    <div className="py-32 text-center border-t border-[hsl(var(--foreground)/0.07)]">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--foreground)/0.25)]">
                            The journal will be updated soon
                        </p>
                    </div>
                ) : null}
            </section>

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
                <div className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-16 border-t border-[hsl(var(--foreground)/0.07)]">
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
                                return (
                                    <span key={p} className="w-9 h-9 flex items-center justify-center font-mono text-[10px] text-[hsl(var(--foreground)/0.25)]">…</span>
                                );
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
                        Page {page} of {totalPages}
                    </p>
                </div>
            )}
        </main>
    );
}