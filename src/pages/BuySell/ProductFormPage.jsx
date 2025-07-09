import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, set, get } from 'firebase/database';
import { auth, db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const ProductFormPage = () => {
  const { productId } = useParams();
  const [form, setForm] = useState({ name: '', price: '', description: '', contact: '', status: 'available' });
  const navigate = useNavigate();
  const uid = auth.currentUser?.uid;
  const { role } = useAuth();

  useEffect(() => {
    if (productId) {
      get(ref(db, `products/${productId}`)).then(snapshot => {
        if (snapshot.exists()) {
          const product = snapshot.val();
          if (product.createdBy === uid || role === 'admin' || role === 'committee') {
            setForm(product);
          } else {
            alert('You are not authorized to edit this product.');
            navigate('/buy-sell');
          }
        }
      });
    }
  }, [productId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, createdBy: uid, updatedAt: Date.now() };
    const refPath = productId ? `products/${productId}` : `products/${Date.now()}`;
    await set(ref(db, refPath), data);
    navigate('/buy-sell');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} className="w-full p-2 border" required />
      <input name="price" placeholder="Price" value={form.price} onChange={handleChange} className="w-full p-2 border" required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full p-2 border" required />
      <input name="contact" placeholder="Contact Info" value={form.contact} onChange={handleChange} className="w-full p-2 border" required />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{productId ? 'Update' : 'Create'} Product</button>
    </form>
  );
};

export default ProductFormPage;