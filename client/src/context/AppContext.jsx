import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [bouquet, setBouquet] = useState([]);   // [{ itemDef, x, y, rotation, scale }]
  const [counts, setCounts]   = useState({});   // { id -> count }
  const [photoDataURL, setPhotoDataURL] = useState(null);
  const [recipient, setRecipient] = useState('Khách');
  const [photoEditorActive, setPhotoEditorActive] = useState(false);

  const addBouquetItem = (itemDef, position = { x: 50, y: 40 }) => {
    const randomRotation = itemDef.group === 'bow'
      ? Math.random() * 16 - 8
      : Math.random() * 22 - 11;
    const baseScale = itemDef.group === 'leaf' ? 0.9 : 1;

    setBouquet(prev => [...prev, {
      itemDef,
      x: Number(position.x),
      y: Number(position.y),
      rotation: Number(randomRotation.toFixed(1)),
      scale: baseScale
    }]);
    setCounts(prev => ({ ...prev, [itemDef.id]: (prev[itemDef.id] || 0) + 1 }));
  };

  // Backward-compatible alias for existing components.
  const addFlower = (flowerDef, position) => addBouquetItem(flowerDef, position);

  const resetBouquet = () => {
    setBouquet([]);
    setCounts({});
  };

  return (
    <AppContext.Provider value={{
      bouquet,
      counts,
      addBouquetItem,
      addFlower,
      resetBouquet,
      photoDataURL, setPhotoDataURL,
      recipient, setRecipient,
      photoEditorActive, setPhotoEditorActive
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
