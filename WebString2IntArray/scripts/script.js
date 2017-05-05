var galaxy;

$(document).ready(function () {
    var input1 = document.getElementById('input1');
    var form1 = document.getElementById('form1');
    var table = document.getElementById('outputTable');
    var inputParseSym = document.getElementById('inputParseSym');
    var isCode = document.getElementById('isCode');
    var outValues = document.getElementById('outputValues');

    if (form1.attachEvent) {
        form1.attachEvent("submit", processForm);
    } else {
        form1.addEventListener("submit", processForm);
    }
    input1.addEventListener('input', processInput1);
    inputParseSym.addEventListener('input', parseInput1);
    isCode.addEventListener('change', parseInput1)
    input1.focus();
    if (!String.prototype.leftPad) {
        String.prototype.leftPad = function (length, str) {
            if (this.length >= length) {
                return this;
            }
            str = str || ' ';
            return (new Array(Math.ceil((length - this.length) / str.length)).join(' ')) + str;
        };
    };

    function processInput1(e) {
        table.innerHTML = Str2IntArr(input1.value);
        parseInput1();
    };

    function parseInput1() {
        if (inputParseSym.value) {
            var parseSym = inputParseSym.value;
            if (isCode.checked) {
                parseSym = Number(parseSym);
                if (parseSym == 'NaN') {
                    parseSym = inputParseSym.value;
                }
                else {
                    parseSym = String.fromCharCode(Number(parseSym));
                };
            };
            //console.log(parseSym);
            var strArr = input1.value.split(parseSym);
            outValues.innerHTML = '';
            for (var i = 0; i < strArr.length; i++) {
                outValues.innerHTML += '<pre>' + strArr[i] + '</pre><br />';
            };
        }
        else {
            outValues.innerHTML = input1.value;
        };
    };

    function processForm(e) {
        if (e.preventDefault)
            e.preventDefault();
        table.innerHTML = Str2IntArr(input1.value);
        console.log('processForm');
    };

    galaxy = new Galaxy(document.getElementById('galaxy-wrapper'), 3);
    //galaxy = new Galaxy(null, 3);
    
    document.getElementById('galaxy-pause').addEventListener('click', function () {
        if (galaxy.getIsRun()) {
            galaxy.Stop();
        }
        else {            
            galaxy.Start();
        };
    });
    document.getElementById('galaxy-tracked').addEventListener('click', function () {
        if (galaxy.getIsRun()) {
            galaxy.setMouseIsTracked(!galaxy.getMouseIsTracked());
        };
    });
    document.getElementById('galaxy-stop').addEventListener('click', function () {
        galaxy.Clear();
    });
});


function Str2IntArr(str) {
    var strCodeArr = Array.from(str);
    var strCode = '<tr>';
    var strOut = '<tr>';
    for (var i = 0; i < strCodeArr.length; i++) {
        var sym = str.charCodeAt(i).toString();
        strCode += '<td>' + sym + '</td>';
        strOut+= '<td>' + strCodeArr[i] + '</td>';
    };
    return strCode + strOut;
};