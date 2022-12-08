angular.module('myApp', []).controller('table', ['$scope', function ($scope) {
    $scope.teste = 'hghgh';
    $scope.operacoes = [];
    $scope.respostas = [];
    $scope.qtlinhasmulti = 20;
    $scope.qtlinhasdiv = 20;
    $scope.qtlinhasadd = 20;
    $scope.qtlinhassub = 20;
    $scope.fixedQtLinhas = 0;
    $scope.valor = 100;
    $scope.fixedvalor = 100;
    $scope.memoResult = [];
    $scope.cronometro = 0;
    $scope.cronoplay = false;
    $scope.cronocomeco = null;
    $scope.cronostart = () => {
        $scope.cronocomeco = new Date().getTime() - $scope.cronometro;
        $scope.cronoplay = true;
    };
    $scope.cronorestart = () => {
        $scope.cronometro = 0;
    };
    $scope.cronopause = () => {
        $scope.cronoplay = false;
    };
    setInterval(() => {
        if ($scope.cronoplay) {
            $scope.cronometro = new Date().getTime() - $scope.cronocomeco;
            $scope.$apply();
        }
    }, 9);
    document.addEventListener('keydown', (ev) => {
        if (!$scope.operacoes.length)
            return;
        if (ev.which === 80) {
            ev.preventDefault();
            $scope.cronoplay ? $scope.cronopause() : $scope.cronostart();
            $scope.$apply();
        } else if (ev.which === 82 && !$scope.cronoplay) {
            ev.preventDefault();
            $scope.cronorestart();
            $scope.$apply();
        }
    });
    $scope.novojogo = () => {
        $scope.fixedvalor = +($scope.valor.toString().replace(',', '.'));
        $scope.fixedQtLinhas = +$scope.qtlinhasmulti + +$scope.qtlinhasdiv + +$scope.qtlinhasadd + +$scope.qtlinhassub;
        $scope.div = Math.floor($scope.fixedQtLinhas / 4);
        $scope.mod = $scope.fixedQtLinhas % 4;
        $scope.qt = [0, 1, 2, 3].map(v => $scope.div + (v < $scope.mod ? 1 : 0));
        $scope.first = [0, 0, 0, 0];
        for (let i = 1; i < 4; i++)
            $scope.first[i] = $scope.first[i - 1] + $scope.qt[i - 1];
        const ran = (min, max) => {
            let r = Math.floor(Math.random() * (max - min + 1)) + min;
            return r === min || r === max ? Math.floor(Math.random() * (max - min + 1)) + min : r;
        };
        const opmulti = new Array(+$scope.qtlinhasmulti).fill(0).map(() => [ran(0, 10), ran(0, 10), 'multi']);
        const opdiv = new Array(+$scope.qtlinhasdiv).fill(0).map(() => [ran(1, 10), ran(0, 10)]).map(v => [v[0] * v[1], v[0], 'div']);
        const opadd = new Array(+$scope.qtlinhasadd).fill(0).map(() => ran(0, 10)).map(v => [v, ran(0, v)]).map(v => [v[1], v[0] - v[1], 'add']);
        const opsub = new Array(+$scope.qtlinhasadd).fill(0).map(() => ran(0, 10)).map(v => [v, ran(0, v), 'sub']);
        $scope.operacoes = [...opmulti, ...opdiv, ...opadd, ...opsub];
        let m = $scope.fixedQtLinhas, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = $scope.operacoes[m];
            $scope.operacoes[m] = $scope.operacoes[i];
            $scope.operacoes[i] = t;
        }
        $scope.respostas = new Array($scope.fixedQtLinhas).fill('');
        $scope.memoResult = new Array($scope.fixedQtLinhas).fill(undefined);
    };
    $scope.result = (idx) => {
        let resposta = $scope.respostas[idx];
        if (!resposta) {
            $scope.memoResult[idx] = null;
        } else {
            const operacao = $scope.operacoes[idx];
            const op = operacao[2];
            const a = operacao[0];
            const b = operacao[1];
            const number = op === 'multi' ? a * b : op === 'div' ? a / b : op === 'add' ? a + b : a - b;
            $scope.memoResult[idx] = +resposta === number;
        }
    };
    $scope.certas = () => $scope.memoResult.reduce((p, v) => p + (v ? 1 : 0), 0);
    $scope.erradas = () => $scope.memoResult.reduce((p, v) => p + (v === false ? 1 : 0), 0);
    $scope.brancas = () => $scope.memoResult.reduce((p, v) => p + (v === null ? 1 : 0), 0);
    $scope.progresso = () => {
        let primeiro = $scope.certas() * 100 / ($scope.fixedQtLinhas || 1);
        let segundo = primeiro + $scope.erradas() * 100 / ($scope.fixedQtLinhas || 1);
        let terceiro = segundo + $scope.brancas() * 100 / ($scope.fixedQtLinhas || 1);
        return {'background-image': `linear-gradient(to right, lime 0%, lime ${primeiro}%, red ${primeiro}%, red ${segundo}%, lightgray ${segundo}%, lightgray ${terceiro}%, gray ${terceiro}%, gray 100%)`};
    };
    $scope.calctab = (idx) => $scope.first[(idx % 4)] + Math.floor(idx / 4);
    $scope.prox = (ev, idx) => {
        if (ev.which === 13) {
            idx = ($scope.calctab(idx) + 4) % $scope.fixedQtLinhas;
            $(`.inputnumeral[tabindex="${idx}"]`).focus();
        }
    }
}])
    .filter('percent', () => ((v) => (v * 100).toFixed(0) + '%'))
    .filter('nota', () => ((v) => v.toFixed(1).replace('.', ',')))
    .filter('tempo', () => ((v) => {
        let n = +v;
        const m = Math.floor(n / (60 * 1000));
        n -= m * (60 * 1000);
        const s = Math.floor(n / 1000);
        n -= s * 1000;
        return `${`00${m}`.slice(-2)}:${`00${s}`.slice(-2)}:${`000${n}`.slice(-3)}`;
    }));
