import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { TransactionService } from '../services/transaction.service';
import { StoreService } from '../services/store.service';

const prisma = new PrismaClient();
const storeService = new StoreService();
const transactionService = new TransactionService(storeService);

export const syncStoreProducts = async (req: Request, res: Response) => {
  const { storeId, lastSyncTimestamp } = req.body;

  const updates = await prisma.storeProduct.findMany({
    where: {
      storeId,
      updatedAt: {
        gt: new Date(lastSyncTimestamp)
      },
      product: { isDeleted: false }
    },
    include: { product: true }
  });

  res.json({ updates, syncTimestamp: new Date().toISOString() });
};

export const syncTransactions = async (req: Request, res: Response) => {
  const { storeId, transactions } = req.body;

  const results = [];

  for (const transaction of transactions) {
    const result = await transactionService.createTransaction({
      storeId,
      totalAmount: new Prisma.Decimal(transaction.totalAmount),
      paymentMethod: transaction.paymentMethod as any,
      items: transaction.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice)
      }))
    });

    results.push(result);
  }

  res.json({
    success: true,
    syncedTransactions: results,
    syncTimestamp: new Date().toISOString()
  });
};
