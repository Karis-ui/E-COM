import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const carouselItems = [
        {
            id: 1,
            title: 'iPhone 15 Pro Max',
            category: 'Mobile Phones',
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop',
            price: 'KSh 299,999',
            originalPrice: 'KSh 349,999',
            discount: '-14%',
            tag: 'Hot Pick',
            rating: 4.9,
            sold: '1.2k'
        },
        {
            id: 2,
            title: 'Samsung Galaxy S24',
            category: 'Mobile Phones',
            image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
            price: 'KSh 219,999',
            originalPrice: 'KSh 259,999',
            discount: '-15%',
            tag: 'Trending',
            rating: 4.8,
            sold: '892'
        },
        {
            id: 3,
            title: 'Google Pixel 8 Pro',
            category: 'Mobile Phones',
            image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop',
            price: 'KSh 134,999',
            originalPrice: 'KSh 154,999',
            discount: '-13%',
            tag: 'New',
            rating: 4.7,
            sold: '567'
        },
        {
            id: 4,
            title: 'MacBook Pro M3',
            category: 'Laptops',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
            price: 'KSh 429,999',
            originalPrice: 'KSh 489,999',
            discount: '-12%',
            tag: 'Hot Pick',
            rating: 4.9,
            sold: '567'
        },
        {
            id: 5,
            title: 'Dell XPS 15',
            category: 'Laptops',
            image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
            price: 'KSh 269,999',
            originalPrice: 'KSh 289,999',
            discount: '-7%',
            tag: 'Sale',
            rating: 4.7,
            sold: '345'
        },
        {
            id: 6,
            title: 'ASUS ROG Zephyrus',
            category: 'Gaming Laptops',
            image: 'https://images.unsplash.com/photo-1593642702909-dec73df255d7?w=300&h=300&fit=crop',
            price: 'KSh 199,999',
            originalPrice: 'KSh 239,999',
            discount: '-17%',
            tag: 'Gaming',
            rating: 4.8,
            sold: '678'
        },
        {
            id: 7,
            title: 'Sony WH-1000XM5',
            category: 'Audio',
            image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop',
            price: 'KSh 44,999',
            originalPrice: 'KSh 54,999',
            discount: '-18%',
            tag: 'Limited',
            rating: 4.8,
            sold: '2.3k'
        },
        {
            id: 8,
            title: 'Apple AirPods Pro 2',
            category: 'Audio',
            image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
            price: 'KSh 39,999',
            originalPrice: 'KSh 49,999',
            discount: '-20%',
            tag: 'Best Seller',
            rating: 4.8,
            sold: '3.1k'
        },
        {
            id: 9,
            title: 'Bose QC Ultra',
            category: 'Audio',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
            price: 'KSh 54,999',
            originalPrice: 'KSh 64,999',
            discount: '-15%',
            tag: 'New',
            rating: 4.7,
            sold: '890'
        },
        {
            id: 10,
            title: 'Apple Watch Ultra 2',
            category: 'Wearables',
            image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
            price: 'KSh 109,999',
            originalPrice: 'KSh 129,999',
            discount: '-15%',
            tag: 'Hot Pick',
            rating: 4.9,
            sold: '789'
        },
        {
            id: 11,
            title: 'Samsung Galaxy Watch 6',
            category: 'Wearables',
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&fit=crop',
            price: 'KSh 49,999',
            originalPrice: 'KSh 59,999',
            discount: '-17%',
            tag: 'Trending',
            rating: 4.7,
            sold: '1.2k'
        },
        {
            id: 12,
            title: 'Garmin Fenix 7X',
            category: 'Wearables',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
            price: 'KSh 79,999',
            originalPrice: 'KSh 94,999',
            discount: '-16%',
            tag: 'Premium',
            rating: 4.8,
            sold: '456'
        },
        {
            id: 13,
            title: 'iPad Pro 12.9"',
            category: 'Tablets',
            image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
            price: 'KSh 174,999',
            originalPrice: 'KSh 199,999',
            discount: '-12%',
            tag: 'Hot Pick',
            rating: 4.8,
            sold: '1.1k'
        },
        {
            id: 14,
            title: 'Samsung Tab S9 Ultra',
            category: 'Tablets',
            image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop',
            price: 'KSh 154,999',
            originalPrice: 'KSh 179,999',
            discount: '-14%',
            tag: 'New',
            rating: 4.7,
            sold: '678'
        },
        {
            id: 15,
            title: 'Meta Quest 3',
            category: 'VR',
            image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=300&h=300&fit=crop',
            price: 'KSh 69,999',
            originalPrice: 'KSh 84,999',
            discount: '-18%',
            tag: 'Limited',
            rating: 4.8,
            sold: '234'
        }
    ];

    const itemsPerView = 3;
    const totalSlides = Math.ceil(carouselItems.length / itemsPerView); // 5 slides
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 2000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, currentSlide]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToSlide = (slideIndex) => {
        setCurrentSlide(slideIndex);
    };

    const getVisibleProducts = () => {
        const startIndex = currentSlide * itemsPerView;
        return carouselItems.slice(startIndex, startIndex + itemsPerView);
    };
    const handleManualNavigation = (callback) => {
        setIsAutoPlaying(false);
        callback();
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const visibleProducts = getVisibleProducts();

    return (
        <div className="w-full">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-semibold text-gray-800">Hot Picks</span>
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Limited Time</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleManualNavigation(prevSlide)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={() => handleManualNavigation(nextSlide)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500 ease-in-out"
                    >
                        {visibleProducts.map((product, idx) => (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                style={{
                                    animation: `fadeIn 0.5s ease-in-out ${idx * 0.1}s both`
                                }}
                            >
                                <div className="relative">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                                    />
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                        {product.discount}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                                        {product.tag}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                                        🔥 {product.sold} sold
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-xs text-gray-400 mb-1">{product.category}</div>
                                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">{product.title}</h3>

                                    <div className="flex items-center gap-1 mb-2">
                                        <div className="flex text-yellow-400 text-xs">
                                            {'★'.repeat(Math.floor(product.rating))}
                                            {'☆'.repeat(5 - Math.floor(product.rating))}
                                        </div>
                                        <span className="text-xs text-gray-500">({product.rating})</span>
                                    </div>

                                    <div className="mt-2">
                                        <span className="text-lg font-bold text-red-600">{product.price}</span>
                                        <span className="text-xs text-gray-400 line-through ml-2">{product.originalPrice}</span>
                                    </div>
                                    <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleManualNavigation(() => goToSlide(idx))}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx
                                ? 'bg-orange-500 w-6'
                                : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full -ml-20 -mb-20"></div>

                <div className="relative z-10 flex flex-wrap justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">New Experience</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">VR Electronics Showroom</h3>
                        <p className="text-blue-100 mb-4">Experience products in 3D before you buy</p>
                        <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition">
                            Explore Now
                        </button>
                    </div>

                    <div className="hidden md:flex gap-2">
                        {carouselItems.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">More to Love</h3>
                    <button className="text-orange-500 text-sm hover:underline">View All →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {carouselItems.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-lg p-2 hover:shadow-lg transition cursor-pointer">
                            <img src={item.image} alt={item.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                            <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-bold text-red-600">{item.price}</span>
                                <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default Carousel;