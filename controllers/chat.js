const supabase = require("../services/supabaseClient");

const getChat = async (req, res) => {
  const user = req.user;
  const userID = user.admin_id || user.producer_id;
  const { withUserID } = req.query;

  try {

  if (!withUserID) {
    return res.status(400).json({ erro: "withUserID é obrigatório" });
  }

  const { data: chat, error } = await supabase
    .from("chat")
    .select("*")
    .or(
      `and(sender_id.eq.${userID},recipient_id.eq.${withUserID}),and(sender_id.eq.${withUserID},recipient_id.eq.${userID})`
    )
    .order("chat_datetime", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!chat || chat.length === 0) {
    return res.status(404).json({ erro: "Nenhum chat encontrado" });
  }

  const updateData = chat.filter(
    (m) => m.status === "Pendente" && m.recipient_id === userID
  );
  if (updateData.length > 0) {
    const { error: updateError } = await supabase
      .from("chat")
      .update({ status: "Lida" })
      .eq("recipient_id", userID)
      .eq("sender_id", withUserID)
      .eq("status", "Pendente");

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
  }

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(chat);
} catch (err) {
  console.error("Erro ao buscar chat:", err);
  res.status(500).json({ error: "Erro ao buscar chat" });
}};

const createChatMessage = async (req, res) => {
  const user = req.user;
  const sender_id = user.admin_id || user.producer_id;
  const { recipient_id, content } = req.body;

  try {

  if (!recipient_id || !content) {
    return res
      .status(400)
      .json({ error: "Id do destinatário e conteúdo são obrigatórios." });
  }

  if (sender_id === recipient_id) {
    return res
      .status(400)
      .json({ error: "Não é possível enviar uma mensagem para você mesmo." });
  }

  const { error: insertError, data } = await supabase
    .from("chat")
    .insert([
      {
        sender_id,
        recipient_id,
        content,
        status: "Pendente",
        chat_datetime: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res.status(201).json({
    message: "Mensagem enviada com sucesso.",
    chat: data,
  });
} catch (err) {
  console.error("Erro ao enviar mensagem:", err);
  res.status(500).json({ error: "Erro ao enviar mensagem" });
}};

const deleteChatMessage = async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('chat')
        .delete()
        .eq('message_id', id);

      if (error) throw error;
      res.json({ message: 'Mensagem removida com sucesso' });
    } catch (err) {
      console.error('Erro ao remover mensagem:', err);
      res.status(500).json({ error: 'Erro ao remover mensagem' });
    }
  };

module.exports = {
  getChat,
  createChatMessage,
  deleteChatMessage,
};
