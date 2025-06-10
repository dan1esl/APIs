const supabase = require("../services/supabaseClient");

const getProdutos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("product")
      .select("mix_of_products, brand, product_image,");

    if (error) return res.status(500).json({ erro: error.message });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const getProdutosId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "Informe o Id" });
    }

    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("product_id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!data) {
      return res.status(404).json({ erro: "Produto não encontrado!" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const cadastroProduto = async (req, res) => {
  try {
    const { brand, mix_of_products, ncm, stamp_id, product_image } = req.body;

    if (
      brand == null ||
      mix_of_products == null ||
      ncm == null ||
      stamp_id == null ||
      product_image == null
    ) {
      return res.status(400).json({ erro: "Preencha os campos corretamente." });
    }
    const { data, error } = await supabase
      .from("product")
      .insert([{ brand, mix_of_products, ncm, stamp_id, product_image }])
      .select();

    if (error) {
      return res
        .status(500)
        .json({ erro: "Erro ao cadastrar o produto.", error });
    }

    return res
      .status(201)
      .json({ message: "Produto cadastrado.", produto: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const editarProdutos = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ erro: "Informe o Id do produto." });
  }

  try {
    const { brand, mix_of_products, ncm, stamp_id } = req.body;

    if (!brand && !mix_of_products && !ncm && !stamp_id) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para editar." });
    }

    const updateProduct = {};
    if (brand) updateProduct.brand = brand;
    if (mix_of_products) updateProduct.mix_of_products = mix_of_products;
    if (ncm) updateProduct.ncm = ncm;
    if (stamp_id) updateProduct.stamp_id = stamp_id;

    const { data, error } = await supabase
      .from("product")
      .update(updateProduct)
      .eq("product_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: "Erro ao editar o produto." });
    }

    return res
      .status(200)
      .json({ message: "Produto editado com sucesso.", product: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ erro: "Informe o Id do produto." });
    }

    const { error } = await supabase
      .from("product")
      .delete()
      .eq("product_id", id);

    if (error) {
      return res.status(500).json({ erro: "Erro ao deletar o produto." });
    }

    return res.status(200).json({ message: "Produto deletado com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

module.exports = {
  getProdutos,
  getProdutosId,
  cadastroProduto,
  editarProdutos,
  deletarProduto,
};
