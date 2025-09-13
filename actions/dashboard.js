"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate AI-powered industry insights
 */
export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
      "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
    }

    IMPORTANT:
    - Return ONLY the JSON (no markdown, no text before/after).
    - Use ONLY uppercase values for enums (HIGH, MEDIUM, LOW, POSITIVE, NEUTRAL, NEGATIVE).
    - Include at least 5 common roles for salary ranges.
    - Growth rate should be a percentage (e.g., 12.5).
    - Include at least 5 skills and trends.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean any accidental markdown
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

/**
 * Get industry insights for the current authenticated user
 */
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist, generate and save them
  if (!user.industryInsight) {
    // ❗ Replace this with real industry (from user profile or UI)
    const industry = "Software";

    const insights = await generateAIInsights(industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        users: {
          connect: { id: user.id }, // link IndustryInsight to User
        },
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
