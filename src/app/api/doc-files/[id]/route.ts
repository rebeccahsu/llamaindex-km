import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { DocumentFileModel } from 'db/models';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const result = await DocumentFileModel.deleteOne({ _id: new ObjectId(id) });
    console.log('delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Document deleted successfully' }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
}
