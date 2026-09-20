import {
  supabase,
} from "../lib/supabase";

/* =========================================================
   NORMALIZE EMAIL
========================================================= */

export function normalizeAuthEmail(
  email
) {
  return String(
    email || ""
  )
    .trim()
    .toLowerCase();
}

/* =========================================================
   EMAIL IS REGISTERED
========================================================= */

export async function emailIsRegistered(
  email
) {
  const cleanEmail =
    normalizeAuthEmail(
      email
    );

  if (!cleanEmail) {
    return false;
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "email_is_registered",
    {
      p_email:
        cleanEmail,
    }
  );

  if (error) {
    console.error(
      "Error comprobando correo:",
      error
    );

    throw error;
  }

  return data === true;
}