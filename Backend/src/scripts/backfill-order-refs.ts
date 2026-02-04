import { connect, disconnect, Types } from 'mongoose';
import { dbConnection } from '@databases';
import orderModel from '@/modules/orders/orders.model';

type IdCarrier = {
  _id?: unknown;
};

const getIdString = (value: unknown): string | null => {
  if (!value) return null;
  if (value instanceof Types.ObjectId) return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '_id' in (value as IdCarrier)) {
    const raw = (value as IdCarrier)._id;
    if (raw instanceof Types.ObjectId) return raw.toString();
    if (typeof raw === 'string') return raw;
  }
  return null;
};

const normalizeObjectId = (value: unknown): Types.ObjectId | null => {
  const id = getIdString(value);
  if (!id || !Types.ObjectId.isValid(id)) return null;
  return new Types.ObjectId(id);
};

const run = async (): Promise<void> => {
  await connect(dbConnection.url);

  const orders = await orderModel.find();
  let scannedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const order of orders) {
    scannedCount += 1;
    const updates: Record<string, unknown> = {};
    let hasChanges = false;

    const orderUserValue = order.user as unknown;
    const normalizedUserId = normalizeObjectId(orderUserValue);
    if (!normalizedUserId) {
      console.warn(`[backfill-orders] Order ${order._id} has invalid user ref`, order.user);
      skippedCount += 1;
    } else if (!(orderUserValue instanceof Types.ObjectId) || orderUserValue.toString() !== normalizedUserId.toString()) {
      updates.user = normalizedUserId;
      hasChanges = true;
    }

    let itemsChanged = false;
    const normalizedItems = order.items.map((item, index) => {
      const itemRecord = item as unknown as { toObject?: () => Record<string, unknown>; product?: unknown };
      const itemObject = typeof itemRecord.toObject === 'function' ? itemRecord.toObject() : { ...itemRecord };
      const normalizedProductId = normalizeObjectId(itemObject.product);
      if (!normalizedProductId) {
        console.warn(
          `[backfill-orders] Order ${order._id} item ${index} has invalid product ref`,
          itemObject.product,
        );
        return itemObject;
      }

      if (!(itemRecord.product instanceof Types.ObjectId)) {
        itemsChanged = true;
      }

      itemObject.product = normalizedProductId;
      return itemObject;
    });

    if (itemsChanged) {
      updates.items = normalizedItems;
      hasChanges = true;
    }

    if (hasChanges) {
      await orderModel.updateOne({ _id: order._id }, { $set: updates });
      updatedCount += 1;
    }
  }

  console.log(`[backfill-orders] scanned ${scannedCount}, updated ${updatedCount}, skipped ${skippedCount}.`);
  await disconnect();
};

run().catch((error) => {
  console.error('[backfill-orders] failed', error);
  process.exit(1);
});
