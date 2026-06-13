import React from 'react';
import {motion} from 'framer-motion';
import {Truck,Shield,Headphones,RefreshCw,CreditCard,Award,Clock,Package} from 'lucide-react';

const features = [
    {
        icon:Truck,
        title:"Fast Nationwide Delivery",
        description:"Get your electronics delivered to your doorstep anywhere in Kenya with our reliable shipping partners.",
        color:'from-blue-500 to-blue-700',
    },
    {
        icon:Shield,
        title:"Secure Payments && Quality Assurance",
        description:"Shop with confidence using our secure payment methods.",
        color:'from-green-500 to-green-700',
    },
    {
        icon:Headphones,
        title:"24/7 Customer Support",
        description:"Our friendly support team is here to assist you anytime.",
        color:'from-purple-500 to-purple-700',
    },
    {
        icon:RefreshCw,
        title:"Easy Returns && Hassle-Free Refunds",
        description:"Not satisfied? Enjoy easy returns and quick refunds on eligible products.",
        color:'from-orange-500 to-orange-700',
    },
    {
        icon:CreditCard,
        title:"Multiple Payment Options",
        description:"Choose from various payment methods that suit your needs.",
        color:'from-pink-500 to-pink-700',
    },
    {
        icon:Award,
        title:"Best Price Guarantee",
        description:"Find a better price? We’ll match it with our price match guarantee.",
        color:'from-yellow-500 to-yellow-700',
    },
    {
        icon:Clock,
        title:"Latest Models && Exclusive Deals",
        description:"Stay ahead with the newest electronics and exclusive offers.",
        color:'from-teal-500 to-teal-700',
    },
    {
        icon:Package,
        title:"Premium Packaging",
        description:"Your products are carefully packed to ensure they arrive safely and in perfect condition. Free delivery on orders over KSh 3,000.",
        color:'from-indigo-500 to-indigo-700',
    },
];

const FeatureSection = () => {
    return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;