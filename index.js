const express = require('express');
const app = express();

app.set('view engine', 'pug')

const POLISH_TEXT = {
    MAIN_TITLE: 'Bezpesktowe',
    P1_T1: `
        Bezpestkowe to projekt założony
        w 2018 roku, którego celem jest nie
        tylko aktywne wspieranie osób z
        zespołem Mayera-Rokitansky’egoKüstera-Hausera, ale również
        uświadamianie i edukowanie
        społeczeństwa. Nazwa nawiązuje do
        pestki owocu i przyrównania jej do
        macicy — owoce pestkowe różnią się
        od bezpestkowych tylko
        <strong> posiadaniem pestki, która przecież niczego nie definiuje.  </strong>
    `,
    P2_T1: `

    `
}

app.get('/', (req, res) => {
    res.render('mobile/index', POLISH_TEXT);
});

app.listen(9000, () => {
    console.log('listening')
});