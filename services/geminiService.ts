import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SalesInsight } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSalesData = async (transactions: Transaction[]): Promise<SalesInsight> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found. Returning mock insight.");
    return {
      summary: "ไม่พบ API Key ของ Gemini กรุณาตั้งค่าเพื่อใช้งาน AI",
      trend: "-",
      recommendation: "-"
    };
  }

  // Optimize token usage
  // Sending Cost and Price to calculate profit in AI analysis
  const dataContext = JSON.stringify(transactions.map(t => ({
    d: t.date,
    p: t.productName,
    c: t.category,
    price: t.price,
    cost: t.cost,
    qty: t.quantity,
    pl: t.platform
  })));

  const prompt = `
    คุณคือผู้ช่วยวิเคราะห์ธุรกิจสำหรับแม่ค้าออนไลน์ (Business Analyst)
    นี่คือข้อมูลรายการขาย (JSON) ที่มีต้นทุนและราคาขาย: ${dataContext}
    
    กรุณาวิเคราะห์และตอบกลับในรูปแบบ JSON ตาม Schema นี้เท่านั้น:
    1. summary: สรุปภาพรวมยอดขายและกำไร (Profit) สั้นๆ ว่าเดือนนี้กำไรดีไหม
    2. trend: แนวโน้มสินค้าที่ทำกำไรได้ดีที่สุด (High Profit Margin) หรือช่องทางที่กำไรดี
    3. recommendation: คำแนะนำในการลดต้นทุน หรือการดันสินค้าที่กำไรเยอะ 1 ข้อ
    
    ตอบเป็นภาษาไทยที่เข้าใจง่าย เป็นกันเอง เหมือนเพื่อนคู่คิด
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            trend: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ["summary", "trend", "recommendation"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SalesInsight;
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Error analyzing sales:", error);
    return {
      summary: "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล",
      trend: "ไม่สามารถระบุได้",
      recommendation: "กรุณาลองใหม่อีกครั้ง"
    };
  }
};