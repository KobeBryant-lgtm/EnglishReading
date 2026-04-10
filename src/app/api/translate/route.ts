import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text, targetLang = "ZH" } = await request.json();

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "请提供要翻译的文本" }, { status: 400 });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  const apiUrl = process.env.DEEPL_API_URL || "https://api-free.deepl.com/v2";

  if (!apiKey || apiKey === "your_deepl_api_key_here") {
    return NextResponse.json({
      translatedText: `[翻译功能未配置] 请在 .env.local 中设置 DEEPL_API_KEY。原文: ${text.substring(0, 100)}...`,
      source: "fallback",
    });
  }

  try {
    const response = await fetch(`${apiUrl}/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        target_lang: targetLang,
        source_lang: "EN",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepL API error:", errorText);
      return NextResponse.json(
        { error: "翻译服务暂时不可用" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const translatedText = data.translations?.[0]?.text || text;

    return NextResponse.json({
      translatedText,
      source: "deepl",
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "翻译请求失败" },
      { status: 500 }
    );
  }
}
