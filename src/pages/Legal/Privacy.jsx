import React from 'react';
import '../../styles/Legal.css';

const Privacy = () => {
    return (
        <div className="legal-container">
            <div className="legal-content">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last Updated: November 23, 2025</p>

                <section>
                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        make a purchase, or contact us for support. This includes your name, email address,
                        shipping address, and payment information.
                    </p>
                </section>

                <section>
                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to process your orders, communicate with you,
                        and improve our services. We may also use your email to send you promotional
                        offers, which you can opt-out of at any time.
                    </p>
                </section>

                <section>
                    <h2>3. Information Sharing</h2>
                    <p>
                        We do not sell your personal information. We may share your information with
                        third-party service providers who help us operate our business, such as payment
                        processors and shipping partners.
                    </p>
                </section>

                <section>
                    <h2>4. Data Security</h2>
                    <p>
                        We implement reasonable security measures to protect your personal information.
                        However, no method of transmission over the Internet is 100% secure.
                    </p>
                </section>

                <section>
                    <h2>5. Cookies</h2>
                    <p>
                        We use cookies to enhance your browsing experience and analyze site traffic.
                        You can control cookies through your browser settings.
                    </p>
                </section>

                <section>
                    <h2>6. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@prolab.com.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
