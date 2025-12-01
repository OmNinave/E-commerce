import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Reviews = () => {
    const [reviews, setReviews] = useState([
        {
            id: 1,
            productName: 'Precision Digital Balance',
            productImage: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=200',
            rating: 5,
            date: 'Nov 28, 2025',
            comment: 'Excellent precision and very easy to calibrate. Highly recommended for lab use.',
            likes: 12,
            status: 'Published'
        },
        {
            id: 2,
            productName: 'Borosilicate Glass Beaker Set',
            productImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=200',
            rating: 4,
            date: 'Nov 15, 2025',
            comment: 'Good quality glass, but the packaging could be better. One beaker had a minor scratch.',
            likes: 3,
            status: 'Published'
        }
    ]);

    const [pendingReviews, setPendingReviews] = useState([
        {
            id: 101,
            productName: 'Magnetic Stirrer',
            productImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=200',
            date: 'Delivered on Nov 25, 2025'
        }
    ]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    return (
        <PageLayout
            title="My Reviews"
            subtitle="Manage your ratings and reviews"
        >
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Pending Reviews Section */}
                {pendingReviews.length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Waiting for Review</h3>
                        <div className="grid gap-4">
                            {pendingReviews.map((item) => (
                                <Card key={item.id} className="p-4 flex items-center justify-between border-l-4 border-l-indigo-500">
                                    <div className="flex items-center gap-4">
                                        <img src={item.productImage} alt={item.productName} className="w-16 h-16 object-cover rounded-md" />
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                            <p className="text-sm text-gray-500">{item.date}</p>
                                        </div>
                                    </div>
                                    <Button>Write Review</Button>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Past Reviews Section */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Reviews</h3>
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-48 shrink-0">
                                            <img src={review.productImage} alt={review.productName} className="w-full h-32 object-cover rounded-lg mb-2" />
                                            <h4 className="font-medium text-gray-900 text-sm">{review.productName}</h4>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex">{renderStars(review.rating)}</div>
                                                    <span className="text-sm font-medium text-gray-900">{review.rating}.0</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{review.date}</span>
                                            </div>
                                            <p className="text-gray-700 mb-4">{review.comment}</p>

                                            <div className="flex items-center gap-6 text-sm text-gray-500 border-t pt-4">
                                                <div className="flex items-center gap-2">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>{review.likes} Helpful</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>Reply</span>
                                                </div>
                                                <span className="ml-auto px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                                                    {review.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </PageLayout>
    );
};

export default Reviews;
