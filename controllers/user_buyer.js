require("dotenv").config();
const supabase = require("../services/supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getComprador = async (req, res) => {
  try {
  const { data, error } = await supabase
    .from("user_buyer")
    .select(
      "buyer_city, buyer_email, buyer_phone_number, buyer_username"
    );

  if (error) return res.status(500).json({ erro: error.message });

  res.json(data);
  }
  catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar Compradores" });
  }
};

const getCompradorId = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ erro: "Informe o id" });
  }

  try {
    const { data, error } = await supabase
      .from("user_buyer")
      .select(
        "buyer_id, buyer_username, buyer_city, buyer_email, buyer_phone_number"
      )
      .eq("buyer_id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!data) {
      return res.status(404).json({ erro: "Comprador não encontrado!" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
};

const validarSenha = (buyer_password) => {
  const senhaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?._&])[A-Za-z\d@$!%*?._&]{6,18}$/;
  return senhaRegex.test(buyer_password);
};

const cadastroComprador = async (req, res) => {
  const {
    buyer_username,
    buyer_city,
    buyer_email,
   // buyer_phone_number,
    buyer_password,
    buyer_cnpj,
  } = req.body;

  try {

  if (
    !buyer_username ||
    !buyer_city ||
    !buyer_email ||
   // !buyer_phone_number ||
    !buyer_password ||
    !buyer_cnpj
  ) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(buyer_email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  const { data: existingUser} = await supabase
    .from("user_buyer")
    .select("buyer_id")
    .eq("buyer_email", buyer_email)
    .single();

  if (existingUser) {
    return res.status(400).json({ erro: "Email já cadastrado." });
  }

  if (!validarSenha(buyer_password)) {
    return res.status(400).json({
      erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
    });
  }
/*
  if (buyer_phone_number.length < 9) {
    return res.status(400).json({
      erro: "O número de telefone deve ter pelo menos 9 dígitos.",
    });
  }

  const { data: existingNumber} = await supabase
    .from("user_buyer")
    .select("buyer_phone_number")
    .eq("buyer_phone_number", buyer_phone_number)
    .single();

  if (existingNumber) {
    return res.status(400).json({ erro: "Número já cadastrado." });
  }
*/
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.buyer_password, salt);
  console.log({ hash });

  const { data, error } = await supabase
  .from("user_buyer")
  .insert([
    {
      buyer_username,
      buyer_city,
      buyer_email,
     // buyer_phone_number,
      buyer_password: hash,
      buyer_cnpj,
    },
  ]);
  if (error) {
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
  return res.status(201).json({ message: "Usuário cadastrado com sucesso." });
} catch (err) {
  console.error("Erro ao cadastrar Comprador:", err);
  return res.status(500).json({ erro: "Erro ao cadastrar comprador." });
}
};

const loginComprador = async (req, res) => {
  const { buyer_email, buyer_password } = req.body;

  try {

  if (!buyer_email || !buyer_password) {
    return res.status(400).json({ erro: "Preencha os campos obrigatórios." });
  }
  const { data, error } = await supabase
    .from("user_buyer")
    .select("buyer_id, buyer_username, buyer_password")
    .eq("buyer_email", buyer_email)
    .single();
  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  if (!data) {
    return res.status(404).json({ erro: "Usuário inválido." });
  }

  const senhaValida = await bcrypt.compare(
    buyer_password,
    data.buyer_password
  );
  if (!senhaValida) {
    return res.status(401).json({ erro: "Senha incorreta." });
  }

  const { buyer_id, buyer_username } = data;

  const token = jwt.sign(
    { buyer_id, buyer_username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "5h" }
  );

  return res.status(200).json({
    message: "Login realizado com sucesso.",
    token,
    buyer_username,
  });
} catch (err) {
  console.error("Erro ao realizar login:", err);
  return res.status(500).json({ erro: "Erro ao realizar login." });
}};

const editarComprador = async (req, res) => {
  const { id } = req.params;
  const { buyer_id } = req.user;

  try {

  if (parseInt(id) !== buyer_id) {
    return res.status(400).json({ erro: "Informe o id do Comprador." });
  }
  try {
    const {
      buyer_username,
      buyer_city,
      buyer_email,
    //  buyer_phone_number,
      buyer_password,
      buyer_cnpj,
    } = req.body;

    if (
      !buyer_username &&
      !buyer_city &&
      !buyer_email &&
   //   !buyer_phone_number &&
      !buyer_password &&
      !buyer_cnpj
    ) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para editar." });
    }
    const updatebuyer = {};
    if (buyer_username) updatebuyer.buyer_username = buyer_username;
    if (buyer_city) updatebuyer.buyer_city = buyer_city;
    if (buyer_email) updatebuyer.buyer_email = buyer_email;
    if (buyer_cnpj) updatebuyer.buyer_cnpj = buyer_cnpj;
  /*  if (buyer_phone_number)
      updatebuyer.buyer_phone_number = buyer_phone_number; */
    if (buyer_password) {
      if (!validarSenha(buyer_password)) {
        return res.status(400).json({
          erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(buyer_password, salt);
      updatebuyer.buyer_password = hash;
    }
    const { data, error } = await supabase
      .from("user_buyer")
      .update(updatebuyer)
      .eq("buyer_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }
    return res
      .status(200)
      .json({ message: "Comprador editado com sucesso.", buyer: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro inesperado." });
  }
} catch (err) {
  console.error("Erro ao editar Comprador:", err);
  return res.status(500).json({ erro: "Erro ao editar comprador." });
}};

const deletarComprador = async (req, res) => {
  const { id } = req.params;
  const { buyer_id } = req.user;

try {

  if (parseInt(id) !== buyer_id) {
    return res.status(400).json({ erro: "Informe o id do Comprador." });
  }

  const { error } = await supabase
    .from("user_buyer")
    .delete()
    .eq("buyer_id", id);

  if (error) {
    return res.status(500).json({ erro: error.message });
  }

  return res.status(200).json({ message: "Comprador deletado com sucesso." });
} catch (err) {
  console.error("Erro ao deletar Comprador:", err);
  return res.status(500).json({ erro: "Erro ao deletar comprador." });
}};

module.exports = {
  getComprador,
  getCompradorId,
  cadastroComprador,
  loginComprador,
  editarComprador,
  deletarComprador,
};
