import { supabase } from "../lib/supabase";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

const FUNCTION_URL = "https://hwpvusxzfzmnbcvztrzc.supabase.co/functions/v1/telegram-auth";

export async function signInWithTelegram(tgUser: TelegramUser): Promise<void> {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tgUser),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Ошибка авторизации через Telegram");
  }

  const { action_link } = await res.json();
  if (!action_link) throw new Error("Не удалось получить ссылку для входа");

  // Exchange the magic link for a session — Supabase verifyOtp with type=magiclink
  const url = new URL(action_link);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as "magiclink";

  if (!tokenHash) throw new Error("Неверный формат ссылки");

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) throw new Error(error.message);
}

export function loadTelegramWidget(
  botName: string,
  onAuth: (user: TelegramUser) => void
) {
  window.onTelegramAuth = onAuth;

  const existing = document.getElementById("telegram-widget-script");
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = "telegram-widget-script";
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.setAttribute("data-telegram-login", botName);
  script.setAttribute("data-size", "large");
  script.setAttribute("data-radius", "12");
  script.setAttribute("data-onauth", "onTelegramAuth(user)");
  script.setAttribute("data-request-access", "write");
  script.async = true;
  return script;
}
