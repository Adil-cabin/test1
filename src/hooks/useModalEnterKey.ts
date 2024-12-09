import { useEffect } from 'react';

interface UseModalEnterKeyProps {
  isOpen: boolean;
  onEnter: () => void;
  onEscape?: () => void;
}

export function useModalEnterKey({ isOpen, onEnter, onEscape }: UseModalEnterKeyProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onEnter, onEscape]);
}