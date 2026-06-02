'use client';

import { useState, useEffect, use } from "react";
import { api } from "@/app/api/api";
import ProductPicker from "@/app/components/admin/ProductPicker";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Loader2, Pin } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

export default function EditBlogPost({ params }: Props) {
    const router = useRouter();
    const resolvedParams = use(params);
    const postId = resolvedParams.id;
    const baseUrl = "http://localhost:3000";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchPost() {
            try {
                const res = await api(`/api/blogs/admin/id/${postId}`);
                const result = await res.json();
                if (result.success && result.data) {
                    const post = result.data;
                    setTitle(post.title || "");
                    setContent(post.content || "");
                    setIsActive(post.isActive || false);
                    if (post.image) {
                        const cleanPath = post.image.startsWith('/') ? post.image : `/${post.image}`;
                        setPreviewUrl(post.image.startsWith('http') ? post.image : `${baseUrl}${cleanPath}`);
                    }
                    setSelectedProductIds(post.relatedProducts?.map((p: any) => p._id || p.id) || []);
                }
            } catch (err) {
                console.error("Error fetching blog post:", err);
            } finally {
                setLoading(false);
            }
        }
        if (postId) fetchPost();
    }, [postId, baseUrl]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("isActive", String(isActive));
        formData.append("relatedProducts", JSON.stringify(selectedProductIds));
        if (image) formData.append("image", image);

        try {
            const res = await api(`/api/blogs/${postId}`, { method: "PUT", body: formData });
            if (res.ok) {
                router.push("/admin/blog");
                router.refresh();
            } else {
                const errData = await res.json();
                alert("Error: " + (errData.error || "Something went wrong"));
            }
        } catch (err) {
            console.error("Submit error:", err);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--foreground)/0.4)]" />
                <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.3)]">Loading post…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
            <div className="max-w-4xl mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-24">

                {/* ── HEADER ── */}
                <header className="pb-8 mb-10 border-b border-[hsl(var(--foreground)/0.08)]">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--ivory))] transition-colors mb-6"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </button>
                    <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[hsl(var(--foreground)/0.35)] mb-3">Admin — Journal</p>
                    <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] text-[hsl(var(--ivory))]">
                        Edit Post
                    </h1>
                </header>

                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* ── TITLE ── */}
                    <div className="space-y-2">
                        <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">
                            Headline
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Post title…"
                            required
                            className="w-full bg-transparent border-b border-[hsl(var(--foreground)/0.15)] focus:border-[hsl(var(--ivory))] outline-none py-3 text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[hsl(var(--ivory))] placeholder:text-[hsl(var(--foreground)/0.2)] transition-colors"
                        />
                    </div>

                    {/* ── COVER IMAGE ── */}
                    <div className="space-y-3">
                        <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">
                            Cover Image
                        </label>
                        <div className="flex flex-col sm:flex-row gap-5 p-5 border border-[hsl(var(--foreground)/0.1)] hover:border-[hsl(var(--foreground)/0.25)] transition-colors">
                            {/* Preview */}
                            <div className="flex-shrink-0 w-full sm:w-40 h-40 bg-[hsl(var(--card))] border border-[hsl(var(--foreground)/0.08)] overflow-hidden">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-[hsl(var(--foreground)/0.2)]">No image</span>
                                    </div>
                                )}
                            </div>
                            {/* Upload */}
                            <div className="flex flex-col justify-center gap-3">
                                <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--foreground)/0.2)] text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.5)] font-mono text-[10px] uppercase tracking-[0.25em] cursor-pointer transition-all">
                                    <Upload className="h-3.5 w-3.5" />
                                    Choose file
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setImage(file);
                                                setPreviewUrl(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </label>
                                <p className="font-mono text-[9px] text-[hsl(var(--foreground)/0.25)] uppercase tracking-wider">
                                    Recommended: 1200×800px · Max 5 MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── CONTENT ── */}
                    <div className="space-y-3">
                        <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">
                            Content <span className="normal-case tracking-normal opacity-50">(HTML allowed)</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your story here…"
                            required
                            rows={16}
                            className="w-full bg-[hsl(var(--card))] border border-[hsl(var(--foreground)/0.1)] focus:border-[hsl(var(--foreground)/0.35)] outline-none p-5 text-[hsl(var(--foreground)/0.8)] font-mono text-sm leading-relaxed placeholder:text-[hsl(var(--foreground)/0.2)] transition-colors resize-y"
                        />
                    </div>

                    {/* ── DIVIDER ── */}
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] flex-1 bg-[hsl(var(--foreground)/0.08)]" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.25)]">Settings</span>
                        <div className="h-[1px] flex-1 bg-[hsl(var(--foreground)/0.08)]" />
                    </div>

                    {/* ── FEATURED TOGGLE ── */}
                    <div
                        onClick={() => setIsActive(!isActive)}
                        className={`flex items-start gap-5 p-5 border cursor-pointer transition-all ${
                            isActive
                                ? "border-[hsl(var(--ivory)/0.4)] bg-[hsl(var(--ivory)/0.04)]"
                                : "border-[hsl(var(--foreground)/0.1)] hover:border-[hsl(var(--foreground)/0.25)]"
                        }`}
                    >
                        {/* Custom checkbox */}
                        <div className={`flex-shrink-0 w-5 h-5 border mt-0.5 flex items-center justify-center transition-all ${
                            isActive ? "bg-[hsl(var(--ivory))] border-[hsl(var(--ivory))]" : "border-[hsl(var(--foreground)/0.3)]"
                        }`}>
                            {isActive && (
                                <svg className="w-3 h-3 text-[hsl(var(--background))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Pin className="h-3 w-3 text-[hsl(var(--ivory)/0.6)]" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(var(--ivory))]">
                                    Feature on homepage
                                </span>
                            </div>
                            <p className="font-mono text-[9px] text-[hsl(var(--foreground)/0.4)] leading-relaxed">
                                Activating this will replace the current featured post.
                            </p>
                        </div>
                    </div>

                    {/* ── PRODUCT PICKER ── */}
                    <div className="space-y-3">
                        <label className="font-mono text-[9px] uppercase tracking-[0.4em] text-[hsl(var(--foreground)/0.4)]">
                            Related Products
                        </label>
                        <div className="border border-[hsl(var(--foreground)/0.1)] overflow-hidden">
                            <ProductPicker
                                selectedIds={selectedProductIds}
                                onSelectionChange={setSelectedProductIds}
                            />
                        </div>
                    </div>

                    {/* ── ACTIONS ── */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[hsl(var(--foreground)/0.08)]">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] inline-flex items-center justify-center gap-2 px-8 py-4 bg-[hsl(var(--ivory))] text-[hsl(var(--background))] font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-[hsl(var(--ivory-dark))] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-8 py-4 border border-[hsl(var(--foreground)/0.15)] text-[hsl(var(--foreground)/0.5)] font-mono text-[10px] uppercase tracking-[0.3em] hover:text-[hsl(var(--ivory))] hover:border-[hsl(var(--foreground)/0.4)] transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
