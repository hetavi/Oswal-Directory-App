// context/FamilyContext.jsx
import React, { createContext, useContext } from 'react';
import useFamilySync from '../hooks/useFamilySync';

const FamilyContext = createContext();

export const FamilyProvider = ({ children }) => {
  const { families, setFamilies, loading } = useFamilySync();

  return (
    <FamilyContext.Provider value={{ families, setFamilies, loading }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => useContext(FamilyContext);
