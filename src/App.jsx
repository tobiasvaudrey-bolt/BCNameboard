import { useState, useEffect, useCallback } from 'react';
import { parseHash, buildHash } from './hash';
import { resolveTheme, saveTheme, applyThemeToDOM } from './themes';
import { useOrientation } from './useOrientation';
import { InputScreen } from './InputScreen';
import { DisplayScreen } from './DisplayScreen';
import { Toast } from './Toast';

function getMode(name, orientation, forceDisplay) {
  if (forceDisplay && name) return 'display';
  if (!name) return 'input';
  if (orientation === 'portrait') return 'input';
  return 'display';
}

export default function App() {
  const orientation = useOrientation();

  const [state, setAppState] = useState(() => {
    const { name, theme } = parseHash(window.location.hash);
    const resolved = resolveTheme(theme);
    return {
      name: name || null,
      theme: resolved,
      forceDisplay: false,
    };
  });

  const mode = getMode(state.name, orientation, state.forceDisplay);

  const syncHash = useCallback((name, theme) => {
    const expected = buildHash(name, theme);
    if (window.location.hash !== expected) {
      history.replaceState(null, '', expected);
    }
  }, []);

  useEffect(() => {
    syncHash(state.name, state.theme);
    applyThemeToDOM(state.theme);
    saveTheme(state.theme);
  }, [state.name, state.theme, syncHash]);

  useEffect(() => {
    if (state.forceDisplay && orientation === 'landscape') {
      setAppState((s) => ({ ...s, forceDisplay: false }));
    }
  }, [orientation, state.forceDisplay]);

  useEffect(() => {
    function onHashChange() {
      const { name, theme } = parseHash(window.location.hash);
      const resolved = resolveTheme(theme);
      setAppState((prev) => ({
        ...prev,
        name: name || null,
        theme: resolved,
        forceDisplay: false,
      }));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleSubmit(name) {
    setAppState({ name, theme: state.theme, forceDisplay: true });
  }

  function handleThemeChange(theme) {
    setAppState((s) => ({ ...s, theme }));
  }

  function handleEdit() {
    setAppState((s) => ({ ...s, forceDisplay: false }));
  }

  return (
    <>
      <Toast />
      <DisplayScreen
        name={state.name || ''}
        theme={state.theme}
        active={mode === 'display'}
        onThemeChange={handleThemeChange}
        onEdit={handleEdit}
      />
      <InputScreen
        name={state.name}
        theme={state.theme}
        active={mode === 'input'}
        onSubmit={handleSubmit}
        onThemeChange={handleThemeChange}
      />
    </>
  );
}
