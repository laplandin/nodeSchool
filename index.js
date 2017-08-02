var submitBtn = $('#submitButton');
var settingsFab = $('.settings__fab');

var myForm = (function() {
    function validate() {
        var formData = getData();
        var isValid = false;
        var errorFields = [];

        resetError();

        validateName(formData.fio);
        validateEmail(formData.email);
        validatePhone(formData.phone);

        if (errorFields.length) {
            errorFields.forEach(function (item, index, array) {
                $('input[name=' + item +']').addClass('error');
            })
        } else {
            isValid = true;
        }

        return {
            isValid: isValid,
            errorFields: errorFields
        };

        function validateName(fio) {
            //Очистка от лишних пробелов
            fio = fio.replace(/\s{2,}/g, ' ');
            var regExp = /^[а-яА-ЯёЁa-zA-Z\s]+$/;
            var wordNumber = fio.split(' ').length;

            if (!(regExp.test(fio) && wordNumber === 3)) {
                errorFields.push('fio');
            }
        }

        function validateEmail(email) {
            var regExpRu = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(ya|yandex)\.ru$/g;
            var regExpOther = /^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?yandex\.(ua|by|kz|com)$/g;

            if (!(regExpRu.test(email) || regExpOther.test(email))) {
                errorFields.push('email');
            }
        }

        function validatePhone(phone) {
            var phoneDigits = phone.replace(/\+?\(?\)?-?/g, '');
            var digitArr = phoneDigits.split('');

            var digitsSum = digitArr.reduce(function(sum, current) {
                return sum + +(current);
            }, 0);
            var regExp = /^(\+7)(\(\d{3}\))\d{3}-\d{2}-\d{2}$/;

            if (!(regExp.test(phone) && digitsSum <= 30)) {
                errorFields.push('phone');
            }
        }

        function resetError() {
            for (var key in formData) {
                $('input[name=' + key +']').removeClass('error');
            }
        }
    }

    function getData() {
        return {
            fio: $('input[name="fio"]').val().trim(),
            email: $('input[name="email"]').val().trim(),
            phone: $('input[name="phone"]').val().trim()
        };
    }

    function setData(object) {
        for (var key in object) {
            $('input[name=' + key +']').val(object[key]).trigger('change');
        }
    }

    function submit(e) {
        if (e) {
            e.preventDefault();
        }
        var validateResult = validate();

        if (validateResult.isValid) {
            sendAjax();
        }

        function sendAjax() {
            var urlObj = {
                successUrl : 'server-responses/success.json',
                errorUrl   : 'server-responses/error.json',
                progressUrl: 'server-responses/progress.json'
            };

            function success(data) {
                var element = $('#resultContainer');
                switch (data.status) {
                    case 'success' :  element.removeClass('error progress').addClass('success').text('success');
                        // $('#myForm')[0].reset();
                        break;
                    case 'error'   :  element.removeClass('success progress').addClass('error').text(data.reason);
                        break;
                    case 'progress':  element.removeClass('success error').addClass('progress');
                        setTimeout(sendAjax, data.timeout);
                        break;
                    default        :  console.log('unexpected response');
                }
            }

            function error(jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Ошибка запроса: " + err );
            }

            $(document).ajaxStart(function() {
                $('#submitButton').attr('disabled', true);
                console.log('button blocked');
            });

            $(document).ajaxComplete(function() {
                $('#submitButton').attr('disabled', false);
                console.log('button unblocked');
            });

            $.ajax({
                dataType: "json",
                url: 'server-responses/' + $('.settings__form-radio:checked').val() + '.json',
                success: success,
                error: error
            });
        }
    }

    return {
        validate: validate,
        getData: getData,
        setData: setData,
        submit: submit
    }
}());

submitBtn.on('click', myForm.submit);
settingsFab.on('click', function() {
    $(this).toggleClass('settings__fab--rotate').siblings('form').slideToggle(300);
});


//стилизация input-ов
function setInputHandlers() {
    var inputs = $('.form__input');
    var form = $('.form');

    //Проверка на наличие данных в поле
    function checkInputs() {
        var inputs = $('.form__input');
        var editedInputs = inputs.filter(function() {
            return $(this).val();
        });
        if (editedInputs) {
            editedInputs.siblings('label').addClass('form__label--focused');
        }
    }

    inputs.on('change', function() {
        checkInputs();
    });

    inputs.on('focus', function (e) {
        $(this).siblings('label').addClass('form__label--focused');
    });

    inputs.on('blur', function (e) {
        if (!$(this).val()) {
            $(this).siblings('label').removeClass('form__label--focused');
        }
    });
}

setInputHandlers();
