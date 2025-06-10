require("dotenv").config();
const supabase = require("../services/supabaseClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("user_admin")
      .select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao obter os admins" });
  }
};

const getAdminId = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("user_admin")
      .select("*")
      .eq("admin_id", id)
      .single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(404).json({ erro: "Administrador não encontrado" });
  }
};

const validarSenha = (admin_password) => {
  const senhaRegex = 
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?._&])[A-Za-z\d@$!%*?._&]{6,18}$/;
  return senhaRegex.test(admin_password); 
};

const cadastroAdmin = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.admin_password, salt);
  const {
    admin_username,
    admin_email,
    admin_password,
    admin_phone_number,
    admin_cnpj
  } = req.body;
  
  if (
    !admin_username ||
    !admin_email ||
    !admin_password ||
    !admin_phone_number ||
    !admin_cnpj
  ) {
    return res
      .status(400)
      .json({ erro: "Usuário, email, senha e número são obrigatórios." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(admin_email)) {
    return res.status(400).json({ erro: "Email inválido." });
  }

  const { data: existingUser} = await supabase
    .from("user_admin")
    .select("admin_id")
    .eq("admin_email", admin_email)
    .single();

  if (existingUser) {
    return res.status(400).json({ erro: "Email já cadastrado." });
  }

if (!validarSenha(admin_password)) {
  return res.status(400).json({
    erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
  });
}

 if (admin_phone_number.length < 9) {
    return res.status(400).json({ erro: "O número de telefone deve ter pelo menos 9 dígitos." });
  }

  const { data: existingNumber} = await supabase
    .from("user_admin")
    .select("admin_phone_number")
    .eq("admin_phone_number", admin_phone_number)
    .single();

  if (existingNumber) {
    return res.status(400).json({ erro: "Número já cadastrado." });
  }


  const { data, error } = await supabase
    .from("user_admin")
    .insert([
      {
        admin_username,
        admin_email,
        admin_password: hashedPassword,
        admin_cnpj,
        admin_phone_number
      },
    ])
    .select("*");
  
  if (error) {
    console.log(error);
    return res.status(400).json({ erro: "Erro ao criar usuário" });
  }
  res.status(201).json({ message: "Usuário criado com sucesso!" });
  console.log(salt);
  console.log(hashedPassword);
};

const editarAdmin = async (req, res) => {
  const { id } = req.params;
  const { admin_id } = req.user;

  try {

  if (parseInt(id) !== admin_id) {
    return res.status(400).json({ erro: "Informe o id do produtor." });
  }

    const { admin_username, admin_password, admin_email, admin_phone_number } =
      req.body;

    if (
      !admin_username &&
      !admin_password &&
      !admin_email &&
      !admin_phone_number
    ) {
      return res
        .status(400)
        .json({ erro: "Preencha pelo menos um campo para editar." });
    }
    const updateadmin = {};
    if (admin_username) updateadmin.admin_username = admin_username;
    if (admin_email) updateadmin.admin_email = admin_email;
    if (admin_phone_number) updateadmin.admin_phone_number = admin_phone_number;
    if (admin_password) {
      if (!validarSenha(admin_password)) {
        return res.status(400).json({
          erro: "Escolha uma senha mais segura. Entre 6 e 18 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(admin_password, salt);
      updateadmin.admin_password = hash;
    }
    const { data, error } = await supabase
      .from("user_admin")
      .update(updateadmin)
      .eq("admin_id", id)
      .select();

    if (error) {
      return res.status(500).json({ erro: error.message });
    }
    return res
      .status(200)
      .json({ message: "Admin editado com sucesso.", admin: data[0] });
  } catch (err) { 
    console.error("Erro ao editar Admin:", err);
    return res.status(500).json({ erro: "Erro ao editar Admin." });

  }
};

const loginAdmin = async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;

    const { data: user, error } = await supabase
      .from("user_admin")
      .select("*")
      .eq("admin_email", admin_email)
      .single();

    if (error || !admin_email) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }
    const samePassword = await bcrypt.compare(
      admin_password,
      user.admin_password
    );

    if (!samePassword) {
      return res.status(401).json({ erro: "Senha incorreta" });
    }
    
    const token = jwt.sign(
      { admin_id: user.admin_id, admin_email: user.admin_email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    return res.status(200).json({
      message: "Login realizado com sucesso.",
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao comparar a senha" });
  }
};

const deletarAdmin = async (req, res) => {
  const { id } = req.params;
  const { admin_id } = req.user;

  if (parseInt(id) !== admin_id) {
    return res.status(400).json({ erro: "Informe o id para deletar." });
  }
  try {
    const { error } = await supabase
      .from("user_admin")
      .delete()
      .eq("admin_id", id);

    if (error) {
      return res.status(500).json({ erro: error.message });
    }
    return res.status(200).json({ message: "Admin deletado com sucesso." });
  } catch (err) {
    return res.status(500).json({ erro: "Erro ao deletar Admin." });
  }
};

module.exports = {
  getAdmin,
  getAdminId,
  cadastroAdmin,
  editarAdmin,
  deletarAdmin,
  loginAdmin
};
