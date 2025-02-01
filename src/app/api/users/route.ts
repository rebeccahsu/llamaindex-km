import { NextRequest, NextResponse } from "next/server";
import { Base64 } from "js-base64";
import { Types } from "mongoose";
import { UserDocument, UserModel } from "db/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    console.log('query:', query)

    const limitValue = parseInt(query.limit) ?? 20;

    const pagingQuery = (() => {
      if (!query.anchor) {
        return {}
      }

      const idString = Base64.decode(query.anchor as string)
      const id = new Types.ObjectId(idString)

      return {
        $or: [
          {
            _id: { $gt: id }
          }
        ]
      }
    })()

    const docs = await UserModel
      .find(pagingQuery)
      .sort({ _id: 1 })
      .limit(limitValue + 1)

    const limited = docs.slice(0, limitValue)
    const last = limited[limited.length - 1]

    const list = limited.map((entry: UserDocument) => ({
      id: entry._id,
      name: entry.name,
      email: entry.email,
      department: entry.department
    }))

    if (docs.length > limitValue && last) {

      return NextResponse.json({
        list,
        anchor: Base64.encode(`${last._id}`)
      })
    }

    return NextResponse.json({ list, anchor: null })

  } catch (error) {
    console.error("[API] users list", error, (error as Error).message);
    // throw new Error(`Import API Error: ${(error as Error).message}`);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
