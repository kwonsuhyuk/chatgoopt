import { useEffect, useRef } from "react";

const useLazyImageLoading = (items) => {
  const imageRefs = useRef({});

  const handleScroll = () => {
    for (const itemId in imageRefs.current) {
      const imageRef = imageRefs.current[itemId];
      if (imageRef) {
        const rect = imageRef.getBoundingClientRect();
        if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
          imageRef.src = imageRef.dataset.src;
          delete imageRefs.current[itemId];
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getItemRef = (itemId) => (element) => {
    if (element) {
      imageRefs.current[itemId] = element;
    }
  };

  return getItemRef;
};

export default useLazyImageLoading;
