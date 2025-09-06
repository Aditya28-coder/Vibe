import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const FREEPOINTS = 5;
const PROPOINTS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const GENERATION_COST = 1; // 1 point per generation

export async function getUsageTracker(){
    const { has } = await auth();
    const hasProAccess = has({ plan: "pro"});

    const usageTracker = new RateLimiterPrisma({
        storeClient: prisma,
        tableName: "Usage",
        points: hasProAccess ? PROPOINTS : FREEPOINTS,
        duration: DURATION
    })
    return usageTracker;
}


export async function consumedCredits() {
    const { userId } = await auth();
    if (!userId){
        throw new Error("User Not authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result =  await usageTracker.consume(userId, GENERATION_COST);
    return result;
}

export async function getUsageStatus() {
    const { userId } = await auth();
    if (!userId){
        throw new Error("User Not authenticated");
    }

    const usageTracker = await getUsageTracker();
    const result =  await usageTracker.get(userId);
    return result;
}