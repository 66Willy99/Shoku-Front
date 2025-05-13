const express      = require('express');
const bodyParser   = require('body-parser');
const cors         = require('cors');
const { WebpayPlus } = require('transbank-sdk');

// 1) Sandbox
WebpayPlus.configureForTesting();
const webpay = new WebpayPlus.Transaction();

// 2) Express + middlewares
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3) IP y puerto (cámbiala si es otra)
const YOUR_IP = '10.16.48.192';
const PORT    = 3000;

/**
 * 4) GET /pay?total=...&orderId=...
 *    → Crea la transacción y responde con un HTML
 *      que auto‐envía el token_ws a Transbank.
 */
app.get('/pay', async (req, res) => {
  const { total, orderId } = req.query;
  console.log('[Backend] /pay', { total, orderId });

  try {
    const { url, token } = await webpay.create(
      String(orderId),                 // buyOrder
      `ORD-${orderId}`,                // sessionId
      parseInt(String(total), 10),     // monto
      `http://${YOUR_IP}:${PORT}/web-return`
    );

    return res.send(`
      <html>
        <body>
          <form id="tpaga" action="${url}" method="POST">
            <input type="hidden" name="token_ws" value="${token}" />
          </form>
          <script>document.getElementById('tpaga').submit();</script>
          <p>Redirigiendo a Webpay…</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('[Backend] /pay error', err);
    return res.status(500).send('Error creando transacción');
  }
});

/**
 * 5) /web-return
 *    → Transbank redirige aquí con GET ?token_ws=…
 *    → Hacemos commit y redirigimos al deep‐link de la app (o al web fallback)
 */
app.get('/web-return', async (req, res) => {
  const token = req.query.token_ws;
  console.log('[Backend] /web-return token_ws=', token);

  let approved = false;
  try {
    const commitResp = await webpay.commit(String(token));
    approved = commitResp.response_code === 0;
    console.log('[Backend] commit response:', commitResp);
  } catch (e) {
    console.error('[Backend] commit error:', e);
  }

  // mobile deep-link
  const appLink = `myapp://payment-complete?token_ws=${token}&approved=${approved}`;
  // web fallback
  const webLink = `http://localhost:8081/estado?token_ws=${token}&approved=${approved}`;

  return res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0; URL='${appLink}'" />
      </head>
      <body>
        <p>Pago ${approved ? 'aprobado' : 'rechazado'}.</p>
        <p>Si estás en navegador, haz click <a href="${webLink}">aquí</a>.</p>
      </body>
    </html>
  `);
});

// 6) Levantar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Backend Webpay escuchando en http://${YOUR_IP}:${PORT}`);
});
