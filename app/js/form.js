'use strict';
var male = document.querySelector('#male');
var female = document.querySelector('#female');

var createMaleOptions = function () {
    var select = document.querySelector('#status');
    var fragment = document.createDocumentFragment();
    var statusArray = ['', 'женат', 'в гражданском браке', 'разведен', 'холост', 'вдовец'];
    select.innerHTML = '';
    for (var i = 0; i < statusArray.length; i++) {
        var option = document.createElement('option');
        option.value = statusArray[i];
        option.innerHTML = statusArray[i];
        select.appendChild(option);
    }
    select.appendChild(fragment);
};
var createFemaleOptions = function () {
    var select = document.querySelector('#status');
    var fragment = document.createDocumentFragment();
    var statusArray = ['', 'замужем', 'в гражданском браке', 'разведена', 'не замужем', 'вдова'];
    select.innerHTML = '';
    for (var i = 0; i < statusArray.length; i++) {
        var option = document.createElement('option');
        option.value = statusArray[i];
        option.innerHTML = statusArray[i];
        select.appendChild(option);
    }
    select.appendChild(fragment);
};
male.addEventListener('click', createMaleOptions);
female.addEventListener('click', createFemaleOptions);


var form = document.querySelector('#form');
var elems = form.querySelectorAll('input');
var button = form.querySelector('#button');
var dates = form.querySelectorAll('#day, #month, #year');
var day = form.querySelector('#day');
var month = form.querySelector('#month');
var year = form.querySelector('#year');
var birthday = form.querySelector('.birthday-block');
var phone = form.querySelector('#phone');

var alert = form.querySelector('.alert');

var curDate = new Date();
var checkDate = false;
var checkRequirements = false;

var phoneMask = new IMask(phone, {
    mask: '+{7}(000)000-00-00',
    lazy: false
});

Array.prototype.forEach.call(elems, function (elem) {
    elem.addEventListener('input', validateForm);
});

function validateForm() {
    checkRequirements = Array.prototype.every.call(elems, function (item) {
        return Boolean(item.value) && item.checkValidity();
    });

    if (checkRequirements && checkDate) {
        button.removeAttribute('disabled');
        return;
    }

    button.setAttribute('disabled', true);
}

function deactivateBlock () {
    alert.classList.add('hidden');
    birthday.classList.remove('birthday-block--active');
}
function activateBlock() {
    alert.classList.remove('hidden');
    birthday.classList.add('birthday-block--active');
}
function validBirthDay() {
    deactivateBlock();
    checkDate = true;
}

function invalidBirthDay() {
    activateBlock();
    checkDate = false;
}

Array.prototype.forEach.call(dates, function (elem) {
    elem.addEventListener('change', function (e) {
        var curYear = curDate.getFullYear();
        var curDay = curDate.getDate();
        var curMonth = curDate.getMonth();

        var uYear = Number(year.value);
        var uDay = Number(day.value);
        var uMonth = Number(month.value);

        if (uYear === 0) {
            validateForm();
            return;
        }
        if (curYear - uYear > 90) {
            invalidBirthDay();
            validateForm();
            return;
        }

        if (curYear - uYear < 90) {
            validBirthDay();
            validateForm();
            return;
        }

        if (curMonth - uMonth < 0) {
            validBirthDay();
            validateForm();
            return;
        }

        if ((curMonth === uMonth) && (uDay - curDay > 0)) {
            validBirthDay();
            validateForm();
            return;
        }

        invalidBirthDay();
        validateForm();
    });
});

document.querySelector('[name="name-1"]').addEventListener('keyup', function (e) {
    document.querySelector('[name="name-3"]').value = translit(e.target.value, 5);
});

document.querySelector('[name="name-2"]').addEventListener('keyup', function (e) {
    document.querySelector('[name="name-4"]').value = translit(e.target.value, 5);
});


