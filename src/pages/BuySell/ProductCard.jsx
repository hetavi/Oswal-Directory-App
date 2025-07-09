import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ref, remove } from 'firebase/database';
import { db, auth } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const { role } = useAuth();
  const uid = auth.currentUser?.uid;
  const navigate = useNavigate();

  const canEdit = role === 'admin' || role === 'committee' || product.createdBy === uid;

  const handleDelete = async () => {
    const confirm = window.confirm('Are you sure you want to delete this product?');
    if (!confirm) return;

    try {
      await remove(ref(db, `products/${product.id}`));
      alert('Product deleted.');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete product.');
    }
  };

  return (
    <div className="border p-4 rounded shadow relative">
      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-gray-600">Price: ₹{product.price}</p>
      <p className="text-sm mb-2">{product.description}</p>

      <Link to={`/buy-sell/${product.id}`} className="text-blue-600 underline text-sm block mb-2">
        View
      </Link>

      {canEdit && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => navigate(`/buy-sell/${product.id}/edit`)}
            className="bg-yellow-500 text-white px-2 py-1 text-sm rounded hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-2 py-1 text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;