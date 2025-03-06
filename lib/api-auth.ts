import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";


export async function getUserId(request: NextRequest): Promise<string> {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
        throw new Error("No token provided");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decodedToken.userId;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error("Token has expired");
        }
        throw error; // Re-throw other JWT errors
    }
}