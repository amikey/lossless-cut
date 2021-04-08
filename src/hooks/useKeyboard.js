import { useEffect } from 'react';

// mousetrap seems to be the only lib properly handling layouts that require shift to be pressed to get a particular key #520
// Also document.addEventListener needs custom handling of modifier keys or C will be triggered by CTRL+C, etc
import Mousetrap from 'mousetrap';

const keyupActions = ['seekBackwards', 'seekForwards'];

export default ({ keyBindings, onKeyPress }) => {
  useEffect(() => {
    const mousetrap = new Mousetrap();

    keyBindings.forEach(({ action, keys }) => {
      mousetrap.bind(keys, () => onKeyPress({ action }));

      if (keyupActions.includes(action)) {
        mousetrap.bind(keys, () => onKeyPress({ action, keyup: true }), 'keyup');
      }
    });

    return () => mousetrap.reset();
  }, [keyBindings, onKeyPress]);
};
