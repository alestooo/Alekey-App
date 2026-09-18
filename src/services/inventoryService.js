import {
  supabase,
} from "../lib/supabase";

const BLOCK_SIZE = 1000;

export async function getActiveInventory() {
  let from = 0;

  let inventory = [];

  let hasMore = true;

  while (hasMore) {
    const {
      data,
      error,
    } = await supabase
      .from("inventario")
      .select("*")
      .eq(
        "activo",
        true
      )
      .order(
        "categoria",
        {
          ascending: true,
        }
      )
      .order(
        "tema",
        {
          ascending: true,
        }
      )
      .range(
        from,
        from +
          BLOCK_SIZE -
          1
      );

    if (error) {
      throw error;
    }

    const block =
      data || [];

    inventory = [
      ...inventory,
      ...block,
    ];

    hasMore =
      block.length ===
      BLOCK_SIZE;

    from += BLOCK_SIZE;
  }

  return inventory;
}

export async function getAllInventory() {
  let from = 0;

  let inventory = [];

  let hasMore = true;

  while (hasMore) {
    const {
      data,
      error,
    } = await supabase
      .from("inventario")
      .select("*")
      .order(
        "categoria",
        {
          ascending: true,
        }
      )
      .order(
        "tema",
        {
          ascending: true,
        }
      )
      .range(
        from,
        from +
          BLOCK_SIZE -
          1
      );

    if (error) {
      throw error;
    }

    const block =
      data || [];

    inventory = [
      ...inventory,
      ...block,
    ];

    hasMore =
      block.length ===
      BLOCK_SIZE;

    from += BLOCK_SIZE;
  }

  return inventory;
}

export async function updateInventoryStock(
  id,
  stock
) {
  const {
    data,
    error,
  } = await supabase
    .from("inventario")
    .update({
      stock,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createInventoryItem(
  item
) {
  const {
    data,
    error,
  } = await supabase
    .from("inventario")
    .insert([
      item,
    ])
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}

export async function deleteInventoryItem(
  id
) {
  const {
    data,
    error,
  } = await supabase
    .from("inventario")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data || [];
}