import { Routes, Route } from 'react-router-dom';
import FamilyList from '../components/families/FamilyList';
import FamilyForm from '../components/families/FamilyForm';

const FamiliesPage = () => {
  return (
    <Routes>
      <Route index element={<FamilyList />} />
      <Route path="new" element={<FamilyForm />} />
      <Route path="edit/:id" element={<FamilyForm />} />
    </Routes>
  );
};

export default FamiliesPage;