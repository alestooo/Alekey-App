import {
  supabase,
} from "../lib/supabase";

/* =========================================================
   GET USERS
========================================================= */

export async function getUsers() {
  const {
    data,
    error,
  } = await supabase
    .from("profiles")
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
    .order(
      "is_owner",
      {
        ascending:
          false,
      }
    )
    .order(
      "created_at",
      {
        ascending:
          true,
      }
    );

  if (error) {
    throw error;
  }

  return data || [];
}

/* =========================================================
   UPDATE MY NAME
========================================================= */

export async function updateMyName(
  nombre
) {
  const cleanName =
    String(
      nombre || ""
    ).trim();

  if (
    cleanName.length < 2
  ) {
    throw new Error(
      "El nombre debe tener al menos 2 caracteres."
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "update_my_name",
    {
      p_nombre:
        cleanName,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   UPDATE ROLE
========================================================= */

export async function updateUserRole(
  userId,
  role
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_update_user_role",
    {
      p_user_id:
        userId,

      p_role:
        role,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   ACTIVE / INACTIVE
========================================================= */

export async function updateUserStatus(
  userId,
  activo
) {
  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_set_user_active",
    {
      p_user_id:
        userId,

      p_activo:
        Boolean(
          activo
        ),
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   DELETE USER
   SOLO SUPERADMIN
========================================================= */

export async function deleteUserCompletely(
  userId
) {
  if (!userId) {
    throw new Error(
      "Usuario inválido."
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "admin_delete_user",
    {
      p_user_id:
        userId,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}