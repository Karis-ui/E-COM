import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ImageOff } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const FALLBACK = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.main_image || FALLBACK);
  const [imgError, setImgError] = useState(false);

  const discountPercent = product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;
  const finalPrice = product.sale_price || product.regular_price;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`}>
        <div className="relative bg-gray-100 aspect-square">
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            loading="lazy"
          />
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          )}
          {product.is_free_shipping && (
            <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
              Free Shipping
            </span>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-gray-400">{product.brand}</p>

          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-1 h-10">
            {product.name}
          </h3>

          <div className="mt-2">
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(finalPrice)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through ml-2">
                {formatCurrency(product.regular_price)}
              </span>
            )}
          </div>

          {product.average_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium ml-1">{product.average_rating}</span>
              </div>
              <span className="text-xs text-gray-400">
                ({product.total_reviews || 0} sold)
              </span>
            </div>
          )}

          {finalPrice >= 5000 && (
            <p className="text-xs text-green-600 mt-1">Free Shipping</p>
          )}
        </div>
      </Link>

      {isHovered && (
        <button className="absolute bottom-3 right-3 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:bg-primary-700 transition transform hover:scale-105">
          <ShoppingCart className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ProductCard;