function translit(str, typ) {
    var func = (function (typ) {
        /** Function Expression
         * Вспомогательная функция.
         *
         * FINISHED TESTED!
         * В ней и хотелось навести порядок.
         *
         * Проверяет направление транслитерации.
         * Возвращает массив из 2 функций:
         *  построения таблиц транслитерации.
         *  и пост-обработки строки (правила из ГОСТ).
         *
         * @param  {Number} typ
         * @return {Array}  Массив функций пред и пост обработки.
         **/
        function prep(a) {
            var write = !a ? function (chr, row) {
                    trantab[row] = chr;
                    regarr.push(row);
                } :
                function (row, chr) {
                    trantab[row] = chr;
                    regarr.push(row);
                };
            return function (col, row) {        // создаем таблицу и RegExp
                var chr = col[abs] || col[0];    // Символ
                if (chr) write(chr, row);        // Если символ есть
            }
        }

        var abs = Math.abs(typ);             // Абсолютное значение транслитерации
        if (typ === abs) {                   // Прямая транслитерация в латиницу
            str = str.replace(/(i(?=.[^аеиоуъ\s]+))/ig, '$1`'); // "i`" ГОСТ ст. рус. и болг.
            return [prep(),                    // Возвращаем массив функций
                function (str) {                  // str - транслируемая строка.
                    return str.replace(/i``/ig, 'i`').// "i`" в ГОСТ ст. рус. и болг.
                    replace(/((c)z)(?=[ieyj])/ig, '$1'); // "cz" в символ "c"
                }];
        } else {                             // Обратная транслитерация в кириллицу
            str = str.replace(/(c)(?=[ieyj])/ig, '$1z'); // Правило сочетания "cz"
            return [prep(1), function (str) {
                return str;
            }];// nop - пустая функция.
        }
    }(typ));
    var iso9 = {                           // Объект описания стандарта
        // Имя - кириллица
        //   0 - общие для всех
        //   1 - диакритика         4 - MK|MKD - Македония
        //   2 - BY|BLR - Беларусь  5 - RU|RUS - Россия
        //   3 - BG|BGR - Болгария  6 - UA|UKR - Украина
        /*-Имя---------0-,-------1-,---2-,---3-,---4-,----5-,---6-*/
        '\u0449': ['', '\u015D', '', 'sth', '', 'shh', 'shh'], // 'щ'
        '\u044F': ['', '\u00E2', 'ya', 'ya', '', 'ya', 'ya'], // 'я'
        '\u0454': ['', '\u00EA', '', '', '', '', 'ye'], // 'є'
        '\u0463': ['', '\u011B', '', 'ye', '', 'ye', ''], //  ять
        '\u0456': ['', '\u00EC', 'i', 'i`', '', 'i`', 'i'], // 'і' йота
        '\u0457': ['', '\u00EF', '', '', '', '', 'yi'], // 'ї'
        '\u0451': ['', '\u00EB', 'yo', '', '', 'yo', ''], // 'ё'
        '\u044E': ['', '\u00FB', 'yu', 'yu', '', 'yu', 'yu'], // 'ю'
        '\u0436': ['zh', '\u017E'],                                 // 'ж'
        '\u0447': ['ch', '\u010D'],                                 // 'ч'
        '\u0448': ['sh', '\u0161', '', '', '', '', ''], // 'ш'
        '\u0473': ['', 'f\u0300', '', 'fh', '', 'fh', ''], //  фита
        '\u045F': ['', 'd\u0302', '', '', 'dh', '', ''], // 'џ'
        '\u0491': ['', 'g\u0300', '', '', '', '', 'g`'], // 'ґ'
        '\u0453': ['', '\u01F5', '', '', 'g`', '', ''], // 'ѓ'
        '\u0455': ['', '\u1E91', '', '', 'z`', '', ''], // 'ѕ'
        '\u045C': ['', '\u1E31', '', '', 'k`', '', ''], // 'ќ'
        '\u0459': ['', 'l\u0302', '', '', 'l`', '', ''], // 'љ'
        '\u045A': ['', 'n\u0302', '', '', 'n`', '', ''], // 'њ'
        '\u044D': ['', '\u00E8', 'e`', '', '', 'e`', ''], // 'э'
        '\u044A': ['', '\u02BA', '', 'a`', '', '``', ''], // 'ъ'
        '\u044B': ['', 'y', 'y`', '', '', 'y`', ''], // 'ы'
        '\u045E': ['', '\u01D4', 'u`', '', '', '', ''], // 'ў'
        '\u046B': ['', '\u01CE', '', 'o`', '', '', ''], //  юс
        '\u0475': ['', '\u1EF3', '', 'yh', '', 'yh', ''], //  ижица
        '\u0446': ['cz', 'c'],                                 // 'ц'
        '\u0430': ['a'],                                           // 'а'
        '\u0431': ['b'],                                           // 'б'
        '\u0432': ['v'],                                           // 'в'
        '\u0433': ['g'],                                           // 'г'
        '\u0434': ['d'],                                           // 'д'
        '\u0435': ['e'],                                           // 'е'
        '\u0437': ['z'],                                           // 'з'
        '\u0438': ['', 'i', '', 'i', 'i', 'i', 'y`'], // 'и'
        '\u0439': ['', 'j', 'j', 'j', '', 'j', 'j'], // 'й'
        '\u043A': ['k'],                                           // 'к'
        '\u043B': ['l'],                                           // 'л'
        '\u043C': ['m'],                                           // 'м'
        '\u043D': ['n'],                                           // 'н'
        '\u043E': ['o'],                                           // 'о'
        '\u043F': ['p'],                                           // 'п'
        '\u0440': ['r'],                                           // 'р'
        '\u0441': ['s'],                                           // 'с'
        '\u0442': ['t'],                                           // 'т'
        '\u0443': ['u'],                                           // 'у'
        '\u0444': ['f'],                                           // 'ф'
        '\u0445': ['x', 'h'],                                 // 'х'
        '\u044C': ['', '\u02B9', '`', '`', '', '`', '`'], // 'ь'
        '\u0458': ['', 'j\u030C', '', '', 'j', '', ''], // 'ј'
        '\u2019': ['\'', '\u02BC'],                                 // '’'
        '\u2116': ['#']                                           // '№'
        /*-Имя---------0-,-------1-,---2-,---3-,---4-,----5-,---6-*/
    }, regarr = [], trantab = {};
    /* jshint -W030 */                     // Создание таблицы и массива RegExp
    for (var row in iso9) {
        if (Object.hasOwnProperty.call(iso9, row)) {
            func[0](iso9[row], row);
        }
    }
    /* jshint +W030 */
    return func[1](                        // функция пост-обработки строки (правила и т.д.)
        str.replace(                       // Транслитерация
            new RegExp(regarr.join('|'), 'gi'),// Создаем RegExp из массива
            function (R) {                      // CallBack Функция RegExp
                if (R.toLowerCase() === R) {     // Обработка строки с учетом регистра
                    return trantab[R];
                } else {
                    return trantab[R.toLowerCase()].toUpperCase();
                }
            }));
}