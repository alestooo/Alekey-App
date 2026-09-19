import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../lib/supabase";

import {
  hasPermission,
  ROLES,
} from "../constants/roles";

const AuthContext =
  createContext(null);

/* =========================================================
   HELPERS
========================================================= */

function normalizeEmail(
  value = ""
) {
  return String(value)
    .trim()
    .toLowerCase();
}

function isRateLimitError(
  error
) {
  return (
    error?.status ===
      429 ||
    String(
      error?.message ||
        ""
    )
      .toLowerCase()
      .includes(
        "rate limit"
      )
  );
}

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    sessionLoading,
    setSessionLoading,
  ] = useState(true);

  /*
   * Guarda para qué usuario ya
   * resolvimos el profile.
   *
   * Esto evita el loading infinito.
   */
  const [
    profileResolvedUserId,
    setProfileResolvedUserId,
  ] = useState(null);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(false);

  const [
    profileError,
    setProfileError,
  ] = useState(null);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  const loadProfile =
    useCallback(
      async (
        userId,
        {
          showLoading =
            true,
        } = {}
      ) => {
        if (!userId) {
          setProfile(null);

          setProfileError(
            null
          );

          setProfileLoading(
            false
          );

          setProfileResolvedUserId(
            null
          );

          return null;
        }

        if (showLoading) {
          setProfileLoading(
            true
          );
        }

        setProfileError(
          null
        );

        try {
          const {
            data,
            error,
          } = await supabase
            .from(
              "profiles"
            )
            .select(
              `
                id,
                nombre,
                email,
                role,
                activo,
                verificado,
                is_owner,
                created_at,
                updated_at
              `
            )
            .eq(
              "id",
              userId
            )
            .maybeSingle();

          if (error) {
            throw error;
          }

          setProfile(
            data || null
          );

          return (
            data || null
          );
        } catch (error) {
          console.error(
            "Error cargando perfil:",
            error
          );

          setProfile(
            null
          );

          setProfileError(
            error
          );

          return null;
        } finally {
          setProfileLoading(
            false
          );

          /*
           * Incluso si hubo error,
           * consideramos terminada
           * la carga.
           *
           * Así NO queda spinner
           * infinito.
           */
          setProfileResolvedUserId(
            userId
          );
        }
      },
      []
    );

  /* =======================================================
     INITIAL SESSION
  ======================================================= */

  useEffect(() => {
    let mounted =
      true;

    const initialize =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!mounted) {
            return;
          }

          setUser(
            data.session
              ?.user ||
              null
          );
        } catch (error) {
          console.error(
            "Error cargando sesión:",
            error
          );

          if (mounted) {
            setUser(null);
          }
        } finally {
          if (mounted) {
            setSessionLoading(
              false
            );
          }
        }
      };

    initialize();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          /*
           * IMPORTANTE:
           *
           * No ponemos profileLoading
           * ni profileResolved en false
           * aquí.
           *
           * Supabase dispara eventos
           * como TOKEN_REFRESHED.
           * Antes eso podía dejar la app
           * en "Cargando Alekey".
           */

          setUser(
            session?.user ||
              null
          );

          setSessionLoading(
            false
          );
        }
      );

    return () => {
      mounted =
        false;

      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     PROFILE WHEN USER ID CHANGES
  ======================================================= */

  useEffect(() => {
    if (
      sessionLoading
    ) {
      return;
    }

    /*
     * Logout
     */

    if (!user?.id) {
      setProfile(null);

      setProfileError(
        null
      );

      setProfileLoading(
        false
      );

      setProfileResolvedUserId(
        null
      );

      return;
    }

    /*
     * Solamente se ejecuta cuando
     * cambia user.id.
     *
     * Un TOKEN_REFRESHED del mismo
     * usuario NO vuelve a dispararlo.
     */

    setProfileResolvedUserId(
      null
    );

    loadProfile(
      user.id
    );
  }, [
    user?.id,
    sessionLoading,
    loadProfile,
  ]);

  /* =======================================================
     LOGIN
  ======================================================= */

  const login =
    async (
      email,
      password
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              normalizeEmail(
                email
              ),

            password,
          }
        );

      if (error) {
        throw error;
      }

      return data;
    };

  /* =======================================================
     REGISTER
  ======================================================= */

  const register =
    async ({
      nombre,
      email,
      password,
    }) => {
      const cleanEmail =
        normalizeEmail(
          email
        );

      const cleanName =
        String(
          nombre || ""
        ).trim();

      const {
        data,
        error,
      } =
        await supabase.auth.signUp(
          {
            email:
              cleanEmail,

            password,

            options: {
              data: {
                nombre:
                  cleanName,
              },
            },
          }
        );

      if (error) {
        throw error;
      }

      const identities =
        data?.user
          ?.identities;

      /*
       * Supabase puede devolver
       * identities: []
       * cuando el correo ya existe.
       */

      if (
        Array.isArray(
          identities
        ) &&
        identities.length ===
          0
      ) {
        /*
         * Intentamos reenviar OTP.
         * Si funciona, era una cuenta
         * todavía pendiente.
         */

        const {
          error:
            resendError,
        } =
          await supabase.auth.resend(
            {
              type:
                "signup",

              email:
                cleanEmail,
            }
          );

        if (!resendError) {
          return {
            status:
              "pending_verification",

            resent:
              true,

            data,
          };
        }

        if (
          isRateLimitError(
            resendError
          )
        ) {
          return {
            status:
              "pending_verification",

            resent:
              false,

            rateLimited:
              true,

            data,
          };
        }

        return {
          status:
            "already_registered",

          data,
        };
      }

      return {
        status:
          "pending_verification",

        resent:
          false,

        data,
      };
    };

  /* =======================================================
     VERIFY EMAIL OTP
  ======================================================= */

  const verifyEmailOtp =
    async (
      email,
      token
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth.verifyOtp(
          {
            email:
              normalizeEmail(
                email
              ),

            token:
              String(
                token || ""
              ).trim(),

            type:
              "email",
          }
        );

      if (error) {
        throw error;
      }

      if (
        data?.user?.id
      ) {
        setUser(
          data.user
        );

        await loadProfile(
          data.user.id
        );
      }

      return data;
    };

  /* =======================================================
     RESEND EMAIL OTP
  ======================================================= */

  const resendEmailOtp =
    async (
      email
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth.resend(
          {
            type:
              "signup",

            email:
              normalizeEmail(
                email
              ),
          }
        );

      if (error) {
        throw error;
      }

      return data;
    };

  /* =======================================================
     GOOGLE
  ======================================================= */

  const loginWithGoogle =
    async () => {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider:
              "google",

            options: {
              redirectTo:
                `${window.location.origin}/`,
            },
          }
        );

      if (error) {
        throw error;
      }

      return data;
    };

  /* =======================================================
     FORGOT PASSWORD
  ======================================================= */

  const forgotPassword =
    async (
      email
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          normalizeEmail(
            email
          ),

          {
            redirectTo:
              `${window.location.origin}/nueva-contrasena`,
          }
        );

      if (error) {
        throw error;
      }

      return data;
    };

  /* =======================================================
     UPDATE PASSWORD
  ======================================================= */

  const updatePassword =
    async (
      password
    ) => {
      const {
        data,
        error,
      } =
        await supabase.auth.updateUser(
          {
            password,
          }
        );

      if (error) {
        throw error;
      }

      return data;
    };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout =
    async () => {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);

      setProfile(null);

      setProfileError(
        null
      );

      setProfileLoading(
        false
      );

      setProfileResolvedUserId(
        null
      );
    };

  /* =======================================================
     REFRESH PROFILE
  ======================================================= */

  const refreshProfile =
    async () => {
      if (!user?.id) {
        return null;
      }

      /*
       * Refrescar nombre / rol etc.
       * sin poner toda la aplicación
       * en loading.
       */

      return loadProfile(
        user.id,
        {
          showLoading:
            false,
        }
      );
    };

  /* =======================================================
     ROLE
  ======================================================= */

  const role =
    profile?.role ||
    ROLES.USUARIO;

  const isSuperAdmin =
    role ===
    ROLES.SUPERADMIN;

  const isCoAdmin =
    role ===
    ROLES.COADMIN;

  const isSeller =
    role ===
    ROLES.VENDEDOR;

  const isEmployee =
    role ===
    ROLES.EMPLEADO;

  const isNormalUser =
    role ===
    ROLES.USUARIO;

  const isAdmin =
    isSuperAdmin ||
    isCoAdmin;

  const isOwner =
    profile?.is_owner ===
    true;

  const isActive =
    profile?.activo !==
    false;

  const isVerified =
    profile?.verificado ===
    true;

  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const can =
    (permission) =>
      hasPermission(
        role,
        permission
      );

  /* =======================================================
     LOADING
  ======================================================= */

  /*
   * Esta es la corrección principal.
   *
   * La app solo muestra loading cuando:
   *
   * 1. todavía no sabemos si existe sesión
   *
   * o
   *
   * 2. acaba de entrar OTRO usuario y
   *    todavía no resolvimos su profile.
   */

  const loading =
    sessionLoading ||
    (
      Boolean(
        user?.id
      ) &&
      profileResolvedUserId !==
        user.id
    );

  /* =======================================================
     CONTEXT
  ======================================================= */

  const value = {
    /*
     * DATA
     */

    user,
    profile,

    /*
     * LOADING
     */

    loading,

    sessionLoading,
    profileLoading,

    profileError,

    /*
     * ROLE
     */

    role,

    isSuperAdmin,
    isCoAdmin,

    isSeller,
    isEmployee,
    isNormalUser,

    isAdmin,
    isOwner,

    isActive,
    isVerified,

    /*
     * PERMISSIONS
     */

    can,

    /*
     * AUTH
     */

    login,
    register,

    verifyEmailOtp,
    resendEmailOtp,

    loginWithGoogle,

    forgotPassword,
    updatePassword,

    logout,

    /*
     * PROFILE
     */

    refreshProfile,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}