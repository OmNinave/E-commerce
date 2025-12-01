import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Card } from '../../components/ui/card';

const Privacy = () => {
    return (
        <PageLayout
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your data"
        >
            <div className="max-w-4xl mx-auto">
                <Card className="p-8 md:p-12 shadow-lg shadow-indigo-100/50 border-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: November 23, 2025</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, such as when you create an account,
                                make a purchase, or contact us for support. This includes your name, email address,
                                shipping address, and payment information. We also automatically collect certain
                                information about your device and usage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to process your orders, communicate with you,
                                and improve our services. We may also use your email to send you promotional
                                offers, which you can opt-out of at any time. We analyze usage data to optimize
                                our website performance.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                            <p>
                                We do not sell your personal information. We may share your information with
                                third-party service providers who help us operate our business, such as payment
                                processors and shipping partners. These partners are bound by confidentiality agreements.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                            <p>
                                We implement reasonable security measures to protect your personal information,
                                including encryption and secure socket layer (SSL) technology. However, no method
                                of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cookies</h2>
                            <p>
                                We use cookies to enhance your browsing experience and analyze site traffic.
                                You can control cookies through your browser settings. Essential cookies are
                                required for the website to function properly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at privacy@prolab.com.
                            </p>
                        </section>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default Privacy;
