import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../prisma";
import { inngest } from "./client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Runs every Sunday at midnight
  async ({ step }) => {
    // Step 1: Fetch industries from DB
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    // Step 2: Loop through each industry
    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
          "salaryRanges": [
            { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
          ],
          "growthRate": number,
          "demandLevel": "High" | "Medium" | "Low",
          "topSkills": ["skill1", "skill2"],
          "marketOutlook": "Positive" | "Neutral" | "Negative",
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }

        IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
        Include at least 5 common roles for salary ranges.
        Growth rate should be a percentage.
        Include at least 5 skills and trends.
      `;

      // Step 3: Generate content using Gemini
      const res = await step.ai.wrap(
        "gemini",
        async (p) => await model.generateContent(p),
        prompt
      );

      // Step 4: Safely extract text from Gemini response
      const candidate = res?.response?.candidate?.[0];
      const part = candidate?.content?.parts?.[0];
      const rawText = part?.text || "";

      if (!rawText) {
        console.warn(`No valid response for industry: ${industry}`);
        continue; // Skip this industry
      }

      // Step 5: Clean and parse JSON
      const cleanedText = rawText
        .replace(/```(?:json)?\n?/g, "")
        .replace(/```$/, "")
        .trim();

      let insights;
      try {
        insights = JSON.parse(cleanedText);
      } catch (err) {
        console.error(`Failed to parse JSON for ${industry}:`, cleanedText);
        continue; // Skip this industry
      }

      // Step 6: Update DB with insights
      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week later
          },
        });
      });
    }
  }
);
