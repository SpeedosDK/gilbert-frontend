'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";
import CustomDropdown from "@/app/components/UI/CustomDropdown";
import { AlertCircle, Package, Loader2, CheckCircle2 } from "lucide-react";

const API_URL = '';

type DropdownItem = { _id: string; name?: string; label?: string; value?: string };

export default function EditProduct() {
    const { id } = useParams();
    const router = useRouter();

    const [categories, setCategories] = useState<DropdownItem[]>([]);
    const [subcategories, setSubcategories] = useState<DropdownItem[]>([]);
    const [brands, setBrands] = useState<DropdownItem[]>([]);
    const [genders, setGenders] = useState<DropdownItem[]>([]);
    const [sizes, setSizes] = useState<DropdownItem[]>([]);
    const [conditions, setConditions] = useState<DropdownItem[]>([]);
    const [colors, setColors] = useState<DropdownItem[]>([]);
    const [materials, setMaterials] = useState<DropdownItem[]>([]);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [description, setDescription] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedCondition, setSelectedCondition] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [isLargeItem, setIsLargeItem] = useState(false);
    const [weight, setWeight] = useState<number>(1000);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const [loadingProduct, setLoadingProduct] = useState(true);
    const [loadingForm, setLoadingForm] = useState(false);
    const [staticLoaded, setStaticLoaded] = useState(false);

    const isGenderDisabled = useMemo(() => {
        const categoryObj = categories.find(c => c._id === selectedCategory);
        const name = (categoryObj?.name || categoryObj?.label || "").toLowerCase();
        return ['furniture', 'møbler', 'home', 'interior'].some(n => name === n);
    }, [selectedCategory, categories]);

    // Load static dropdown data
    useEffect(() => {
        async function loadStatic() {
            const endpoints: Record<string, string> = {
                category: `${API_URL}/api/categories`,
                brand: `${API_URL}/api/brands`,
                gender: `${API_URL}/api/genders`,
                condition: `${API_URL}/api/conditions`,
                color: `${API_URL}/api/colors`,
                material: `${API_URL}/api/materials`,
            };
            await Promise.all(Object.entries(endpoints).map(async ([field, url]) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (field === "category") setCategories(data);
                    else if (field === "brand") setBrands(data);
                    else if (field === "gender") setGenders(data);
                    else if (field === "condition") setConditions(data);
                    else if (field === "color") setColors(data);
                    else if (field === "material") setMaterials(data);
                } catch { /* ignore */ }
            }));
            setStaticLoaded(true);
        }
        loadStatic();
    }, []);

    // Load product data – only after static dropdowns are ready so pre-selection works
    useEffect(() => {
        if (!staticLoaded || !id) return;

        async function loadProduct() {
            try {
                const res = await api(`/api/products/${id}`);
                if (!res.ok) { router.push("/"); return; }
                const data = await res.json();
                const p = data.product ?? data.data ?? (data._id ? data : null);
                if (!p) { router.push("/"); return; }

                setTitle(p.title ?? "");
                setPrice(String(p.price ?? ""));
                setOriginalPrice(p.originalPrice ? String(p.originalPrice) : "");
                setDescription(p.description ?? "");
                setWeight(p.weight ?? 1000);
                setIsLargeItem(p.isLargeItem ?? false);
                setExistingImages(p.images ?? []);
                setSelectedCategory(p.category?._id ?? p.category ?? "");
                setSelectedBrand(p.brand?._id ?? p.brand ?? "");
                setSelectedGender(p.gender?._id ?? p.gender ?? "");
                setSelectedCondition(p.condition?._id ?? p.condition ?? "");
                setSelectedColor(p.color?._id ?? p.color ?? "");
                setSelectedMaterial(p.material?._id ?? p.material ?? "");
                setSelectedSize(p.size?._id ?? p.size ?? "");
                setSelectedSubcategory(p.subcategory?._id ?? p.subcategory ?? "");
            } catch {
                router.push("/");
            } finally {
                setLoadingProduct(false);
            }
        }
        loadProduct();
    }, [staticLoaded, id, router]);

    // Load subcategories when category/gender changes
    useEffect(() => {
        async function loadSubcategories() {
            if (!selectedCategory) { setSubcategories([]); return; }
            try {
                const genderItem = genders.find(g => g._id === selectedGender);
                const genderName = genderItem?.name || "";
                let url = `${API_URL}/api/subcategories?category=${selectedCategory}`;
                if (genderName) url += `&gender=${encodeURIComponent(genderName)}`;
                const res = await fetch(url);
                if (res.ok) setSubcategories(await res.json());
            } catch { /* ignore */ }
        }
        loadSubcategories();
    }, [selectedGender, selectedCategory, genders]);

    // Load sizes when category changes
    useEffect(() => {
        async function loadSizes() {
            if (!selectedCategory) { setSizes([]); return; }
            try {
                const res = await fetch(`${API_URL}/api/sizes?category=${selectedCategory}`);
                if (res.ok) setSizes(await res.json());
            } catch { /* ignore */ }
        }
        loadSizes();
    }, [selectedCategory]);

    const handleCategoryChange = (val: string) => {
        setSelectedCategory(val);
        const categoryObj = categories.find(c => c._id === val);
        const name = (categoryObj?.name || categoryObj?.label || "").toLowerCase();
        if (['furniture', 'møbler', 'home', 'interior'].some(n => name === n)) {
            setSelectedGender("");
            setIsLargeItem(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let finalGender = selectedGender;
        if (isGenderDisabled) {
            const fallback = genders.find(g =>
                ["unisex", "none", "alle", "other"].some(word => g.name?.toLowerCase().includes(word))
            );
            if (fallback) finalGender = fallback._id;
        }

        if (!selectedCategory || !selectedSubcategory || !selectedBrand || !selectedCondition || !selectedColor || !selectedMaterial || !finalGender) {
            alert("Please fill out all required fields marked with *");
            return;
        }

        setLoadingForm(true);

        const body: Record<string, unknown> = {
            title,
            price: Number(price),
            description,
            category: selectedCategory,
            subcategory: selectedSubcategory,
            brand: selectedBrand,
            gender: finalGender,
            condition: selectedCondition,
            color: selectedColor,
            material: selectedMaterial,
            weight,
            isLargeItem,
        };
        if (selectedSize) body.size = selectedSize;
        if (originalPrice) body.originalPrice = Number(originalPrice);

        try {
            const res = await api(`/api/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                alert("Error: " + (data.error || data.message || JSON.stringify(data.errors)));
                setLoadingForm(false);
                return;
            }

            router.push(`/products/${id}`);
        } catch {
            alert("A server error occurred.");
            setLoadingForm(false);
        }
    };

    const mapOptions = (arr: DropdownItem[]) => arr.map(o => ({ _id: o._id, label: o.name || o.label || o.value || "" }));

    if (loadingProduct) {
        return (
            <div className="max-w-3xl mx-auto p-8 mt-10 flex items-center justify-center min-h-[40vh]">
                <Loader2 className="animate-spin text-racing-green" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8 bg-ivory-dark shadow-2xl mt-10 mb-32 rounded-[2rem] text-racing-green">
            <h1 className="text-3xl font-serif font-black mb-8 border-b border-racing-green/10 pb-4 italic uppercase tracking-tight">Edit Listing</h1>

            {existingImages.length > 0 && (
                <div className="mb-6">
                    <p className="font-bold mb-3 uppercase text-[10px] tracking-widest opacity-60">Current Images</p>
                    <div className="flex gap-4 flex-wrap">
                        {existingImages.map((src, i) => (
                            <img key={i} src={src} className="w-20 h-20 object-cover rounded-xl border border-racing-green/10" alt={`Image ${i + 1}`} />
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Title *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl focus:ring-2 focus:ring-racing-green focus:outline-none text-black font-medium" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Category *</label>
                        <CustomDropdown options={mapOptions(categories)} value={selectedCategory} onChange={handleCategoryChange} placeholder="Select category" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Gender {isGenderDisabled ? '(N/A)' : '*'}</label>
                        <CustomDropdown options={mapOptions(genders)} value={selectedGender} onChange={setSelectedGender} placeholder={isGenderDisabled ? "Not applicable" : "Select gender"} disabled={isGenderDisabled} />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Subcategory *</label>
                        <CustomDropdown options={mapOptions(subcategories)} value={selectedSubcategory} onChange={setSelectedSubcategory} placeholder="Select subcategory" disabled={!selectedCategory} />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Brand *</label>
                        <CustomDropdown options={mapOptions(brands)} value={selectedBrand} onChange={setSelectedBrand} placeholder="Search brand" searchable />
                    </div>
                </div>

                <div className="bg-racing-green/[0.03] p-6 rounded-2xl border border-racing-green/10 space-y-6">
                    <div className="flex items-center gap-2">
                        <Package size={16} className="text-racing-green" />
                        <h3 className="font-black uppercase text-[10px] tracking-[0.2em]">Shipping & Dimensions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-bold mb-1 uppercase text-[9px] tracking-widest opacity-50">Weight (grams) *</label>
                            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} required className="w-full p-3 bg-ivory border border-racing-green/10 rounded-xl text-black font-mono text-sm" />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="sr-only" checked={isLargeItem} onChange={(e) => setIsLargeItem(e.target.checked)} />
                                <div className={`w-10 h-6 rounded-full transition-colors ${isLargeItem ? 'bg-racing-green' : 'bg-gray-300'}`}></div>
                                <span className="font-bold uppercase text-[10px] tracking-widest ml-2">Oversized / Furniture</span>
                            </label>
                        </div>
                    </div>
                    {isLargeItem && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <AlertCircle className="text-amber-600 shrink-0" size={18} />
                            <p className="text-[10px] text-amber-900 leading-relaxed uppercase font-bold tracking-tight">
                                Large item: Standard shipping is disabled. Pickup or manual delivery only.
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Condition *</label>
                        <CustomDropdown options={mapOptions(conditions)} value={selectedCondition} onChange={setSelectedCondition} placeholder="Select condition" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Color *</label>
                        <CustomDropdown options={mapOptions(colors)} value={selectedColor} onChange={setSelectedColor} placeholder="Select color" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Material *</label>
                        <CustomDropdown options={mapOptions(materials)} value={selectedMaterial} onChange={setSelectedMaterial} placeholder="Select material" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Size (Optional)</label>
                        <CustomDropdown options={mapOptions(sizes)} value={selectedSize} onChange={setSelectedSize} placeholder="Select size" disabled={!selectedCategory || sizes.length === 0} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Price (DKK) *</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-2xl text-2xl font-black text-black" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Original Price (DKK, optional)</label>
                        <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full p-4 bg-ivory border border-racing-green/10 rounded-2xl text-2xl font-black text-black" />
                    </div>
                </div>

                <div>
                    <label className="block font-bold mb-1 uppercase text-[10px] tracking-widest opacity-60">Description *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-2xl h-32 text-black" />
                </div>

                <button type="submit" disabled={loadingForm} className="w-full bg-racing-green text-ivory py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    {loadingForm ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Save Changes</>}
                </button>
            </form>
        </div>
    );
}
