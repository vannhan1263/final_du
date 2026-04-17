import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bouquet, setBouquet] = useState([]);   // [{ flowerDef, rotation }]
  const [counts, setCounts]   = useState({});   // { id -> count }
  const [photoDataURL, setPhotoDataURL] = useState(null);
  const [recipient, setRecipient] = useState('Khách');

  const addFlower = (flowerDef) => {
    const rotation = (Math.random() * 26 - 13).toFixed(1);
    setBouquet(prev => [...prev, { flowerDef, rotation }]);
    setCounts(prev => ({ ...prev, [flowerDef.id]: (prev[flowerDef.id] || 0) + 1 }));
  };

  const resetBouquet = () => {
    setBouquet([]);
    setCounts({});
  };

  return (
    <AppContext.Provider value={{
      bouquet,
      counts,
      addFlower,
      resetBouquet,
      photoDataURL, setPhotoDataURL,
      recipient, setRecipient
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
