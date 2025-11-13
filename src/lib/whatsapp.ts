
import axios from "axios";

const token = process.env.WHATSAPP_TOKEN;
const phone_number_id = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to: string, message: string) {
  if (!token || !phone_number_id) {
    console.error("WhatsApp credentials are not set in environment variables.");
    throw new Error("Server is not configured to send WhatsApp messages.");
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${phone_number_id}/messages`;
    
    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("WhatsApp API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || "Failed to send WhatsApp message.");
  }
}
