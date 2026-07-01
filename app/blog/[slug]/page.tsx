import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface RelatedProduct {
    _id: string;
    title: string;
    price: number;
    images?: string[];
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, { cache: 'no-store' });
    const result = await res.json();
    const post = result.data;

    if (!post) return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">Post not found</p>
        </div>
    );

    const getProductImageUrl = (img: string | undefined) => {
        if (!img) return '/placeholder.jpg';
        if (img.startsWith('http')) return img;
        if (img.startsWith('/api/images/products/')) return `${baseUrl}${img}`;
        return `${baseUrl}/api/images/products/${img}`;
    };

    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <main className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">

            {/* HERO SECTION */}
            <section className="relative w-full h-[55vh] md:h-[70vh] min-h-[380px] overflow-hidden">
                {post.image ? (
                    <>
                        <Image
                            src={post.image.startsWith('http') ? post.image : `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover brightness-50"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background)/0.3)] to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-[hsl(var(--racing-green-dark))]" />
                )}

                {/* Back link */}
                <div className="absolute top-5 left-5 md:top-8 md:left-8 z-10">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Journal
                    </Link>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-5 md:px-16 pb-8 md:pb-16 max-w-6xl mx-auto w-full">
                    {formattedDate && (
                        <p className="font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-[hsl(var(--ivory)/0.5)] mb-3 md:mb-4">{formattedDate}</p>
                    )}
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-[hsl(var(--ivory))] max-w-4xl">
                        {post.title}
                    </h1>
                </div>
            </section>

            {/* ARTICLE BODY */}
            <article className="max-w-6xl mx-auto px-5 md:px-16 py-10 md:py-20">

                {/* Content */}
                <div
                    className="
                        prose prose-invert max-w-3xl mx-auto mb-16 md:mb-32
                        prose-p:text-[hsl(var(--foreground)/0.75)] prose-p:leading-relaxed prose-p:font-serif prose-p:text-base md:prose-p:text-lg
                        prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[hsl(var(--ivory))]
                        prose-a:text-[hsl(var(--ivory))] prose-a:underline prose-a:underline-offset-4
                        prose-strong:text-[hsl(var(--ivory))]
                        prose-blockquote:border-l-[hsl(var(--ivory)/0.3)] prose-blockquote:text-[hsl(var(--foreground)/0.6)] prose-blockquote:font-serif prose-blockquote:italic
                        prose-img:rounded-none
                    "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* DIVIDER */}
                <div className="flex items-center gap-6 mb-12 md:mb-20 max-w-3xl mx-auto">
                    <div className="h-[1px] flex-1 bg-[hsl(var(--foreground)/0.1)]" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.3)]">Gilbert</span>
                    <div className="h-[1px] flex-1 bg-[hsl(var(--foreground)/0.1)]" />
                </div>

                {/* RELATED PRODUCTS */}
                {post.relatedProducts && post.relatedProducts.length > 0 ? (
                    <section>
                        <div className="text-center mb-8 md:mb-14">
                            <h2 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter text-[hsl(var(--ivory))] mb-2 md:mb-3">
                                Shop the Story
                            </h2>
                            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">
                                {post.relatedProducts.length} {post.relatedProducts.length === 1 ? 'item' : 'items'} featured
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                            {post.relatedProducts.map((product: RelatedProduct) => (
                                <Link href={`/products/${product._id}`} key={product._id} className="group">
                                    <div className="relative aspect-[3/4] mb-2 md:mb-3 bg-[hsl(var(--card))] overflow-hidden border border-[hsl(var(--foreground)/0.08)]">
                                        <Image
                                            src={getProductImageUrl(product.images?.[0])}
                                            alt={product.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-[hsl(var(--background)/0.0)] group-hover:bg-[hsl(var(--background)/0.15)] transition-colors duration-500" />
                                    </div>
                                    <div className="px-1">
                                        <h3 className="font-bold text-[hsl(var(--foreground)/0.9)] text-[11px] uppercase tracking-wide truncate mb-0.5">
                                            {product.title}
                                        </h3>
                                        <p className="text-[10px] text-[hsl(var(--foreground)/0.45)] font-mono">{product.price} DKK</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="py-12 md:py-20 text-center border-t border-[hsl(var(--foreground)/0.08)]">
                        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.25)]">
                            No products featured in this story
                        </p>
                    </div>
                )}

                {/* BACK LINK */}
                <div className="mt-16 md:mt-32 pt-8 md:pt-16 border-t border-[hsl(var(--foreground)/0.08)] flex justify-between items-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.5)] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back to Journal
                    </Link>
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.2)]">Gilbert</span>
                </div>
            </article>
        </main>
    );
}