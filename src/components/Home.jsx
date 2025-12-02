import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    ShieldCheck,
    Truck,
    Zap,
    Award,
    Microscope,
    FlaskConical,
    Atom
} from 'lucide-react';
import { Button } from './ui/button';
import ProductCardProfessional from './ProductCardProfessional';
import { products } from '../data/products';
import '../styles/Home.css';

const Home = () => {
    const navigate = useNavigate();
    const featuredProducts = products.slice(0, 3);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* 🚀 HERO SECTION: Split Screen & Immersive */}
            <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Typography & Actions */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-8 z-10"
                        >
                            <motion.div variants={itemVariants}>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase border border-indigo-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                    The Future of Science
                                </span>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
                            >
                                Precision <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                    In Motion.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-lg text-gray-500 max-w-lg leading-relaxed"
                            >
                                Equipping the world's leading research facilities with state-of-the-art instruments.
                                Experience the next generation of laboratory excellence.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/products')}
                                    className="h-14 px-8 rounded-full bg-gray-900 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-200/50 transition-all duration-300 hover:scale-105"
                                >
                                    Explore Catalog <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate('/solutions')}
                                    className="h-14 px-8 rounded-full border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all duration-300"
                                >
                                    View Solutions
                                </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-8 flex items-center gap-8 border-t border-gray-100">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">500+</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Labs Trusted</div>
                                </div>
                                <div className="w-px h-10 bg-gray-200"></div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">Expert Support</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: 3D Floating Elements (Hidden on Mobile for cleaner look) */}
                        <div className="hidden lg:flex relative z-0 lg:h-[600px] items-center justify-center">
                            {/* Main Floating Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative z-20 bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl shadow-indigo-100/50 max-w-md w-full"
                            >
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                            <Microscope className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">ProLab Series X</div>
                                            <div className="text-xs text-gray-500">Optical Precision</div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">In Stock</span>
                                </div>

                                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden group">
                                    <img
                                        src="https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=400"
                                        alt="ProLab Microscope"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-semibold text-gray-900">Advanced Optics</span>
                                        <span className="text-sm font-bold text-indigo-600">₹2,48,156</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full w-4/5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                                        </div>
                                        <span className="text-xs text-gray-500">80% sold</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Decorative Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 z-10"
                            >
                                <FlaskConical className="w-8 h-8 text-pink-500" />
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 30, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 left-0 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 z-30"
                            >
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                                <div className="text-xs font-bold text-gray-900 mt-1">ISO 9001</div>
                            </motion.div>

                            {/* Background Blobs (Subtle) */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🌐 AVAILABLE ON PLATFORMS */}
            <section className="py-10 border-b border-gray-100 bg-gray-50/30">
                <div className="container mx-auto px-4 max-w-7xl text-center">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                        You can also checkout our products on
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
                        {['Amazon', 'Flipkart', 'IndiaMart'].map((platform) => (
                            <motion.div
                                key={platform}
                                whileHover={{ scale: 1.05, color: '#4F46E5' }}
                                className="text-xl md:text-2xl font-bold text-gray-400 cursor-pointer transition-colors"
                            >
                                {platform}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🏢 ABOUT PROLAB */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full -z-10"></div>
                            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full -z-10"></div>
                            <img
                                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800"
                                alt="Modern Laboratory"
                                className="rounded-3xl shadow-2xl w-full object-cover h-[500px]"
                            />
                            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-xs">
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-8 h-8 text-indigo-600" />
                                    <span className="font-bold text-gray-900">Excellence Award</span>
                                </div>
                                <p className="text-xs text-gray-600">Recognized for contribution to scientific infrastructure development.</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                                Empowering Discovery Through <span className="text-indigo-600">Innovation</span>
                            </h2>
                            <p className="text-lg text-gray-500 leading-relaxed">
                                At ProLab, we understand that precision is the heartbeat of every experiment.
                                Since our inception, we have been dedicated to bridging the gap between cutting-edge technology and practical laboratory needs.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Certified Quality</h4>
                                        <p className="text-sm text-gray-500">All equipment meets international safety and calibration standards.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Microscope className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Advanced Technology</h4>
                                        <p className="text-sm text-gray-500">Partnering with top manufacturers to bring you the latest innovations.</p>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/about')}
                                className="rounded-full px-8 border-gray-300 hover:border-indigo-600 hover:text-indigo-600"
                            >
                                Learn More About Us
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🍱 BENTO GRID: Why Choose Us */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Engineered for Excellence</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            We don't just sell equipment. We provide the infrastructure for breakthrough discoveries.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Large Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 border border-gray-100 relative overflow-hidden group transition-all duration-300"
                        >
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Quality Assurance</h3>
                                    <p className="text-gray-500 max-w-md">
                                        Every piece of equipment undergoes rigorous ISO-standard testing before it reaches your lab.
                                        Zero compromise on precision.
                                    </p>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-indigo-50 to-transparent rounded-tl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                        </motion.div>

                        {/* Tall Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:row-span-2 bg-gray-900 rounded-3xl p-10 shadow-xl hover:shadow-2xl hover:shadow-indigo-900/20 text-white relative overflow-hidden flex flex-col justify-between transition-all duration-300"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Next-Day Delivery</h3>
                                <p className="text-gray-400">
                                    Global logistics network ensuring your critical supplies arrive exactly when you need them.
                                </p>
                            </div>
                            <div className="relative z-10 mt-8">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-mono text-gray-300">LIVE TRACKING</span>
                                    </div>
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-indigo-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Abstract Map Pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        </motion.div>

                        {/* Medium Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-3xl p-10 shadow-sm hover:shadow-xl hover:shadow-green-100/50 border border-gray-100 flex flex-col justify-center items-center text-center group transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">5-Year Warranty</h3>
                            <p className="text-sm text-gray-500 mt-2">Comprehensive coverage included.</p>
                        </motion.div>

                        {/* Medium Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-indigo-600 rounded-3xl p-10 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-white flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-300"
                        >
                            <div className="relative z-10">
                                <h3 className="text-4xl font-bold mb-1">24/7</h3>
                                <p className="text-indigo-100 font-medium">Expert Support</p>
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 💎 FEATURED COLLECTION: Horizontal Scroll */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Curated Collection</h2>
                            <p className="text-gray-500">Hand-picked instruments for modern laboratories.</p>
                        </div>
                        <Button variant="ghost" onClick={() => navigate('/products')} className="group">
                            View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredProducts.map((product) => (
                            <ProductCardProfessional key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="bg-gray-900 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Ready to upgrade your lab?
                            </h2>
                            <p className="text-gray-400 text-lg">
                                Join 500+ research facilities using ProLab equipment to drive the next generation of scientific discovery.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/products')}
                                    className="h-14 px-8 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                                >
                                    Start Shopping
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate('/contact-sales')}
                                    className="h-14 px-8 rounded-full border-gray-700 text-gray-300 hover:border-white hover:text-white"
                                >
                                    Contact Sales
                                </Button>
                            </div>
                        </div>

                        {/* Background Glows */}
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
