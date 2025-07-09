import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
  const { productId } = useParams();
  // Fetch product by ID if needed
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">Product Detail: {productId}</h2>
    </div>
  );
};

export default ProductDetailPage;