import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Eco-Sentinel - Terms of Service',
    description: 'Eco-Sentinel AI Defense Systems Terms of Service',
};

export default function TermsOfService() {
    return (
        <main>
            <section className="relative pt-32 pb-20 overflow-hidden min-h-screen">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#05080a]/80 z-10 hero-pattern"></div>
                    <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>
                </div>
                <div className="relative z-20 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-6">Terms of Service</h1>

                    <div className="glass-panel p-8 rounded-xl space-y-6 text-slate-400 leading-relaxed">
                        <p className="text-sm">Last Updated: December 20, 2025</p>

                        <h2 className="text-xl font-bold text-white mt-8">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the Eco-Sentinel platform, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily access the materials (information or software) on Eco-Sentinel's website for personal, non-commercial transitory viewing only.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">3. Disclaimer</h2>
                        <p>
                            The materials on Eco-Sentinel's website are provided on an 'as is' basis. Eco-Sentinel makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">4. Limitations</h2>
                        <p>
                            In no event shall Eco-Sentinel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Eco-Sentinel's website.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">5. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">6. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at: legal@guardian-ai.com
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
