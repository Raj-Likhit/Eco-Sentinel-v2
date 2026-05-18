import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Eco-Sentinel - Contact Us',
    description: 'Get in touch with the Guardian team',
};

export default function Contact() {
    return (
        <main>
            <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[#05080a]/80 z-10 hero-pattern"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>
                </div>
                <div className="relative z-20 max-w-5xl mx-auto px-6 w-full">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Have questions about Eco-Sentinel? Interested in deploying our AI forensics system? Reach out to our team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-accent-green/30 transition-colors">
                                <div className="bg-accent-green/10 p-3 rounded-lg text-accent-green">
                                    <span className="material-symbols-outlined">location_on</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Headquarters</h3>
                                    <p className="text-slate-400">Vibranium Mine<br />Wakanda</p>
                                </div>
                            </div>
                            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-primary/30 transition-colors">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <span className="material-symbols-outlined">mail</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Email Us</h3>
                                    <p className="text-slate-400">Tchalla@wokandaforever.com</p>
                                    <p className="text-slate-400">WhiteWolf@Wakanda.com</p>
                                </div>
                            </div>
                            <div className="glass-panel p-6 rounded-xl flex items-start gap-4 hover:border-accent-amber/30 transition-colors">
                                <div className="bg-accent-amber/10 p-3 rounded-lg text-accent-amber">
                                    <span className="material-symbols-outlined">call</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Call Us</h3>
                                    <p className="text-slate-400">+1 (555) 123-4567</p>
                                    <p className="text-slate-500 text-sm mt-1">Mon-Fri, 9am - 6pm PST</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="glass-panel p-8 rounded-xl border-t-4 border-accent-green">
                            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">First Name</label>
                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all placeholder-white/20" placeholder="Jane" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Last Name</label>
                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all placeholder-white/20" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                                    <input type="email" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all placeholder-white/20" placeholder="jane@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                                    <select className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all">
                                        <option>General Inquiry</option>
                                        <option>Demo Request</option>
                                        <option>Partnership</option>
                                        <option>Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                                    <textarea rows={4} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/50 transition-all placeholder-white/20" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="button" className="w-full bg-accent-green text-black font-bold py-4 rounded-lg hover:bg-neon-green transition-colors shadow-glow-green mt-2">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
