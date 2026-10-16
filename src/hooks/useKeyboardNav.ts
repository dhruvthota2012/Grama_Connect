import { useEffect } from 'react';

interface KeyMap {
  [key: string]: () => void;
}

export function useKeyboardNav(keyMap: KeyMap, isEnabled: boolean = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if modal dialog is currently open
      if (document.querySelector('.receipt-overlay, .modal-backdrop')) {
        return;
      }

      // Don't trigger if user is typing in an input, textarea, or select
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key;
      const normalizedKey = key.startsWith('Numpad') ? key.replace('Numpad', '') : key;
      if (keyMap[normalizedKey]) {
        event.preventDefault();
        keyMap[normalizedKey]();
      } else if (keyMap[key]) {
        event.preventDefault();
        keyMap[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap, isEnabled]);
}

