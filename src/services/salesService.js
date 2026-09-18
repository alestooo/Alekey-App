import {
  supabase,
} from "../lib/supabase";

export async function getSales() {
  const {
    data,
    error,
  } = await supabase
    .from("ventas")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createSale(
  nuevaVenta
) {
  const {
    data,
    error,
  } = await supabase
    .from("ventas")
    .insert([
      nuevaVenta,
    ])
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteSale(
  id
) {
  const {
    error,
  } = await supabase
    .from("ventas")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

export async function updateSale(
  id,
  dataEditada
) {
  const {
    data,
    error,
  } = await supabase
    .from("ventas")
    .update(
      dataEditada
    )
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}