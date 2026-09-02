"use client";

import { createContext, useContext, useMemo, useRef } from "react";

const NAV_SCROLL_KEY = "openbooks:workspace-nav-scroll";

type WorkspaceNavigationStateValue = {
  getScrollTop: () => number;
  setScrollTop: (value: number) => void;
};

const WorkspaceNavigationStateContext = createContext<WorkspaceNavigationStateValue | null>(null);

function readStoredScrollTop() {
  if (typeof window === "undefined") return 0;
  const value = Number(window.sessionStorage.getItem(NAV_SCROLL_KEY) ?? "0");
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function WorkspaceNavigationStateProvider({ children }: { children: React.ReactNode }) {
  const scrollTopRef = useRef<number | null>(null);

  const value = useMemo<WorkspaceNavigationStateValue>(() => ({
    getScrollTop: () => {
      if (scrollTopRef.current === null) scrollTopRef.current = readStoredScrollTop();
      return scrollTopRef.current;
    },
    setScrollTop: (value: number) => {
      const next = Number.isFinite(value) && value >= 0 ? value : 0;
      scrollTopRef.current = next;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(NAV_SCROLL_KEY, String(next));
      }
    },
  }), []);

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
