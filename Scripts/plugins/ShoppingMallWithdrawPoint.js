(function ($) {
    $.fn.extend({
        shoppingMallWithdraw: function () {
            var point = +$('#game-point').val();
            var pendingWithdrawGamepoint = false;
            var shoppingMallBtn = $('#btn-shopping-mall');

            function init() {
                var withdrawFunc = $('html').hasClass('mobile') ? withdrawGamePointMobile : withdrawGamePoint;
                shoppingMallBtn.on('click', withdrawFunc);
            }

            function withdrawGamePoint(e) {
                if (pendingWithdrawGamepoint) return;
                pendingWithdrawGamepoint = true;
                var theme = appContext.getCompanyInfo().Theme;
                var loaderHtml = '<i class="text_menu-item" ><i class="fa fa-spinner fa-spin"></i></i>'
                if (theme == "oceanwin") loaderHtml =
                '<div class="header__product-menu-item-icon" style="color:white; line-height: 45px"><a class="fa fa-spinner fa-spin"></a></div>' +
                    '<span class="text_menu-item multi-lang" data-lang="MENU.ShoppingMall">' + languageModule.translate("MENU.ShoppingMall") + '</span>'
                shoppingMallBtn.html(loaderHtml);
                e.preventDefault();
                var headers = httpUtils.authHeader(true);
                $.ajax({
                    url: globalSettings.apiSettings.withdrawGamePoint,
                    type: 'GET',
                    headers: headers,
                    success: function (response) {
                        if (response.Success) {
                            var url = response.Result;
                            toastr.success('Withdraw successful');
                            var params = 'location=1,status=1,scrollbars=1,width=1280,height=720';
                            lobby = window.open(url, 'Withdraw coin', params);
                        } else {
                            toastr.error('Withdraw failed');
                        }
                    }
                }).always(function () {
                    setTimeout(function () {
                        pendingWithdrawGamepoint = false;
                        var originalBtn = '<a href="#" class="text_menu-item multi-lang" data-lang="MENU.ShoppingMall">' + languageModule.translate('MENU.ShoppingMall') + '</a>';
                        if (theme == "oceanwin") originalBtn =
                            '<a href="#">' +
                                '<img class="header__product-menu-item-icon" src="/Content/theme/default/m/images/icn-shoppingmall.png" />' +
                                '<span class="text_menu-item multi-lang" data-lang="MENU.ShoppingMall">' + languageModule.translate('MENU.ShoppingMall') + '</span>' +
                            '</a>';
                        shoppingMallBtn.html(originalBtn)
                    }, 500);
                })
            }

            function withdrawGamePointMobile(e) {
                if (pendingWithdrawGamepoint) return;
                pendingWithdrawGamepoint = true;
                var iconEl = shoppingMallBtn.find('.mainmenu-link-icon')
                iconEl.removeClass('icon-shoppingmall').removeClass('icon').addClass('fa fa-spinner fa-spin');
                e.preventDefault();
                var headers = httpUtils.authHeader(true);
                $.ajax({
                    url: globalSettings.apiSettings.withdrawGamePoint,
                    type: 'GET',
                    headers: headers,
                    success: function (response) {
                        if (response.Success) {
                            var url = response.Result;
                            toastr.success('Withdraw successful');
                            var params = 'location=1,status=1,scrollbars=1,width=' + window.outerWidth + ',height=' + window.outerHeight;
                            lobby = window.open(url, 'Withdraw coin', params);
                        } else {
                            toastr.error('Withdraw failed');
                        }
                    }
                }).always(function () {
                    setTimeout(function () {
                        processing = false;
                        iconEl.removeClass('fa').removeClass('fa-spin').removeClass('fa-spinner').addClass('icon icon-shoppingmall');
                    }, 500);
                })
            }

            init();

        }
    });
})(jQuery);

$(document).ready(function () {
    if ($('#btn-shopping-mall').length > 0) $('#btn-shopping-mall').shoppingMallWithdraw();
})