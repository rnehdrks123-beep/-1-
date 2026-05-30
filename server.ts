/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API Routes
app.post("/api/diagnose", async (req, res) => {
  try {
    const storeInfo = req.body;
    const {
      placeName,
      targetArea,
      mainMenu,
      keywords,
      useBooking,
      useTalkTalk,
      useCoupon,
      useSafeCall,
      visitorReviews,
      blogReviews
    } = storeInfo;

    const toolStatusText = `Booking(${useBooking ? "Registered" : "Not Registered"}), TalkTalk(${useTalkTalk ? "Registered" : "Not Registered"}), Coupon(${useCoupon ? "Registered" : "Not Registered"}), SafeCall(${useSafeCall ? "Registered" : "Not Registered"})`;

    const prompt = `
      너는 10년 경력의 네이버 플레이스 마케팅 전문 컨설턴트야.
      사장님께 신뢰를 주는 정밀 진단 보고서를 작성하고 반드시 JSON 형식으로 답변해. 모든 텍스트는 한국어로 전문성 있게 작성해.

      [입력 데이터]
      - 플레이스 등록명: ${placeName}
      - 상권: ${targetArea} / 업종: ${mainMenu}
      - 네이버 공식 도구 세팅 현황: ${toolStatusText}
      - 리뷰: 방문자 ${visitorReviews}개 / 블로그 ${blogReviews}개

      [보고서 포함 항목 지침]
      1. seoScore: (예: "35점") - 공식 도구 활용도와 리뷰 비율 등을 고려한 점수.
      2. seoRank: (예: "6~8페이지") - 현재 데이터 기반 예상 노출 위치.
      3. problem: 현재 도구 세팅 현황을 근거로, '미등록'된 도구들 때문에 네이버 알고리즘 가산점을 못 받고 있으며 이로 인해 순위 경쟁에서 심각하게 밀리고 있다는 점을 1~2줄로 진단.
      4. effect: 미등록 도구들을 즉시 등록하여 알고리즘 가산점을 확보했을 때, 검색 노출 순위가 회복되고 고객 유입이 얼마나 상승할지 기대 효과를 1~2줄로 작성.
      5. competitorCount: '${targetArea}' 지역 내 '${mainMenu}' 업종의 치열함을 고려해, 500m 반경 내 예상 경쟁 매장 수를 AI 알고리즘으로 추정해서 숫자와 '개' 단위만 출력 (예: "약 45개").
      6. competition: 추정한 경쟁 매장 수 대비 현재 리뷰 수준을 고려하여, 상권 내 순위가 하위 몇 % 수준인지 등 사장님께 위기감을 주는 내용 1~2줄.
      7. reviewProblem: 현재 리뷰 수치 진단 및 2일 차에 정밀 분석 솔루션을 주겠다는 안내를 1~2줄로 작성.

      보고서는 전문적이고 간결하며, 사장님이 즉시 행동(도구 등록)하고 싶게끔 위기감과 기대감을 동시에 줘야 해.
    `;

    const client = getAI();
    try {
      const result = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              seoScore: { type: Type.STRING },
              seoRank: { type: Type.STRING },
              problem: { type: Type.STRING },
              effect: { type: Type.STRING },
              competitorCount: { type: Type.STRING },
              competition: { type: Type.STRING },
              reviewProblem: { type: Type.STRING }
            },
            required: ["seoScore", "seoRank", "problem", "effect", "competitorCount", "competition", "reviewProblem"]
          }
        }
      });

      const responseText = result.text;
      if (!responseText) {
        throw new Error("AI 모델이 결과물을 생성하지 못했습니다.");
      }

      const diagnosis = JSON.parse(responseText);
      res.json(diagnosis);
    } catch (apiError: any) {
      console.error("Gemini API Error details:", apiError);
      
      // Handle the "high demand" 503 error gracefully
      if (apiError.status === "UNAVAILABLE" || apiError.code === 503) {
        res.status(503).json({ 
          error: "현재 이용자가 많아 지연되고 있습니다.", 
          detail: "잠시 후 다시 시도해주세요. (503)" 
        });
        return;
      }
      
      res.status(500).json({ 
        error: apiError.message || "Failed to generate diagnosis",
        detail: apiError.status || apiError.code
      });
    }

  } catch (error: any) {
    console.error("Diagnosis Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate diagnosis" });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Robust path for static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
