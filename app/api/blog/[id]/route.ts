import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
        }

        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                sections: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (err: any) {
        console.error("Fetch Blog Error:", err);
        return NextResponse.json(
            { error: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}
