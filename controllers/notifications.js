const supabase = require("../services/supabaseClient");

const getNotifications = async (req, res) => {
  const user = req.user;
  const userID = user.admin_ID || user.producer_ID;

  try {

  const showNotifications = req.query.showNotifications === "true";

   if(showNotifications) {
     await supabase
     .from("notifications")
      .update({ status: "Lida" })
      .eq("recipient_ID", userID)
      .eq("status", "Pendente");
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`recipient_ID.eq.${userID},sender_ID.eq.${userID}`)
    .order("datetime", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const [{ data: admins }, { data: producers }] = await Promise.all([
    supabase
    .from("user_admin")
    .select("admin_ID, admin_username"),
    supabase
    .from("user_producer")
    .select("producer_ID, producer_username"),
  ]);

  const userMap = {};
  admins.forEach((admin) => {
    userMap[admin.admin_ID] = { name: admin.admin_username, type: "admin" };
  });
  producers.forEach((prod) => {
    userMap[prod.producer_ID] = {
      name: prod.producer_username,
      type: "producer",
    };
  });

    const response = notifications.map((n) => ({
    notification_id: n.notification_id,
    content: n.content,
    status: n.status,
    sender_name: userMap[n.sender_ID]?.name || "Desconhecido",
    sender_type: userMap[n.sender_ID]?.type || "Desconhecido",
    recipient_name: userMap[n.recipient_ID]?.name || "Desconhecido",
    recipient_type: userMap[n.recipient_ID]?.type || "Desconhecido",
  }));

  res.json(response);
} catch (err) {
  console.error("Erro ao buscar notificações:", err);
  res.status(500).json({ error: "Erro ao buscar notificações" });
}};

const createNotification = async (req, res) => {
  const user = req.user;
  const { recipient_ID: bodyRecipientID, content } = req.body;

  const sender_ID = user.admin_ID || user.producer_ID;
  const sender_type = user.admin_ID ? "admin" : "producer";

let recipient_ID = bodyRecipientID;

if (!recipient_ID && sender_type === "producer") {
  const { data: adminList } = await supabase
    .from("user_admin")
    .select("admin_ID")
    .order("admin_ID", { ascending: true })
    .limit(1);

  if (!adminList || adminList.length === 0) {
    return res.status(400).json({ error: "Não há administradores disponíveis." });
  }

  recipient_ID = adminList[0].admin_ID;
}
  if (!recipient_ID) {
    return res.status(400).json({ error: "Informe o ID do destinatário." });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: "O conteúdo da notificação não pode estar vazio." });
  }

  const table = sender_type === "admin" ? "user_producer" : "user_admin";
  const column = sender_type === "admin" ? "producer_ID" : "admin_ID";

  const { data: recipient, error } = await supabase
    .from(table)
    .select(column)
    .eq(column, recipient_ID)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!recipient) {
    return res
      .status(400)
      .json({ error: "O destinatário não é um usuário válido." });
  }

  const { data, error: insertError } = await supabase
    .from("notifications")
    .insert([
      {
        sender_ID,
        recipient_ID,
        content,
        status: "Pendente",
      },
    ])
    .select()
    .single();

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res
    .status(201)
    .json({ message: "Notificação enviada com sucesso.", notification: data });
};

const updateNotification = async (req, res) => {
  const notification_id = req.params.ID;
  const { status } = req.body;

  try {
 
  if (!notification_id || !status) {
    return res.status(400).json({ error: "ID da notificação e status são obrigatórios." });
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ status })
    .eq("notification_id", notification_id)
    .select()

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Status atualizado com sucesso.", notification: data });
} catch (err) {
  console.error("Erro ao editar notificação:", err);
  res.status(500).json({ error: "Erro ao editar notificação" });
}};

const deleteNotification = async (req, res) => {
  const user = req.user;
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('notification_id', id);

      if (error) throw error;
      res.json({ message: 'Notificação removida com sucesso' });
    } catch (err) {
      console.error('Erro ao remover notificação:', err);
      res.status(500).json({ error: 'Erro ao remover notificação' });
    }};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
};
