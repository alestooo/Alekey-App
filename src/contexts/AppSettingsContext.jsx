import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const AppSettingsContext =
  createContext(null);

const STORAGE_KEY =
  "alekey-app-settings";

const DEFAULT_SETTINGS = {
  theme: "light",
  salesPerPage: 12,
  foldersPerPage: 12,
  inventoryPerPage: 20,
};

const VALID_OPTIONS = {
  salesPerPage: [
    10,
    12,
    15,
  ],

  foldersPerPage: [
    6,
    9,
    12,
  ],

  inventoryPerPage: [
    12,
    20,
    28,
  ],
};

const getInitialSettings =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return DEFAULT_SETTINGS;
    }

    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        );

      if (!saved) {
        return DEFAULT_SETTINGS;
      }

      return {
        theme: [
          "light",
          "dark",
          "system",
        ].includes(
          saved.theme
        )
          ? saved.theme
          : DEFAULT_SETTINGS.theme,

        salesPerPage:
          VALID_OPTIONS.salesPerPage.includes(
            Number(
              saved.salesPerPage
            )
          )
            ? Number(
                saved.salesPerPage
              )
            : DEFAULT_SETTINGS.salesPerPage,

        foldersPerPage:
          VALID_OPTIONS.foldersPerPage.includes(
            Number(
              saved.foldersPerPage
            )
          )
            ? Number(
                saved.foldersPerPage
              )
            : DEFAULT_SETTINGS.foldersPerPage,

        inventoryPerPage:
          VALID_OPTIONS.inventoryPerPage.includes(
            Number(
              saved.inventoryPerPage
            )
          )
            ? Number(
                saved.inventoryPerPage
              )
            : DEFAULT_SETTINGS.inventoryPerPage,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  };

export function SettingsProvider({
  children,
}) {
  const [
    settings,
    setSettings,
  ] = useState(
    getInitialSettings
  );

  const [
    resolvedTheme,
    setResolvedTheme,
  ] = useState(
    "light"
  );

  /*
   * ========================================
   * GUARDAR PREFERENCIAS
   * ========================================
   */

  useLayoutEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        settings
      )
    );
  }, [
    settings,
  ]);

  /*
   * ========================================
   * APLICAR TEMA
   * ========================================
   */

  useLayoutEffect(() => {
    const root =
      document.documentElement;

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const applyTheme =
      () => {
        const dark =
          settings.theme ===
            "dark" ||
          (settings.theme ===
            "system" &&
            media.matches);

        root.classList.toggle(
          "dark",
          dark
        );

        root.dataset.theme =
          dark
            ? "dark"
            : "light";

        root.style.colorScheme =
          dark
            ? "dark"
            : "light";

        setResolvedTheme(
          dark
            ? "dark"
            : "light"
        );
      };

    applyTheme();

    if (
      settings.theme ===
      "system"
    ) {
      media.addEventListener(
        "change",
        applyTheme
      );
    }

    return () => {
      media.removeEventListener(
        "change",
        applyTheme
      );
    };
  }, [
    settings.theme,
  ]);

  /*
   * ========================================
   * SETTERS
   * ========================================
   */

  const setTheme =
    (theme) => {
      if (
        ![
          "light",
          "dark",
          "system",
        ].includes(
          theme
        )
      ) {
        return;
      }

      setSettings(
        (previous) => ({
          ...previous,
          theme,
        })
      );
    };

  const setSalesPerPage =
    (value) => {
      const number =
        Number(value);

      if (
        !VALID_OPTIONS.salesPerPage.includes(
          number
        )
      ) {
        return;
      }

      setSettings(
        (previous) => ({
          ...previous,
          salesPerPage:
            number,
        })
      );
    };

  const setFoldersPerPage =
    (value) => {
      const number =
        Number(value);

      if (
        !VALID_OPTIONS.foldersPerPage.includes(
          number
        )
      ) {
        return;
      }

      setSettings(
        (previous) => ({
          ...previous,
          foldersPerPage:
            number,
        })
      );
    };

  const setInventoryPerPage =
    (value) => {
      const number =
        Number(value);

      if (
        !VALID_OPTIONS.inventoryPerPage.includes(
          number
        )
      ) {
        return;
      }

      setSettings(
        (previous) => ({
          ...previous,
          inventoryPerPage:
            number,
        })
      );
    };

  const resetSettings =
    () => {
      setSettings(
        DEFAULT_SETTINGS
      );
    };

  const value =
    useMemo(
      () => ({
        ...settings,

        resolvedTheme,

        setTheme,
        setSalesPerPage,
        setFoldersPerPage,
        setInventoryPerPage,
        resetSettings,

        validOptions:
          VALID_OPTIONS,
      }),
      [
        settings,
        resolvedTheme,
      ]
    );

  return (
    <AppSettingsContext.Provider
      value={value}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context =
    useContext(
      AppSettingsContext
    );

  if (!context) {
    throw new Error(
      "useAppSettings debe utilizarse dentro de SettingsProvider."
    );
  }

  return context;
}