"use server";

import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { generateAIInsights } from './dashboard';

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error('User not found');

  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: data.industry },
  });

  // Generate insights BEFORE transaction if needed
  let insights = null;
  if (!industryInsight) {
    insights = await generateAIInsights(data.industry);
  }

  try {
    const result = await db.$transaction(async (tx) => {
      // Create IndustryInsight if it doesn't exist
      if (!industryInsight) {
        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // Update user
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industryInsightId: industryInsight.id,
          experience: data.experience,
          bio: data.bio,
          skills: data.skills,
        },
      });

      return { updatedUser, industryInsight };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('Error updating user and industry:', error.message);
    throw new Error('Failed to update profile: ' + error.message);
  }
}
/** * Check if user has completed onboarding */
 export async function getUserOnboardingStatus() { 
  try { const { userId } = await auth(); 
  if (!userId) throw new Error('Unauthorized');
   const user = await db.user.findUnique({ 
    where: { clerkUserId: userId }, 
    select: { industryInsightId: true }, }); 
    return { isOnboarded: !!user?.industryInsightId }; } 
    catch (error) { console.error('Error checking onboarding status:', error); 
      throw new Error('Failed to check onboarding status'); } }