import { useEffect } from 'react';

const useSmoothScrollToTop = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []); 
};

export default useSmoothScrollToTop;