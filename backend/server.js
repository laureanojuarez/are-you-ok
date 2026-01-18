const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Configurar Twilio para WhatsApp
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Endpoint para registrar check-in
app.post("/api/checkin", async (req, res) => {
  try {
    const { userId, userName, email } = req.body;

    const checkInData = {
      userId,
      userName,
      email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      alertSent: false,
      nextAlertTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
    };

    await db.collection("checkIns").doc(userId).set(checkInData);

    res.json({ success: true, message: "Check-in registrado" });
  } catch (error) {
    console.error("Error en check-in:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Función para enviar mensaje de WhatsApp
async function sendWhatsAppAlert(phoneNumber, userName) {
  try {
    const message = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: `⚠️ ALERTA DE EMERGENCIA\n\n${userName} no ha confirmado que está bien en las últimas 48 horas. Por favor, verifica su estado lo antes posible.\n\nEste es un mensaje automático del sistema Are You OK.`,
    });

    console.log(`✅ Mensaje enviado a ${phoneNumber}:`, message.sid);
    return true;
  } catch (error) {
    console.error(`❌ Error enviando mensaje a ${phoneNumber}:`, error);
    return false;
  }
}

// Verificar check-ins cada 5 minutos
cron.schedule("*/5 * * * *", async () => {
  console.log("🔍 Verificando check-ins...");

  try {
    const now = new Date();
    const checkInsSnapshot = await db
      .collection("checkIns")
      .where("alertSent", "==", false)
      .where("nextAlertTime", "<=", now)
      .get();

    if (checkInsSnapshot.empty) {
      console.log("✅ No hay alertas pendientes");
      return;
    }

    for (const doc of checkInsSnapshot.docs) {
      const checkInData = doc.data();
      const userId = checkInData.userId;

      // Obtener datos del usuario
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        console.log(`⚠️ Usuario ${userId} no encontrado`);
        continue;
      }

      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];
      const userName = userData.name || checkInData.userName || "Usuario";

      console.log(`📧 Enviando alertas para ${userName}...`);

      // Enviar alertas a todos los contactos
      for (const contact of emergencyContacts) {
        await sendWhatsAppAlert(contact.phone, userName);
      }

      // Marcar como alerta enviada
      await db.collection("checkIns").doc(userId).update({
        alertSent: true,
        alertSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Alertas enviadas para ${userName}`);
    }
  } catch (error) {
    console.error("❌ Error en cron job:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
