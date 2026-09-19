import {
  CheckCircle2,
  ChevronDown,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  getRoleLabel,
  ROLES,
} from "../constants/roles";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/usersService";

/* =========================================================
   ROLES QUE EL SUPERADMIN PUEDE ASIGNAR
========================================================= */

const ASSIGNABLE_ROLES = [
  {
    value: ROLES.USUARIO,
    label: "Usuario",
  },
  {
    value: ROLES.EMPLEADO,
    label: "Empleado",
  },
  {
    value: ROLES.VENDEDOR,
    label: "Vendedor",
  },
  {
    value: ROLES.COADMIN,
    label: "Co-admin",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function AdminUsersPage() {
  const {
    user,
    role,
    isSuperAdmin,
    isCoAdmin,
  } = useAuth();

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadUsers =
    async () => {
      setLoading(true);

      try {
        const data =
          await getUsers();

        setUsers(
          data || []
        );
      } catch (error) {
        console.error(
          "Error cargando usuarios:",
          error
        );

        await Swal.fire({
          title:
            "No se pudieron cargar los usuarios",

          text:
            error.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const total =
        users.length;

      const admins =
        users.filter(
          (item) =>
            item.role ===
              ROLES.SUPERADMIN ||
            item.role ===
              ROLES.COADMIN
        ).length;

      const normalUsers =
        users.filter(
          (item) =>
            item.role ===
            ROLES.USUARIO
        ).length;

      const active =
        users.filter(
          (item) =>
            item.activo
        ).length;

      return {
        total,
        admins,
        normalUsers,
        active,
      };
    }, [
      users,
    ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredUsers =
    useMemo(() => {
      const clean =
        search
          .trim()
          .toLowerCase();

      if (!clean) {
        return users;
      }

      return users.filter(
        (item) => {
          const name =
            String(
              item.nombre ||
                ""
            ).toLowerCase();

          const email =
            String(
              item.email ||
                ""
            ).toLowerCase();

          const roleLabel =
            getRoleLabel(
              item.role
            ).toLowerCase();

          return (
            name.includes(
              clean
            ) ||
            email.includes(
              clean
            ) ||
            roleLabel.includes(
              clean
            )
          );
        }
      );
    }, [
      users,
      search,
    ]);

  /* =======================================================
     ROLE PERMISSIONS
  ======================================================= */

  const canChangeRole =
    (target) => {
      /*
       * Únicamente superadmin.
       */

      if (!isSuperAdmin) {
        return false;
      }

      /*
       * Owner jamás se modifica.
       */

      if (
        target.is_owner ||
        target.role ===
          ROLES.SUPERADMIN
      ) {
        return false;
      }

      /*
       * No cambiar tu propio rol.
       */

      if (
        target.id ===
        user?.id
      ) {
        return false;
      }

      return true;
    };

  const canChangeStatus =
    (target) => {
      /*
       * Owner jamás.
       */

      if (
        target.is_owner ||
        target.role ===
          ROLES.SUPERADMIN
      ) {
        return false;
      }

      /*
       * No desactivar tu propia cuenta.
       */

      if (
        target.id ===
        user?.id
      ) {
        return false;
      }

      /*
       * Superadmin puede controlar
       * cualquier rol inferior.
       */

      if (isSuperAdmin) {
        return true;
      }

      /*
       * Co-admin solamente:
       * vendedor
       * empleado
       * usuario
       */

      if (isCoAdmin) {
        return [
          ROLES.VENDEDOR,
          ROLES.EMPLEADO,
          ROLES.USUARIO,
        ].includes(
          target.role
        );
      }

      return false;
    };

  /* =======================================================
     CHANGE ROLE
  ======================================================= */

  const handleRoleChange =
    async (
      target,
      nextRole
    ) => {
      if (
        !canChangeRole(
          target
        )
      ) {
        return;
      }

      if (
        nextRole ===
        target.role
      ) {
        return;
      }

      const result =
        await Swal.fire({
          title:
            "¿Cambiar rol?",

          html: `
            <p style="
              color:#94a3b8;
              font-size:13px;
              line-height:1.6;
            ">
              <strong style="color:#0f172a;">
                ${escapeHtml(
                  target.nombre ||
                    target.email
                )}
              </strong>
              pasará de
              <strong>${escapeHtml(
                getRoleLabel(
                  target.role
                )
              )}</strong>
              a
              <strong>${escapeHtml(
                getRoleLabel(
                  nextRole
                )
              )}</strong>.
            </p>
          `,

          icon:
            "question",

          showCancelButton:
            true,

          confirmButtonText:
            "Cambiar rol",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#8ED4BE",

          cancelButtonColor:
            "#94a3b8",
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      setUpdatingId(
        target.id
      );

      try {
        await updateUserRole(
          target.id,
          nextRole
        );

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                target.id
                  ? {
                      ...item,
                      role:
                        nextRole,
                    }
                  : item
            )
        );

        await Swal.fire({
          title:
            "Rol actualizado",

          icon:
            "success",

          timer:
            1000,

          showConfirmButton:
            false,
        });
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire({
          title:
            "No se pudo cambiar el rol",

          text:
            error.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  /* =======================================================
     ACTIVE / INACTIVE
  ======================================================= */

  const handleStatus =
    async (
      target
    ) => {
      if (
        !canChangeStatus(
          target
        )
      ) {
        return;
      }

      const nextStatus =
        !target.activo;

      const result =
        await Swal.fire({
          title:
            nextStatus
              ? "¿Activar usuario?"
              : "¿Desactivar usuario?",

          text:
            nextStatus
              ? "El usuario recuperará el acceso correspondiente a su rol."
              : "El usuario ya no podrá utilizar Alekey.",

          icon:
            "question",

          showCancelButton:
            true,

          confirmButtonText:
            nextStatus
              ? "Activar"
              : "Desactivar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            nextStatus
              ? "#8ED4BE"
              : "#F79598",

          cancelButtonColor:
            "#94a3b8",
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      setUpdatingId(
        target.id
      );

      try {
        await updateUserStatus(
          target.id,
          nextStatus
        );

        setUsers(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                target.id
                  ? {
                      ...item,
                      activo:
                        nextStatus,
                    }
                  : item
            )
        );
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire({
          title:
            "No se pudo actualizar",

          text:
            error.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setUpdatingId(
          null
        );
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        max-w-[1500px]
        mx-auto

        p-4
        md:p-6
        xl:p-8

        pb-28

        font-black
      "
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header
        className="
          flex
          items-center
          gap-4

          mb-7
        "
      >
        <div
          className="
            w-12
            h-12

            rounded-2xl

            bg-[#8ED4BE]/15

            text-[#58B99A]

            flex
            items-center
            justify-center
          "
        >
          <ShieldCheck
            size={22}
          />
        </div>

        <div>
          <h1
            className="
              text-3xl
              md:text-4xl

              italic
              uppercase

              tracking-tighter

              text-slate-900
              dark:text-white
            "
          >
            Administración
            <span
              className="
                text-[#8ED4BE]
              "
            >
              .
            </span>
          </h1>

          <p
            className="
              mt-1

              text-[7px]

              uppercase
              tracking-[0.22em]

              text-slate-400
            "
          >
            Usuarios y permisos
          </p>
        </div>
      </header>

      {/* =================================================
          STATS
      ================================================= */}

      <section
        className="
          grid

          grid-cols-2
          xl:grid-cols-4

          gap-3
          md:gap-4

          mb-6
        "
      >
        <StatCard
          icon={
            UsersRound
          }
          label="Usuarios"
          value={
            stats.total
          }
        />

        <StatCard
          icon={
            ShieldCheck
          }
          label="Administradores"
          value={
            stats.admins
          }
          accent
        />

        <StatCard
          icon={
            UserRound
          }
          label="Sin permisos"
          value={
            stats.normalUsers
          }
        />

        <StatCard
          icon={
            CheckCircle2
          }
          label="Activos"
          value={
            stats.active
          }
          accent
        />
      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <section
        className="
          relative

          mb-6
        "
      >
        <Search
          size={19}
          className="
            absolute

            left-5
            top-1/2

            -translate-y-1/2

            text-slate-400
          "
        />

        <input
          type="search"
          value={
            search
          }
          onChange={(
            event
          ) =>
            setSearch(
              event
                .target
                .value
            )
          }
          placeholder="Buscar usuario, correo o rol..."
          className="
            w-full

            h-16

            pl-14
            pr-5

            rounded-2xl

            bg-white
            dark:bg-slate-900

            border
            border-slate-100
            dark:border-slate-800

            shadow-[0_8px_24px_rgba(15,23,42,0.05)]

            outline-none

            text-sm
            font-bold

            text-slate-700
            dark:text-slate-200

            placeholder:text-slate-400

            focus:border-[#8ED4BE]
          "
        />
      </section>

      {/* =================================================
          LIST
      ================================================= */}

      {loading ? (
        <div
          className="
            min-h-[300px]

            flex
            items-center
            justify-center

            text-xs

            uppercase
            tracking-widest

            text-slate-400
          "
        >
          Cargando usuarios...
        </div>
      ) : (
        <section
          className="
            grid
            grid-cols-1
            xl:grid-cols-2

            gap-4
          "
        >
          {filteredUsers.map(
            (account) => (
              <UserCard
                key={
                  account.id
                }
                account={
                  account
                }
                currentUserId={
                  user?.id
                }
                actorRole={
                  role
                }
                updating={
                  updatingId ===
                  account.id
                }
                canChangeRole={
                  canChangeRole(
                    account
                  )
                }
                canChangeStatus={
                  canChangeStatus(
                    account
                  )
                }
                onRoleChange={(
                  nextRole
                ) =>
                  handleRoleChange(
                    account,
                    nextRole
                  )
                }
                onStatusChange={() =>
                  handleStatus(
                    account
                  )
                }
              />
            )
          )}
        </section>
      )}

      {!loading &&
        filteredUsers.length ===
          0 && (
          <div
            className="
              min-h-[250px]

              flex
              items-center
              justify-center

              text-center
            "
          >
            <div>
              <UserRound
                size={30}
                className="
                  mx-auto
                  text-slate-300
                "
              />

              <p
                className="
                  mt-4

                  text-[9px]

                  uppercase
                  tracking-widest

                  text-slate-400
                "
              >
                No encontramos usuarios
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

/* =========================================================
   USER CARD
========================================================= */

function UserCard({
  account,
  currentUserId,
  actorRole,
  updating,
  canChangeRole,
  canChangeStatus,
  onRoleChange,
  onStatusChange,
}) {
  const isMe =
    account.id ===
    currentUserId;

  const isOwner =
    account.is_owner ||
    account.role ===
      ROLES.SUPERADMIN;

  const roleLabel =
    getRoleLabel(
      account.role
    );

  return (
    <article
      className="
        p-5
        md:p-6

        rounded-[2rem]

        bg-white
        dark:bg-slate-900

        border
        border-slate-100
        dark:border-slate-800

        shadow-[0_14px_34px_rgba(15,23,42,0.06)]
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <div
          className="
            w-12
            h-12

            rounded-2xl

            bg-slate-100
            dark:bg-slate-800

            text-slate-500
            dark:text-slate-300

            flex
            items-center
            justify-center

            shrink-0
          "
        >
          {isOwner ? (
            <ShieldCheck
              size={20}
              className="
                text-[#58B99A]
              "
            />
          ) : (
            <UserRound
              size={20}
            />
          )}
        </div>

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              flex-wrap

              items-center
              gap-2
            "
          >
            <h2
              className="
                text-base
                md:text-lg

                italic
                uppercase

                text-slate-900
                dark:text-white

                truncate
              "
            >
              {account.nombre ||
                "Usuario"}
            </h2>

            {isOwner && (
              <Badge>
                Admin total
              </Badge>
            )}

            {isMe &&
              !isOwner && (
                <Badge>
                  Tu cuenta
                </Badge>
              )}
          </div>

          <p
            className="
              mt-1

              text-[8px]
              md:text-[9px]

              font-semibold

              text-slate-400

              truncate
            "
          >
            {account.email}
          </p>
        </div>

        <StatusBadge
          active={
            account.activo
          }
        />
      </div>

      {/* BODY */}

      <div
        className="
          mt-5

          grid
          grid-cols-1
          sm:grid-cols-2

          gap-3
        "
      >
        {/* ROLE */}

        <div
          className="
            p-4

            rounded-2xl

            bg-slate-50
            dark:bg-slate-950/40

            border
            border-slate-100
            dark:border-slate-800
          "
        >
          <p
            className="
              mb-3

              text-[7px]

              uppercase
              tracking-widest

              text-slate-400
            "
          >
            Rol
          </p>

          {isOwner ? (
            <LockedRole
              label="Administrador total"
            />
          ) : canChangeRole ? (
            <div
              className="
                relative
              "
            >
              <select
                value={
                  account.role
                }
                disabled={
                  updating
                }
                onChange={(
                  event
                ) =>
                  onRoleChange(
                    event
                      .target
                      .value
                  )
                }
                className="
                  appearance-none

                  w-full
                  h-12

                  pl-4
                  pr-11

                  rounded-xl

                  bg-white
                  dark:bg-slate-900

                  border
                  border-slate-200
                  dark:border-slate-700

                  outline-none

                  text-[8px]
                  uppercase
                  tracking-wide

                  text-slate-700
                  dark:text-slate-200

                  cursor-pointer

                  focus:border-[#8ED4BE]

                  disabled:opacity-50
                "
              >
                {ASSIGNABLE_ROLES.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="
                  absolute

                  right-4
                  top-1/2

                  -translate-y-1/2

                  pointer-events-none

                  text-slate-400
                "
              />
            </div>
          ) : (
            <LockedRole
              label={
                roleLabel
              }
            />
          )}
        </div>

        {/* STATUS */}

        <div
          className="
            p-4

            rounded-2xl

            bg-slate-50
            dark:bg-slate-950/40

            border
            border-slate-100
            dark:border-slate-800
          "
        >
          <p
            className="
              mb-3

              text-[7px]

              uppercase
              tracking-widest

              text-slate-400
            "
          >
            Estado
          </p>

          {canChangeStatus ? (
            <button
              type="button"
              disabled={
                updating
              }
              onClick={
                onStatusChange
              }
              className={`
                w-full
                h-12

                rounded-xl

                flex
                items-center
                justify-center
                gap-2

                text-[8px]
                uppercase
                tracking-wide

                transition-all

                disabled:opacity-50

                ${
                  account.activo
                    ? `
                      bg-red-50
                      text-red-500

                      dark:bg-red-500/10
                      dark:text-red-400
                    `
                    : `
                      bg-emerald-50
                      text-emerald-600

                      dark:bg-emerald-500/10
                      dark:text-emerald-400
                    `
                }
              `}
            >
              {account.activo ? (
                <>
                  <XCircle
                    size={15}
                  />

                  Desactivar
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={15}
                  />

                  Activar
                </>
              )}
            </button>
          ) : (
            <div
              className="
                h-12

                px-4

                rounded-xl

                bg-slate-100
                dark:bg-slate-900

                flex
                items-center
                gap-2

                text-[8px]
                uppercase
                tracking-wide

                text-slate-400
              "
            >
              {account.activo ? (
                <CheckCircle2
                  size={15}
                />
              ) : (
                <XCircle
                  size={15}
                />
              )}

              {account.activo
                ? "Activo"
                : "Desactivado"}
            </div>
          )}
        </div>
      </div>

      {/* INFO DE SEGURIDAD */}

      {(isOwner ||
        actorRole ===
          ROLES.COADMIN) && (
        <div
          className="
            mt-4
            pt-4

            border-t
            border-slate-100
            dark:border-slate-800
          "
        >
          <p
            className="
              text-[7px]

              uppercase
              tracking-wider

              text-slate-400
            "
          >
            {isOwner
              ? "Esta cuenta es el propietario del sistema y no puede ser modificada."
              : actorRole ===
                  ROLES.COADMIN
                ? "Como Co-admin puedes administrar cuentas, pero no modificar roles."
                : ""}
          </p>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  accent = false,
}) {
  return (
    <article
      className="
        min-h-[100px]

        p-4
        md:p-5

        rounded-[1.8rem]

        bg-white
        dark:bg-slate-900

        border
        border-slate-100
        dark:border-slate-800

        shadow-[0_12px_30px_rgba(15,23,42,0.06)]

        flex
        items-center
        gap-4
      "
    >
      <div
        className={`
          w-11
          h-11

          rounded-xl

          flex
          items-center
          justify-center

          shrink-0

          ${
            accent
              ? `
                bg-[#8ED4BE]/15
                text-[#58B99A]
              `
              : `
                bg-slate-100
                text-slate-500

                dark:bg-slate-800
                dark:text-slate-300
              `
          }
        `}
      >
        <Icon
          size={19}
        />
      </div>

      <div>
        <p
          className="
            text-[6px]

            uppercase
            tracking-widest

            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1

            text-xl
            italic

            text-slate-900
            dark:text-white
          "
        >
          {value}
        </p>
      </div>
    </article>
  );
}

/* =========================================================
   LOCKED ROLE
========================================================= */

function LockedRole({
  label,
}) {
  return (
    <div
      className="
        min-h-12

        px-4

        rounded-xl

        bg-slate-100
        dark:bg-slate-900

        border
        border-slate-200
        dark:border-slate-800

        flex
        items-center
        justify-between

        text-[8px]
        uppercase
        tracking-wide

        text-slate-500
        dark:text-slate-300
      "
    >
      <span>
        {label}
      </span>

      <ShieldCheck
        size={14}
        className="
          text-[#58B99A]
        "
      />
    </div>
  );
}

/* =========================================================
   BADGES
========================================================= */

function Badge({
  children,
}) {
  return (
    <span
      className="
        px-2
        py-1

        rounded-lg

        bg-[#8ED4BE]/15
        text-[#58B99A]

        text-[6px]

        uppercase
        tracking-widest
      "
    >
      {children}
    </span>
  );
}

function StatusBadge({
  active,
}) {
  return (
    <span
      className={`
        px-3
        py-2

        rounded-xl

        text-[6px]

        uppercase
        tracking-wider

        shrink-0

        ${
          active
            ? `
              bg-emerald-50
              text-emerald-600

              dark:bg-emerald-500/10
              dark:text-emerald-400
            `
            : `
              bg-red-50
              text-red-500

              dark:bg-red-500/10
              dark:text-red-400
            `
        }
      `}
    >
      {active
        ? "Activo"
        : "Desactivado"}
    </span>
  );
}

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
  value = ""
) {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}