// File: src/pages/BuySell/BuySellListPage.jsx
import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const BuySellListPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await get(ref(db, 'products'));
      const data = snapshot.val() || {};
      setProducts(Object.entries(data).map(([id, value]) => ({ id, ...value })));
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Buy & Sell</h2>
        <div className="space-x-2">
          <Link
            to="/buy-sell/my"
            className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300"
          >
            My Products
          </Link>
          <Link
            to="/buy-sell/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BuySellListPage;
