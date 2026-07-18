const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const url = 'https://desisexy-jaatram9219.aws-ap-south-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NTE5NDUsImlkIjoiMDE5ZjQ5ZjAtNmUwMS03YjZhLWFhZmItODNjYzEzMGJkZDdmIiwia2lkIjoiUG5zdTNRdjc2R0NtV0c1YUNQWnNGMXRxSHRxRFo5R3FCOTFIOXJDcWxLVSIsInJpZCI6ImJjMDIzYzRkLWVjZGItNDhmNS05ZjA0LTI5NmJlNGVkMWM1ZCJ9.4Q_X4lD4Zg5mWMFsjjRu2CnWSU5uIMwtjiimu0IPiKwWhD3HF6a99PKgAj3jOPr14-o1OTGIvv_I4RogUJG-DA';

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

async function main() {
  const videos = await prisma.video.findMany({
    take: 5
  });
  console.log('Videos:', JSON.stringify(videos, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
