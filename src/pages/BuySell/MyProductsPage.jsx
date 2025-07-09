import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db, auth } from '../../firebase';
import ProductCard from './ProductCard';

const MyProductsPage = () => {
  const [myProducts, setMyProducts] = useState([]);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await get(ref(db, 'products'));
      const all = snapshot.val() || {};
      const filtered = Object.entries(all)
        .filter(([_, p]) => p.createdBy === uid)
        .map(([id, data]) => ({ id, ...data }));
      setMyProducts(filtered);
    };
    fetch();
  }, [uid]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myProducts.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
};

export default MyProductsPage;