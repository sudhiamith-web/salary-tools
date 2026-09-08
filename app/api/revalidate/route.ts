import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Configure this same secret as the webhook secret in Sanity's dashboard
// (Manage → API → Webhooks) and as SANITY_REVALIDATE_SECRET in Netlify's
// environment variables. This proves the request actually came from
// Sanity, not from someone guessing this URL.

interface WebhookPayload {
  _type: string;
  category?: "blog" | "news";
  slug?: { current?: string };
}

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<WebhookPayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "No document type in payload" }, { status: 400 });
    }

    if (body._type === "post" && body.category) {
      revalidateTag(`posts:${body.category}`);
      revalidatePath(`/${body.category}`);
      if (body.slug?.current) {
        revalidateTag(`post:${body.slug.current}`);
        revalidatePath(`/${body.category}/${body.slug.current}`);
      }
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: "Error revalidating", error: String(err) }, { status: 500 });
  }
}
