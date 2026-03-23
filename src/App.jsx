import { useState, useEffect, useCallback } from 'react';
import { parseHash, buildHash } from './hash';
import { resolveTheme, saveTheme, applyThemeToDOM } from './themes';
import { useOrientation } from './useOrientation';
import { InputScreen } from './InputScreen';
import { DisplayScreen } from './DisplayScreen';
import { Toast } from './Toast';

function getMode(name, forceDisplay, forceInput) {
  if (forceInput) return 'input';
  if (forceDisplay && name) return 'display';
  if (!name) return 'input';
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
      forceInput: false,
    };
  });

  const mode = getMode(state.name, state.forceDisplay, state.forceInput);

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
        forceInput: false,
      }));
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function handleSubmit(name) {
    setAppState({ name, theme: state.theme, forceDisplay: true, forceInput: false });
  }

  function handleEdit() {
    setAppState((s) => ({ ...s, forceDisplay: false, forceInput: true }));
  }

  return (
    <>
      <Toast />
      <DisplayScreen
        name={state.name || ''}
        theme={state.theme}
        active={mode === 'display'}
        onEdit={handleEdit}
      />
      <InputScreen
        name={state.name}
        theme={state.theme}
        active={mode === 'input'}
        onSubmit={handleSubmit}
      />
    </>
  );
}
