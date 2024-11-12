import { PrismaClient, Prisma } from '@prisma/client';
import { StoreService } from './store.service';

const prisma = new PrismaClient();

export class TransactionService {
  constructor(private storeService: StoreService) {}

  async createTransaction(data: {
    storeId: string;
    customerId?: string;
    totalAmount: Prisma.Decimal;
    paymentMethod: any;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          storeId: data.storeId,
          customerId: data.customerId,
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: 'COMPLETED',
          referenceNumber: await this.generateReferenceNumber(),
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: new Prisma.Decimal(item.quantity).mul(item.unitPrice)
            }))
          }
        },
        include: { items: true }
      });

      // Update inventory for each item
      for (const item of data.items) {
        await this.storeService.updateStoreProductQuantity(
          data.storeId,
          item.productId,
          -item.quantity
        );
      }

      return transaction;
    });
  }

  private async generateReferenceNumber(): Promise<string> {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.transaction.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    });
    return `TXN${date}${(count + 1).toString().padStart(4, '0')}`;
  }
}
