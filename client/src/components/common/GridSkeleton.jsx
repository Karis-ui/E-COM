import React from "react";
import ProductCardSkeleton from "./ProductCardSkeleton";

const GridSkeleton = ({ count = 12 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(count)].map((_, index) => (
                <ProductCardSkeleton
                    key={`${index}-${index}-${index}`}
                />
            ))}
        </div>
    );
};

export default GridSkeleton;