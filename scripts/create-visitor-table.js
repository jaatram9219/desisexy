const url = (process.env.TURSO_DATABASE_URL || 'libsql://desisexy-jaatram9219.aws-ap-south-1.turso.io').replace('libsql://', 'https://') + '/v2/pipeline';
const token = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NTE5NDUsImlkIjoiMDE5ZjQ5ZjAtNmUwMS03YjZhLWFhZmItODNjYzEzMGJkZDdmIiwia2lkIjoiUG5zdTNRdjc2R0NtV0c1YUNQWnNGMXRxSHRxRFo5R3FCOTFIOXJDcWxLVSIsInJpZCI6ImJjMDIzYzRkLWVjZGItNDhmNS05ZjA0LTI5NmJlNGVkMWM1ZCJ9.4Q_X4lD4Zg5mWMFsjjRu2CnWSU5uIMwtjiimu0IPiKwWhD3HF6a99PKgAj3jOPr14-o1OTGIvv_I4RogUJG-DA';

const stmts = [
  `CREATE TABLE IF NOT EXISTS "VisitorLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "VisitorLog_date_ipHash_key" ON "VisitorLog"("date", "ipHash");`
];

async function main() {
  const requests = stmts.map(stmt => ({
    type: 'execute',
    stmt: { sql: stmt }
  }));
  requests.push({ type: 'close' });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ requests })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
