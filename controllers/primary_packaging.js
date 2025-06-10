require("dotenv").config();
const supabase = require("../services/supabaseClient");

const getPrimaryPackaging = async (req, res) => {
  try {
    const { data, error } = await supabase.from("PRIMARY_PACKAGING").select(`
            packaging_id,
            unit_id,
            dimension_cm,
            weight_unit_kg,
            weight_box_kg,
            fob_price_unit,
            fob_price_box,
            cip_price_box,
            UNITY_DATA (
                *
            )
        `);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar packaging:", error);
    res.status(500).json({ error: "Erro ao buscar packaging" });
  }
};

const getPrimaryPackagingId = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("PRIMARY_PACKAGING")
      .select(
        `
            packaging_id,
            unit_id,
            dimension_cm,
            weight_unit_kg,
            weight_box_kg,
            fob_price_unit,
            fob_price_box,
            cip_price_box,
            UNITY_DATA (
                *
            )
        `
      )
      .eq("packaging_id", id)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
  } catch (error) {
    console.error("Erro ao buscar packaging por ID:", error);
    res.status(500).json({ error: "Erro ao buscar packaging por ID" });
  }
};

const createPrimaryPackaging = async (req, res) => {
  const {
    unit_id,
    dimension_cm,
    weight_unit_kg,
    weight_box_kg,
    fob_price_unit,
    fob_price_box,
    cip_price_box,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("PRIMARY_PACKAGING")
      .insert([
        {
          unit_id,
          dimension_cm,
          weight_unit_kg,
          weight_box_kg,
          fob_price_unit,
          fob_price_box,
          cip_price_box,
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (error) {
    console.error("Erro ao criar packaging:", error);
    res.status(500).json({ error: "Erro ao criar packaging" });
  }
};

const updatePrimaryPackaging = async (req, res) => {
  const { id } = req.params;
  const {
    unit_id,
    dimension_cm,
    weight_unit_kg,
    weight_box_kg,
    fob_price_unit,
    fob_price_box,
    cip_price_box,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("PRIMARY_PACKAGING")
      .update({
        unit_id,
        dimension_cm,
        weight_unit_kg,
        weight_box_kg,
        fob_price_unit,
        fob_price_box,
        cip_price_box,
      })
      .eq("packaging_id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (error) {
    console.error("Erro ao atualizar packaging:", error);
    res.status(500).json({ error: "Erro ao atualizar packaging" });
  }
};

const deletePrimaryPackaging = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("PRIMARY_PACKAGING")
      .delete()
      .eq("packaging_id", id);

    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar packaging:", error);
    res.status(500).json({ error: "Erro ao deletar packaging" });
  }
};

module.exports = {
  getPrimaryPackaging,
  getPrimaryPackagingId,
  createPrimaryPackaging,
  updatePrimaryPackaging,
  deletePrimaryPackaging,
};
