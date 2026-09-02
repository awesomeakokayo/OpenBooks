"use client";

import { createContext, useContext, useMemo, useState } from "react";

const NAV_SCROLL_KEY = "openbooks:workspace-nav-scroll";

type WorkspaceNavigationStateValue = {
  scrollTop: number;
  setScrollTop: (value: number) => void;
};

const WorkspaceNavigationStateContext = createContext<WorkspaceNavigationStateValue | null>(null);

function readStoredScrollTop() {
  if (typeof window === "undefined") return 0;
  const value = Number(window.sessionStorage.getItem(NAV_SCROLL_KEY) ?? "0");
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function WorkspaceNavigationStateProvider({ children }: { children: React.ReactNode }) {
  const [scrollTop, setScrollTopState] = useState(readStoredScrollTop);

  const setScrollTop = (value: number) => {
    const next = Number.isFinite(value) && value >= 0 ? value : 0;
    setScrollTopState(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(NAV_SCROLL_KEY, String(next));
    }
  };

  const value = useMemo(() => ({ scrollTop, setScrollTop }), [scrollTop]);

  return (
    <WorkspaceNavigationStateContext.Provider value={value}>
      {children}
    </WorkspaceNavigationStateContext.Provider>
  );
}

export function useWorkspaceNavigationState() {
  const context = useContext(WorkspaceNavigationStateContext);
  if (!context) {
    throw new Error("useWorkspaceNavigationState must be used inside WorkspaceNavigationStateProvider");
  }
  return context;
}
