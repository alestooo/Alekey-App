import {
  supabase,
} from "../lib/supabase";

export async function getFolders() {
  const {
    data,
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .select("*")
    .order(
      "orden",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createFolder({
  nombre,
  orden,
}) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .insert([
      {
        nombre,
        ids_ventas: [],
        orden,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteFolder(
  id
) {
  const {
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function renameFolder(
  id,
  nombre
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .update({
      nombre,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateFolderOrder(
  id,
  orden
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .update({
      orden,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateFolderSales(
  id,
  idsVentas
) {
  const {
    data,
    error,
  } = await supabase
    .from(
      "carpetas_centros"
    )
    .update({
      ids_ventas:
        idsVentas,
    })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}