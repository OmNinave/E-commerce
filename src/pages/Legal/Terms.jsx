import React from 'react';
import PageLayout from '../../components/PageLayout';
import { Card } from '../../components/ui/card';

const Terms = () => {
    return (
        <PageLayout
            title="Terms of Service"
            subtitle="Please read these terms carefully before using our services"
        >
            <div className="max-w-4xl mx-auto">
                <Card className="p-8 md:p-12 shadow-lg shadow-indigo-100/50 border-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: November 23, 2025</p>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to ProLab Equipment. By accessing our website and purchasing our products,
                                you agree to be bound by these Terms of Service. These Terms apply to all visitors,
                                users, and others who access or use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
                            <p>
                                You must be at least 18 years old to use this service. You agree not to use
                                our products for any illegal or unauthorized purpose. You must not transmit any worms
                                or viruses or any code of a destructive nature.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Products and Pricing</h2>
                            <p>
                                We reserve the right to modify or discontinue any product at any time.
                                Prices are subject to change without notice. We are not liable for any
                                modifications, price changes, or discontinuance. We verify accurate pricing
                                but errors may occur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Returns and Refunds</h2>
                            <p>
                                Please review our Return Policy. We accept returns within 30 days of purchase
                                for defective items. Shipping costs for returns are the responsibility of the customer
                                unless the item is defective. Custom orders are non-refundable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
                            <p>
                                ProLab Equipment shall not be liable for any direct, indirect, incidental,
                                special, or consequential damages resulting from the use or inability to use
                                our products.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
                            <p>
                                Questions about the Terms of Service should be sent to us at support@prolab.com.
                            </p>
                        </section>
                    </div>
                </Card>
            </div>
        </PageLayout>
    );
};

export default Terms;
