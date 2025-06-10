const supabase = require("../services/supabaseClient");

const getBrand = async (req, res) => {
  try {
    const { data, error } = await supabase.from("brand").select("*");

    if (error) {
      return res.status(500).json({ erro: "Não foi possível buscar brands." });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: "Erro inesperado." });
  }
};

const getBrandId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "Informe o id" });
    }

    const { data, error } = await supabase
      .from("brand")
      .select("*")
      .eq("brand_id", id)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ erro: "Brand não encontrada." });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const cadastroBrand = async (req, res) => {
  try {
    const { brand_name, brand_cnpj, producer_id } = req.body;

    if (!brand_name || !brand_cnpj || !producer_id) {
      return res.status(400).json({ erro: "Preencha os campos corretamente" });
    }

    const { data, error } = await supabase
      .from("brand")
      .insert([{ brand_name, brand_cnpj, producer_id }])
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    return res.status(200).json({ message: "Brand cadastrada" });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const editarBrand = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "Informe o id" });
  }

  try {
    const { brand_name, brand_cnpj } = req.body;

    if (!brand_name && !brand_cnpj) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para atualizar" });
    }

    const updateBrand = {};
    if (brand_name) updateBrand.brand_name = brand_name;
    if (brand_cnpj) updateBrand.brand_cnpj = brand_cnpj;

    const { data, error } = await supabase
      .from("brand")
      .update(updateBrand)
      .eq("brand_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    return res
      .status(200)
      .json({ message: "Brand editada com sucesso", brand: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

module.exports = {
  getBrand,
  getBrandId,
  cadastroBrand,
  editarBrand,
};
