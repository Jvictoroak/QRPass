import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("TICKET_FROM_EMAIL") ?? "QRPass <onboarding@resend.dev>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, attendeeName, eventName, eventDate, registrationCode } =
      await req.json();

    if (!email || !registrationCode) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(registrationCode)}`;

    const html = `
      <div style="font-family: sans-serif; background:#0B0B0F; padding: 32px; color:#fff;">
        <h1 style="font-size: 20px; margin-bottom: 4px;">Seu ingresso para ${eventName}</h1>
        <p style="color:#9C9CA3; margin-top: 0;">${eventDate ?? ""}</p>
        <p>Olá, ${attendeeName ?? ""}! Sua inscrição foi confirmada. Apresente o QR code abaixo na entrada.</p>
        <div style="background:#fff; padding:24px; border-radius:16px; text-align:center; margin-top:16px;">
          <img src="${qrImageUrl}" alt="QR code do ingresso" width="220" height="220" />
          <p style="color:#555; margin-top:12px; font-family: monospace; font-size: 12px;">
            ${registrationCode}
          </p>
        </div>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: `Seu ingresso: ${eventName}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      return new Response(JSON.stringify({ error: errorBody }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
