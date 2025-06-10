const supabase = require("../services/supabaseClient");

const getStamp = async (req, res) => {
  try {
    const { data, error } = await supabase.from("stamp").select("*");

    if (error) {
      return res.status(500).json({ erro: "Não foi possível buscar stamps." });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: "Erro inesperado." });
  }
};

const getStampID = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "Informe o id" });
    }
    const { data, error } = await supabase
      .from("stamp")
      .select("*")
      .eq("stamp_id", id)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ erro: "Stamp não encontrado." });
    }
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const cadastroStamp = async (req, res) => {
  try {
    const { stamp_name, stamp_description } = req.body;

    if (!stamp_name || !stamp_description) {
      return res.status(400).json({ erro: "Preencha os campos corretamente." });
    }

    const { data, error } = await supabase
      .from("stamp")
      .insert([{ stamp_name, stamp_description }])
      .select();

    if (error) {
      return res.status(500).json({ erro: "Erro ao cadastrar stamp." });
    }
    return res.status(201).json({ message: "Stamp cadastrado." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};
const editarStamp = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "Informe o id" });
  }

  try {
    const { stamp_name, stamp_description } = req.body;

    if (!stamp_name && !stamp_description) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um dos campos para atualizar." });
    }

    const updateStamp = {};
    if (stamp_name) updateStamp.stamp_name = stamp_name;
    if (stamp_description) updateStamp.stamp_description = stamp_description;

    const { data, error } = await supabase
      .from("stamp")
      .update(updateStamp)
      .eq("stamp_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: "Erro ao editar stamp." });
    }

    return res.status(200).json({ message: "Stamp editado.", stamp: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const deletarStamp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "Informe o Id" });
    }

    const { data, error } = await supabase
      .from("stamp")
      .delete()
      .eq("stamp_id", id)
      .select();

    if (error || !data.length) {
      return res.status(404).json({ erro: "Stamp não encontrado." });
    }

    return res.status(200).json({ message: "Stamp deletado com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

module.exports = {
  getStamp,
  getStampID,
  cadastroStamp,
  editarStamp,
  deletarStamp,
};
