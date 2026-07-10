const url = (process.env.TURSO_DATABASE_URL || 'libsql://desisexy-jaatram9219.aws-ap-south-1.turso.io').replace('libsql://', 'https://') + '/v2/pipeline';
const token = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NTE5NDUsImlkIjoiMDE5ZjQ5ZjAtNmUwMS03YjZhLWFhZmItODNjYzEzMGJkZDdmIiwia2lkIjoiUG5zdTNRdjc2R0NtV0c1YUNQWnNGMXRxSHRxRFo5R3FCOTFIOXJDcWxLVSIsInJpZCI6ImJjMDIzYzRkLWVjZGItNDhmNS05ZjA0LTI5NmJlNGVkMWM1ZCJ9.4Q_X4lD4Zg5mWMFsjjRu2CnWSU5uIMwtjiimu0IPiKwWhD3HF6a99PKgAj3jOPr14-o1OTGIvv_I4RogUJG-DA';

const stmt = `CREATE TABLE IF NOT EXISTS "Comment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Comment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);`;

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql: stmt } },
        { type: 'close' }
      ]
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
