import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Eco-Sentinel - Privacy Policy',
    description: 'Eco-Sentinel AI Defense Systems Privacy Policy',
};

export default function PrivacyPolicy() {
    return (
        <main>
            <section className="relative pt-32 pb-20 overflow-hidden min-h-screen">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#05080a]/80 z-10 hero-pattern"></div>
                    <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>
                </div>
                <div className="relative z-20 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-6">Privacy Policy</h1>

                    <div className="glass-panel p-8 rounded-xl space-y-6 text-slate-400 leading-relaxed">
                        <p className="text-sm">Last Updated: December 20, 2025</p>

                        <h2 className="text-xl font-bold text-white mt-8">1. Introduction</h2>
                        <p>
                            Eco-Sentinel AI Defense Systems ("we," "us," or "our") operates the Eco-Sentinel platform. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">2. Data Collection</h2>
                        <p>
                            We collect several different types of information for various purposes to provide and improve our Service to you.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data").</li>
                            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data").</li>
                            <li><strong>Environmental Data:</strong> We aggregate and analyze public air quality data (e.g., OpenAQ) and satellite imagery.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-white mt-8">3. Use of Data</h2>
                        <p>Eco-Sentinel uses the collected data for various purposes:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To provide and maintain the Service</li>
                            <li>To notify you about changes to our Service</li>
                            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                            <li>To provide customer care and support</li>
                            <li>To provide analysis or valuable information so that we can improve the Service</li>
                        </ul>

                        <h2 className="text-xl font-bold text-white mt-8">4. Security</h2>
                        <p>
                            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                        </p>

                        <h2 className="text-xl font-bold text-white mt-8">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us by email: privacy@guardian-ai.com
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
