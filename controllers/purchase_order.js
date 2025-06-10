require("dotenv").config();
const supabase = require("../services/supabaseClient");

const getPurchaseOrder = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("purchase_order")
      .select("*");

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao obter as ordens de compra" });
  }
}

const createOrder = async (req, res) =>{
    const {order_id, unit_id, quantity_of_boxes, buyer_id} = req.body;
    const { data, error } = await supabase
      .from("purchase_order")
      .insert([
        {
          order_id,
          unit_id,
          quantity_of_boxes,
          buyer_id
        }
      ])
      .select();
    if (error) 
      return res.status(500).json({ erro: error.message });
        res.status(201).json(data);
    };

module.exports = {
    getPurchaseOrder,
    createOrder,
};