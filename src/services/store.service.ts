import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class StoreService {
  async createStore(data: Prisma.StoreCreateInput) {
    return prisma.store.create({ data });
  }

  async getStoreProducts(storeId: string) {
    return prisma.storeProduct.findMany({
      where: { storeId, product: { isDeleted: false } },
      include: { product: true }
    });
  }

  async updateStoreProductQuantity(
    storeId: string,
    productId: string,
    quantity: number
  ) {
    return prisma.$transaction(async (tx) => {
      const storeProduct = await tx.storeProduct.findUnique({
        where: { storeId_productId: { storeId, productId } }
      });

      if (!storeProduct) {
        throw new Error('Store product not found');
      }

      if (storeProduct.currentQuantity + quantity < 0) {
        throw new Error('Insufficient quantity');
      }

      return tx.storeProduct.update({
        where: { storeId_productId: { storeId, productId } },
        data: {
          currentQuantity: storeProduct.currentQuantity + quantity,
          version: { increment: 1 },
          lastSyncAt: new Date()
        }
      });
    });
  }
}
