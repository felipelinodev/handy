const crypto = require('crypto');
function genToken(secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const payload = Buffer.from(JSON.stringify({role:'developer',sub:'api-consumer',iat:1777929509})).toString('base64').replace(/=/g, '');
  const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64').replace(/=/g, '');
  const tokenStr = header + '.' + payload;
  hmac.update(tokenStr);
  const sig = hmac.digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return tokenStr + '.' + sig;
}
console.log('Token sem aspas:', genToken('dev@han3#2026s'));
console.log('Token com aspas:', genToken('"dev@han3#2026s"'));
