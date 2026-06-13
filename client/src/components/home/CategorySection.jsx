import React from 'react';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import {Smartphone, Laptop, Tablet, Headphones, Watch,Camera,Gamepad2,Tv,Speaker} from 'lucide-react';

const categories =[
    {name:"Smartphones",icon:<Smartphone className='w-6 h-6'/>,color:'from-blue-500 to-blue-700',path:'/shop?category=smartphones'},
    {name:"Laptops",icon:<Laptop className='w-6 h-6'/>,color:'from-green-500 to-green-700',path:'/shop?category=laptops'},
    {name:"Tablets",icon:<Tablet className='w-6 h-6'/>,color:'from-yellow-500 to-yellow-700',path:'/shop?category=tablets'},
    {name:"Headphones",icon:<Headphones className='w-6 h-6'/>,color:'from-purple-500 to-purple-700',path:'/shop?category=headphones'},
    {name:"Watches",icon:<Watch className='w-6 h-6'/>,color:'from-pink-500 to-pink-700',path:'/shop?category=watches'},
    {name:"Cameras",icon:<Camera className='w-6 h-6'/>,color:'from-red-500 to-red-700',path:'/shop?category=cameras'},
    {name:"Gaming",icon:<Gamepad2 className='w-6 h-6'/>,color:'from-indigo-500 to-indigo-700',path:'/shop?category=gaming'},
    {name:"Televisions",icon:<Tv className='w-6 h-6'/>,color:'from-gray-500 to-gray-700',path:'/shop?category=televisions'},
    {name:"Speakers",icon:<Speaker className='w-6 h-6'/>,color:'from-orange-500 to-orange-700',path:'/shop?category=speakers'},
];

const CategorySection = () => {
    return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 bg-clip-text text-transparent mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Explore our wide range of premium electronics
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <Link to={category.path} className="block">
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;