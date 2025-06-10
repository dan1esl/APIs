const supabase = require("../services/supabaseClient");

const cadastroUnity = async (req, res) => {
  try {
    const {
      product_id,
      weight_per_unit,
      fob_price_per_unit,
      quantity_per_box,
      total_tablets_per_box,
    } = req.body;

    if (
      !product_id ||
      !weight_per_unit ||
      !fob_price_per_unit ||
      !quantity_per_box ||
      !total_tablets_per_box
    ) {
      return res.status(400).json({ erro: "Preencha os campos corretamente" });
    }

    const { data, error } = await supabase
      .from("unity_data")
      .insert([
        {
          product_id,
          weight_per_unit,
          fob_price_per_unit,
          quantity_per_box,
          total_tablets_per_box,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ erro: "Erro inesperado." });
  }
};

const getUnity = async (req, res) => {
  try {
    const { data, error } = await supabase.from("unity_data").select("*");

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ erro: "Erro inesperado." });
  }
};

const editarUnity = async (req, res) => {
  const { id } = req.params;

  try {
    if (
      !weight_per_unit &&
      !fob_price_per_unit &&
      !quantity_per_box &&
      !total_tablets_per_box
    ) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para editar." });
    }

    const {
      product_id,
      weight_per_unit,
      fob_price_per_unit,
      quantity_per_box,
      total_tablets_per_box,
    } = req.body;

    const updateUnity = {};
    if (product_id) updateUnity.product_id = product_id;
    if (weight_per_unit) updateUnity.weight_per_unit = weight_per_unit;
    if (fob_price_per_unit) updateUnity.fob_price_per_unit = fob_price_per_unit;
    if (quantity_per_box) updateUnity.quantity_per_box = quantity_per_box;
    if (total_tablets_per_box)
      updateUnity.total_tablets_per_box = total_tablets_per_box;

    const { data, error } = await supabase
      .from("unity_data")
      .update(updateUnity)
      .eq("unity_data_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!data.length) {
      return res.status(404).json({ erro: "Unidade não encontrada." });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro inesperado." });
  }
};

module.exports = {
  cadastroUnity,
  getUnity,
  editarUnity
};
