import React from 'react';

const SpaPage = () => {
    // Stier til dine billeder i public-mappen
    const desktopHero = "/images/spa/hero-desktop.jpg";
    const mobileHero = "/images/spa/hero-mobile.jpg";

    return (
        <main className="min-h-screen bg-ivory pb-32"> {/* Ivory Baggrund */}

            {/* Hero Section med Responsive Image Handling */}
            <section className="relative w-full h-[70vh] md:h-[65vh] overflow-hidden border-b border-[#800020]/10">
                <picture>
                    {/* Hvis skærmen er 768px eller bredere, bruges desktop-billedet */}
                    <source media="(min-min-width: 768px)" srcSet={desktopHero} />
                    {/* Som standard (mobil) bruges mobil-billedet */}
                    <img
                        src={mobileHero}
                        alt="Gilbert Spa - Artisanal Tailoring"
                        className="w-full h-full object-cover grayscale-[15%] contrast-[1.05]"
                    />
                </picture>
                <div className="absolute inset-0 bg-[#F9F6F0]/5" />
            </section>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-8 text-center">

                {/* Title Section */}
                <header className="mt-20 md:mt-24 mb-16 md:mb-20">
          <span className="block text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-[#800020]/60 mb-6 font-medium">
            The Art of Garment Healing
          </span>
                    <h1 className="text-4xl md:text-7xl font-serif text-[#800020] leading-tight italic">
                        Gilbert Spa
                    </h1>
                    <div className="w-12 h-[1px] bg-[#800020]/30 mx-auto mt-8" />
                </header>

                {/* Narrative Content */}
                <div className="grid md:grid-cols-2 gap-12 md:gap-16 text-left items-start">
                    <div className="space-y-6 md:space-y-8">
                        <h2 className="text-xl md:text-2xl font-serif text-[#800020] leading-snug">
                            Luxury is not found in the new, but in the cherished.
                        </h2>
                        <p className="font-light leading-relaxed text-[#800020]/80 text-sm md:text-base">
                            The Gilbert Spa is our sanctuary for clothing that has a story to tell.
                            We don’t just repair; we restore the soul of your wardrobe,
                            ensuring that quality craftsmanship survives the test of time.
                        </p>
                    </div>

                    <div className="space-y-6 pt-0 md:pt-16 text-[#800020]/80 font-light leading-relaxed text-sm md:text-base">
                        <p>
                            Our specialists apply artisanal techniques to mend, clean, and
                            reinvigorate your most valued pieces. Every stitch is an act of
                            devotion to the original maker’s intent.
                        </p>
                        <p>
                            To care for what we already own is the most profound expression
                            of style. A celebration of the eternal, and a gift to the future.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <section className="mt-24 md:mt-32 pt-16 md:pt-20 border-t border-[#800020]/10">
                    <p className="font-serif italic text-lg md:text-xl mb-10 text-[#800020]">
                        Give your wardrobe a second life.
                    </p>

                    <a
                        href="mailto:repair@gilbert.dk?subject=Gilbert Spa Inquiry"
                        className="inline-block w-full md:w-auto px-12 py-5 bg-[#800020] text-[#F9F6F0] text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-[#600018] rounded-sm shadow-md"
                    >
                        Contact the Spa
                    </a>

                    <div className="mt-12 space-y-2">
                        <p className="text-[9px] uppercase tracking-[0.4em] text-[#800020]/50">Concierge Service</p>
                        <p className="text-sm font-light text-[#800020]/70">repair@gilbert.dk</p>
                    </div>
                </section>
            </div>

            {/* Vertical Detail Line */}
            <div className="mt-20 flex justify-center hidden md:flex">
                <div className="w-[1px] h-20 bg-gradient-to-b from-[#800020]/20 to-transparent" />
            </div>
        </main>
    );
};

export default SpaPage;