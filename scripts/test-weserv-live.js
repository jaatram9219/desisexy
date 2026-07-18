async function test() {
  const targetUrl = 'https://static-sg-cdn.eporner.com/thumbs/static4/1/17/176/17686458/8_240.jpg';
  const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(targetUrl)}`;
  try {
    const res = await fetch(proxyUrl);
    console.log('Weserv CDN Status:', res.status);
    console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2));
    if (!res.ok) {
      const text = await res.text();
      console.log('Error text:', text);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
