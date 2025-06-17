require("dotenv").config();
const supabase = require("../services/supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResetCode } = require("../services/emailService");

const codes = {};

const getProdutor = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_producer")
      .select(
        "producer_address, producer_city, producer_email, producer_phone_number, producer_username, producer_cnpj"
      );

    if (error) return res.status(500).json({ erro: error.message });

    res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar Produtores" });
  }
};

const getProdutorId = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ erro: "Informe o id" });
    }

    try {
      const { data, error } = await supabase
        .from("user_producer")
        .select(
          "producer_id, producer_username, producer_address, producer_city, producer_email, producer_phone_number, producer_cnpj"
        )
        .eq("producer_id", id)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ erro: error.message });
      }

      if (!data) {
        return res.status(404).json({ erro: "Produtor não encontrado!" });
      }

      return res.json(data);
    } catch (err) {
      return res.status(500).json({ erro: "Erro ao buscar Produtor" });
    }
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao buscar Produtor" });
  }
};

const validarSenha = (producer_password) => {
  const senhaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?._&])[A-Za-z\d@$!%*?._&]{6,18}$/;
  return senhaRegex.test(producer_password);
};

const cadastroProdutor = async (req, res) => {
  const {
    producer_username,
    producer_email,
    producer_password,
    producer_city,
    producer_address,
    producer_phone_number,
    producer_cnpj,
  } = req.body;

  if (
    !producer_username ||
    !producer_address ||
    !producer_city ||
    !producer_email ||
    !producer_phone_number ||
    !producer_password ||
    !producer_cnpj
  ) {
    return res.status(400).json({ erro: "Preencha os campos obrigatórios." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(producer_email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  const { data: existingUser } = await supabase
    .from("user_producer")
    .select("producer_id")
    .eq("producer_email", producer_email)
    .single();

  if (existingUser) {
    return res.status(400).json({ erro: "Email já cadastrado." });
  }

  if (!validarSenha(producer_password)) {
    return res.status(400).json({
      erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
    });
  }

  if (producer_phone_number.length < 9) {
    return res.status(400).json({
      erro: "O número de telefone deve ter pelo menos 9 dígitos.",
    });
  }

  const { data: existingNumber } = await supabase
    .from("user_producer")
    .select("producer_phone_number")
    .eq("producer_phone_number", producer_phone_number)
    .single();

  if (existingNumber) {
    return res.status(400).json({ erro: "Número já cadastrado." });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.producer_password, salt);
  console.log({ hash });

  const { data, error } = await supabase.from("user_producer").insert([
    {
      producer_username,
      producer_address,
      producer_city,
      producer_email,
      producer_phone_number,
      producer_password: hash,
      producer_cnpj,
    },
  ]);
  if (error) {
    return res.status(500).json({ erro: "Erro ao cadastrar usuário." });
  }
  return res.status(201).json({ message: "Usuário cadastrado com sucesso." });
};

const loginProdutor = async (req, res) => {
  const { producer_email, producer_password } = req.body;

  try {
    if (!producer_email || !producer_password) {
      return res.status(400).json({ erro: "Preencha os campos obrigatórios." });
    }
    const { data, error } = await supabase
      .from("user_producer")
      .select("producer_id, producer_username, producer_password")
      .eq("producer_email", producer_email)
      .single();
    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    if (!data) {
      return res.status(404).json({ erro: "Usuário inválido." });
    }

    const senhaValida = await bcrypt.compare(
      producer_password,
      data.producer_password
    );
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha incorreta." });
    }

    const { producer_id, producer_username } = data;

    const token = jwt.sign(
      { producer_id, producer_username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "5h" }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token,
      producer_username,
    });
  } catch (err) {
    console.error("Erro ao realizar login:", err);
    return res.status(500).json({ erro: "Erro ao realizar login." });
  }
};

const editarProdutor = async (req, res) => {
  const { id } = req.params;
  const { producer_id } = req.user;

  try {
    if (parseInt(id) !== producer_id) {
      return res.status(400).json({ erro: "Informe o id do produtor." });
    }
    const {
      producer_username,
      producer_address,
      producer_city,
      producer_email,
      producer_phone_number,
      producer_password,
    } = req.body;

    if (
      !producer_username &&
      !producer_address &&
      !producer_city &&
      !producer_email &&
      !producer_phone_number &&
      !producer_password
    ) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para editar." });
    }
    const updateProducer = {};
    if (producer_username) updateProducer.producer_username = producer_username;
    if (producer_address) updateProducer.producer_address = producer_address;
    if (producer_city) updateProducer.producer_city = producer_city;
    if (producer_email) updateProducer.producer_email = producer_email;
    if (producer_phone_number)
      updateProducer.producer_phone_number = producer_phone_number;
    if (producer_password) {
      if (!validarSenha(producer_password)) {
        return res.status(400).json({
          erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(producer_password, salt);
      updateProducer.producer_password = hash;
    }
    const { data, error } = await supabase
      .from("user_producer")
      .update(updateProducer)
      .eq("producer_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }
    return res
      .status(200)
      .json({ message: "Produtor editado com sucesso.", producer: data[0] });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao editar produtor." });
  }
};

const deletarProdutor = async (req, res) => {
  const { id } = req.params;
  const { producer_id } = req.user;
  try {
    if (parseInt(id) !== producer_id) {
      return res.status(400).json({ erro: "Informe o id do produtor." });
    }

    const { error } = await supabase
      .from("user_producer")
      .delete()
      .eq("producer_id", id);

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    return res.status(200).json({ message: "Produtor deletado com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar Produtor:", err);
    return res.status(500).json({ erro: "Erro ao deletar produtor." });
  }
};

const requestPasswordReset = async (req, res) => {
  const { producer_email } = req.body;
  try {
    const { data: user } = await supabase
      .from("user_producer")
      .select("*")
      .eq("producer_email", producer_email)
      .single();
    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes[producer_email] = code;

    await sendResetCode(producer_email, code);
    return res
      .status(200)
      .json({ message: "Código de redefinição enviado para o e-mail." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ erro: "Erro ao solicitar redefinição de senha." });
  }
};

const verifyResetCode = async (req, res) => {
  const { producer_email, code } = req.body;
  try {
    if (codes[producer_email] !== code) {
      return res.status(400).json({ erro: "Código inválido." });
    }
    return res.status(200).json({ message: "Código verificado com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao verificar código." });
  }
};

const resetPassword = async (req, res) => {
  const { producer_email, new_password } = req.body;
  try {
    if (!codes[producer_email]) {
      return res
        .status(400)
        .json({ erro: "Código de redefinição não solicitado." });
    }

    if (!new_password || !validarSenha(new_password)) {
      return res.status(400).json({
        erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(new_password, salt);

    await supabase
      .from("user_producer")
      .update({ producer_password: hash })
      .eq("producer_email", producer_email);

    delete codes[producer_email];

    return res.status(200).json({ message: "Senha redefinida com sucesso." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao redefinir senha." });
  }
};

module.exports = {
  getProdutor,
  getProdutorId,
  cadastroProdutor,
  loginProdutor,
  editarProdutor,
  deletarProdutor,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
};
