import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Microscope,
    GraduationCap,
    Factory,
    Heart,
    ArrowRight,
    CheckCircle,
    TrendingUp,
    Users,
    Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import PageLayout from '../components/PageLayout';

export default function Solutions() {
    const navigate = useNavigate();

    const solutions = [
        {
            icon: Microscope,
            title: 'Research & Development',
            description: 'Advanced equipment for cutting-edge scientific research',
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
            features: [
                'High-precision analytical instruments',
                'Customizable research setups',
                'Data integration capabilities',
                'Expert technical support'
            ],
            stats: { labs: '200+', projects: '1000+' },
            color: 'indigo'
        },
        {
            icon: GraduationCap,
            title: 'Educational Institutions',
            description: 'Comprehensive lab solutions for schools and universities',
            image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
            features: [
                'Student-friendly equipment',
                'Safety-certified apparatus',
                'Curriculum-aligned solutions',
                'Training and workshops'
            ],
            stats: { schools: '150+', students: '50K+' },
            color: 'blue'
        },
        {
            icon: Factory,
            title: 'Industrial Quality Control',
            description: 'Reliable testing equipment for manufacturing excellence',
            image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
            features: [
                'ISO-compliant testing tools',
                'Automated quality systems',
                'Real-time monitoring',
                'Compliance documentation'
            ],
            stats: { industries: '100+', tests: '1M+' },
            color: 'orange'
        },
        {
            icon: Heart,
            title: 'Healthcare & Diagnostics',
            description: 'Precision instruments for medical laboratories',
            image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=800',
            features: [
                'Clinical-grade accuracy',
                'FDA-approved equipment',
                'Patient safety protocols',
                'Rapid diagnostic tools'
            ],
            stats: { clinics: '80+', patients: '100K+' },
            color: 'pink'
        }
    ];

    const caseStudies = [
        {
            company: 'National Research Institute',
            industry: 'Research',
            challenge: 'Needed high-precision equipment for quantum physics research',
            solution: 'Provided custom-calibrated spectrometers and environmental control systems',
            result: '40% increase in research accuracy, 3 published papers in Nature',
            image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400'
        },
        {
            company: 'State University',
            industry: 'Education',
            challenge: 'Modernize chemistry labs for 500+ students',
            solution: 'Complete lab renovation with safety-certified equipment and digital integration',
            result: '95% student satisfaction, 30% improvement in practical exam scores',
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400'
        },
        {
            company: 'PharmaTech Industries',
            industry: 'Manufacturing',
            challenge: 'Ensure consistent quality control across production lines',
            solution: 'Automated testing systems with real-time data analytics',
            result: '99.9% quality compliance, 50% reduction in testing time',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400'
        }
    ];

    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        pink: 'bg-pink-50 text-pink-600 border-pink-100'
    };

    return (
        <PageLayout
            title="Solutions"
            subtitle="Tailored laboratory solutions for every industry"
        >
            <div className="max-w-7xl mx-auto space-y-24">

                {/* Hero Section */}
                <section className="text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                            Solutions Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Your Success</span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            From research labs to industrial facilities, we provide specialized equipment and support
                            tailored to your unique needs.
                        </p>
                    </motion.div>
                </section>

                {/* Solutions Grid */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {solutions.map((solution, index) => {
                        const Icon = solution.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-none shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden h-full">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={solution.image}
                                            alt={solution.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[solution.color]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h3>
                                        <p className="text-gray-600 mb-4">{solution.description}</p>

                                        <div className="space-y-2 mb-6">
                                            {solution.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                                            {Object.entries(solution.stats).map(([key, value], idx) => (
                                                <div key={idx} className="flex-1">
                                                    <div className="text-2xl font-bold text-indigo-600">{value}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </section>

                {/* Case Studies */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            See how ProLab has helped organizations achieve their goals with our tailored solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {caseStudies.map((study, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow h-full">
                                    <div className="relative h-40 overflow-hidden rounded-t-xl">
                                        <img
                                            src={study.image}
                                            alt={study.company}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Award className="w-4 h-4 text-indigo-600" />
                                            <span className="text-xs font-semibold text-indigo-600 uppercase">{study.industry}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">{study.company}</h3>

                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-1">Challenge:</p>
                                                <p className="text-gray-600">{study.challenge}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-700 mb-1">Solution:</p>
                                                <p className="text-gray-600">{study.solution}</p>
                                            </div>
                                            <div className="pt-3 border-t border-gray-100">
                                                <div className="flex items-start gap-2">
                                                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <p className="text-gray-900 font-medium">{study.result}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
                    <Users className="w-16 h-16 mx-auto mb-6 text-indigo-400" />
                    <h2 className="text-3xl font-bold mb-4">Let's Build Your Solution Together</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Every organization is unique. Our team of experts will work with you to design a
                        customized solution that meets your specific requirements and budget.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/contact-sales')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-xl"
                        >
                            Schedule Consultation <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            onClick={() => navigate('/products')}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 h-12 px-8 rounded-xl"
                        >
                            Browse Products
                        </Button>
                    </div>
                </section>

            </div>
        </PageLayout>
    );
}
