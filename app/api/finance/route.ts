import { NextRequest, NextResponse } from "next/server";
import { fetchFromProvider } from "@/lib/finance/fetchFromProvider";
import { FinanceRequestPayload } from "@/lib/finance/types";

export async function POST(req: NextRequest) {
    try {
        const body: FinanceRequestPayload = await req.json();

        // Validate request
        if (!body.provider || !body.endpoint) {
            return NextResponse.json(
                { error: true, message: "provider and endpoint are required" },
                { status: 400 }
            );
        }

        // Fetch data from provider (API keys are secure on server)
        const data = await fetchFromProvider(body);

        return NextResponse.json({ data }, { status: 200 });
    } catch (err: any) {
        console.error("Finance API error:", err);

        const statusCode = err.response?.status || 500;
        const message = err.message || "Something went wrong";

        return NextResponse.json(
            {
                error: true,
                message,
            },
            { status: statusCode }
        );
    }
}
