import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Award,
    Users,
    Target,
    Zap,
    Globe,
    ShieldCheck,
    TrendingUp,
    Heart,
    Microscope,
    Building2,
    Mail,
    Phone,
    MapPin,
    ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import PageLayout from '../components/PageLayout';

export default function About() {
    const navigate = useNavigate();

    const values = [
        {
            icon: Target,
            title: 'Precision First',
            description: 'Every instrument meets the highest standards of accuracy and reliability.',
            color: 'indigo'
        },
        {
            icon: Heart,
            title: 'Customer Focused',
            description: 'Your success is our priority. We provide dedicated support at every step.',
            color: 'pink'
        },
        {
            icon: Zap,
            title: 'Innovation Driven',
            description: 'Constantly evolving to bring you the latest in laboratory technology.',
            color: 'yellow'
        },
        {
            icon: ShieldCheck,
            title: 'Quality Assured',
            description: 'ISO-certified processes ensure consistent excellence in every product.',
            color: 'green'
        }
    ];

    const milestones = [
        { year: '2015', event: 'ProLab Founded', description: 'Started with a vision to revolutionize lab equipment' },
        { year: '2017', event: '100+ Labs Served', description: 'Reached our first major milestone' },
        { year: '2019', event: 'ISO 9001 Certified', description: 'Achieved international quality certification' },
        { year: '2021', event: 'Global Expansion', description: 'Extended services to 15+ countries' },
        { year: '2023', event: '500+ Partners', description: 'Trusted by leading research institutions worldwide' },
        { year: '2024', event: 'Innovation Award', description: 'Recognized for contribution to scientific advancement' }
    ];

    const stats = [
        { value: '500+', label: 'Labs Trusted Us', icon: Building2 },
        { value: '2000+', label: 'Products Delivered', icon: Microscope },
        { value: '15+', label: 'Countries Served', icon: Globe },
        { value: '24/7', label: 'Expert Support', icon: Users }
    ];

    return (
        <PageLayout
            title="About ProLab"
            subtitle="Pioneering excellence in laboratory equipment since 2015"
        >
            <div className="max-w-7xl mx-auto space-y-24">

                {/* Hero Section with Image */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold">
                            <Award className="w-4 h-4" />
                            Award-Winning Excellence
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            Empowering Scientific <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Discovery</span>
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            At ProLab, we understand that precision is the heartbeat of every experiment.
                            Since our inception in 2015, we have been dedicated to bridging the gap between
                            cutting-edge technology and practical laboratory needs.
                        </p>
                        <p className="text-gray-600">
                            Our mission is simple: equip researchers, educators, and industry professionals
                            with the tools they need to push the boundaries of science and innovation.
                        </p>
                        <Button
                            onClick={() => navigate('/contact-sales')}
                            className="bg-gray-900 hover:bg-indigo-600 text-white h-12 px-8 rounded-xl"
                        >
                            Get in Touch <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full -z-10"></div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-100 rounded-full -z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800"
                            alt="Modern Laboratory"
                            className="rounded-3xl shadow-2xl w-full object-cover h-[500px]"
                        />
                        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg max-w-xs">
                            <div className="flex items-center gap-3 mb-2">
                                <Award className="w-8 h-8 text-indigo-600" />
                                <span className="font-bold text-gray-900">Excellence Award 2024</span>
                            </div>
                            <p className="text-xs text-gray-600">Recognized for contribution to scientific infrastructure development.</p>
                        </div>
                    </motion.div>
                </section>

                {/* Statistics */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-6 text-center border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <Icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </section>

                {/* Core Values */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            These principles guide everything we do, from product selection to customer service.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => {
                            const Icon = value.icon;
                            const colorClasses = {
                                indigo: 'bg-indigo-50 text-indigo-600',
                                pink: 'bg-pink-50 text-pink-600',
                                yellow: 'bg-yellow-50 text-yellow-600',
                                green: 'bg-green-50 text-green-600'
                            };
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[value.color]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                                        <p className="text-sm text-gray-600">{value.description}</p>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Timeline */}
                <section className="bg-gray-50 rounded-3xl p-8 md:p-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            From a small startup to a trusted global partner in laboratory excellence.
                        </p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-8">
                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                            {milestone.year}
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white rounded-xl p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.event}</h3>
                                        <p className="text-gray-600">{milestone.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Partner with Us?</h2>
                    <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Join 500+ research facilities using ProLab equipment to drive the next generation of scientific discovery.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/products')}
                            className="bg-white text-indigo-600 hover:bg-gray-100 h-12 px-8 rounded-xl"
                        >
                            Browse Products
                        </Button>
                        <Button
                            onClick={() => navigate('/contact-sales')}
                            variant="outline"
                            className="border-white text-white hover:bg-white/10 h-12 px-8 rounded-xl"
                        >
                            Contact Sales
                        </Button>
                    </div>
                </section>

            </div>
        </PageLayout>
    );
}
