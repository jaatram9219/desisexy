const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const url = 'https://desisexy-jaatram9219.aws-ap-south-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODM2NTE5NDUsImlkIjoiMDE5ZjQ5ZjAtNmUwMS03YjZhLWFhZmItODNjYzEzMGJkZDdmIiwia2lkIjoiUG5zdTNRdjc2R0NtV0c1YUNQWnNGMXRxSHRxRFo5R3FCOTFIOXJDcWxLVSIsInJpZCI6ImJjMDIzYzRkLWVjZGItNDhmNS05ZjA0LTI5NmJlNGVkMWM1ZCJ9.4Q_X4lD4Zg5mWMFsjjRu2CnWSU5uIMwtjiimu0IPiKwWhD3HF6a99PKgAj3jOPr14-o1OTGIvv_I4RogUJG-DA';

const adapter = new PrismaLibSql({ url, authToken });
const prisma = new PrismaClient({ adapter });

const gtmScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TSTMCVBJ');</script>
<!-- End Google Tag Manager -->`;

const gtmNoscript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSTMCVBJ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

async function main() {
  // Update ad_injection_head with the GTM script
  await prisma.setting.upsert({
    where: { key: 'ad_injection_head' },
    update: { value: gtmScript },
    create: { key: 'ad_injection_head', value: gtmScript }
  });

  // Update ad_injection_body with the GTM noscript (and clear raw URLs)
  await prisma.setting.upsert({
    where: { key: 'ad_injection_body' },
    update: { value: gtmNoscript },
    create: { key: 'ad_injection_body', value: gtmNoscript }
  });

  // Clear ad_injection_foot (remove raw URLs)
  await prisma.setting.upsert({
    where: { key: 'ad_injection_foot' },
    update: { value: '' },
    create: { key: 'ad_injection_foot', value: '' }
  });

  console.log('Successfully updated settings with GTM tags and cleared raw URLs.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
