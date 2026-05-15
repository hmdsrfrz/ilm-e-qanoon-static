// src/store/uiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UiState {
  sidebarOpen:      boolean;
  setSidebarOpen:   (open: boolean) => void;
  toggleSidebar:    () => void;
  selectedDocIds:   string[];
  setSelectedDocIds:(ids: string[]) => void;
  toggleDocId:      (id: string) => void;
  selectAllDocs:    () => void;
  theme:            'dark' | 'light';
  setTheme:         (theme: 'dark' | 'light') => void;
  
  // Constitutional Redesign: Transition State
  hasEnteredApp:         boolean;
  enterApp:              () => void;
  returnToLanding:       () => void;

  // Document viewer overlay
  documentViewerOpen:    boolean;
  openDocumentViewer:    () => void;
  closeDocumentViewer:   () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // ✅ CLOSED by default — user must explicitly open it
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      selectedDocIds: [],
      setSelectedDocIds: (ids) => set({ selectedDocIds: ids }),
      toggleDocId: (id) =>
        set((s) => ({
          selectedDocIds: s.selectedDocIds.includes(id)
            ? s.selectedDocIds.filter((d) => d !== id)
            : [...s.selectedDocIds, id],
        })),
      selectAllDocs: () => set({ selectedDocIds: [] }),
      
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Constitutional Redesign: NEVER persist hasEnteredApp
      hasEnteredApp: false,
      enterApp: () => set({ hasEnteredApp: true }),
      returnToLanding: () => set({ hasEnteredApp: false }),

      documentViewerOpen: false,
      openDocumentViewer:  () => set({ documentViewerOpen: true }),
      closeDocumentViewer: () => set({ documentViewerOpen: false }),
    }),
    {
      name: 'pk-ui-store',
      storage: createJSONStorage(() => sessionStorage),
      // Part E: UI preferences (sidebar open/closed state) should NOT persist across reloads
      // hasEnteredApp is also NOT persisted (intentionally omitted from partialize)
      partialize: (state) => ({ 
        theme: state.theme,
      }),
    }
  )
);
