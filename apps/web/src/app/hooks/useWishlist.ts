import { useState, useEffect } from 'react';

const KEY = 'nftforge_wishlist';

function load(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function useWishlist() {
  const [ids, setIds] = useState<number[]>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = (id: number) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isWishlisted = (id: number) => ids.includes(id);

  return { ids, toggle, isWishlisted, count: ids.length };
}
