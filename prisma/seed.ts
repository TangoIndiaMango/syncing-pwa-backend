import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  // Seed stores
  const stores = await Promise.all([
    prisma.store.create({
      data: {
        name: 'Main Store',
        location: 'Downtown'
      }
    }),
    prisma.store.create({
      data: {
        name: 'Branch 1',
        location: 'Uptown'
      }
    }),
    prisma.store.create({
      data: {
        name: 'Branch 2',
        location: 'Suburb'
      }
    })
  ]);

  // Seed products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Product 1',
        basePrice: new Prisma.Decimal(99.99),
        sku: 'SKU001',
        barcode: 'BAR001',
        category: 'Electronics'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Product 2',
        basePrice: new Prisma.Decimal(49.99),
        sku: 'SKU002',
        barcode: 'BAR002',
        category: 'Clothing'
      }
    })
  ]);

  // Seed store products
  for (const store of stores) {
    await Promise.all(
      products.map(product =>
        prisma.storeProduct.create({
          data: {
            storeId: store.id,
            productId: product.id,
            currentQuantity: Math.floor(Math.random() * 100) + 50,
            price: new Prisma.Decimal(
              product.basePrice.toNumber() * (1 + Math.random() * 0.2)
            ),
            minQuantity: 10
          }
        })
      )
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
