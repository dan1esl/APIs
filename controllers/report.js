const supabase = require("../services/supabaseClient");
const cadastroReport = async (req, res) => {
  try {
    const { event_name, city_country, date, event_type,producer_username: rawProducerUsername,product_name,quantity_product,currency,CDP,estimated_value,description } = req.body;
    /*falta adicionar (productname,quantity,cambio) para cada um do evento, mas o banco permite um só então vai ficar um produto só por evento*/
    /* Abaixo, se producer_username for null, seu valor será Diversos Produtores como no video*/
    const producer_username = rawProducerUsername == null ? "Diversos Produtores" : rawProducerUsername;
    if (
      event_name == null ||
      city_country == null ||
      date == null ||
      event_type == null ||
      product_name == null ||
      quantity_product == null ||
      currency == null ||
      CDP == null ||
      estimated_value == null ||
      description == null
    ) {
      return res.status(400).json({ erro: "Preencha os campos corretamente." });
    }
    const { data, error } = await supabase
      .from("report")
      .insert([{ event_name, city_country, date, event_type,product_name,quantity_product,currency,producer_username,CDP,estimated_value,description }])
      .select();

    if (error) {
      return res
        .status(500)
        .json({ erro: "Erro ao cadastrar o Relatório.", error });
    }

    return res
      .status(201)
      .json({ message: "Relatório cadastrado.", relatorio: data });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};
const getReport = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("report")
      .select("event_name,city_country,datetime,event_type");

    if (error) return res.status(500).json({ erro: error.message });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};
const getReportId = async (req, res) => {
  try {
    const { id } = req.params;
    /* Essa parte do id do relatorio é para fazer igual no produtos e quando clicar no relatorio que vc escolher, o id vai estar na url*/
    if (!id) {
      return res.status(400).json({ erro: "Id do relatorio não encontrado" });
    }

    const { data, error } = await supabase
      .from("report")
      .select("*")
      .eq("report_id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!data) {
      return res.status(404).json({ erro: "relatório não encontrado!" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};






module.exports = {
  getReport,
  cadastroReport,
  getReportId,
};