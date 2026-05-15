$(document).ready(function () {
    var tabkey = 'tabid_' + (+new Date);
    var localStorageKey = '.currentTab';
    var _user = appContext.getCurrentUser();

    function init() {
        var companyInfo = appContext.getCompanyInfo();
        
        $(document).on(consts.events.gamePointUpdated,
            function (e) {
                var balance = numeral(+e.balance).format('0,0');
                $('#game-point').html(balance);
            });        
        

        $(document).on(consts.events.inboxCountUpdate, function (e) {
            if (e.newsCount && e.newsCount > 0) {
                var x = e.newsCount;
                if (e.newsCount > 9) {
                    x = '9+';
                    $('.header__mail-box').addClass('big-counter')
                } else {
                    $('.header__mail-box').removeClass('big-counter')
                }

                $('.mail-box__counter').show().html(x)
            } else {
                $('.mail-box__counter').hide().html()
            }
        })

        $('#sp-live-chat, #sp-help').on('click', function (e) {
            e.preventDefault();
            alert('Comming Soon')
        })

        function clearnSessionAndForceUserOut() {
            helper.removeAuthCookie();
            window.parent.postMessage({ type:"__LOGOUT__" }, "*");
            window.location.href = helper.getMainUrl();
        }

        var waittingUserResponse = false;
        $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
            if (jqxhr.status == '401') {
                if (!helper.getUserToken()) {                    
                    return;
                }

                if (waittingUserResponse) return;
                var x = JSON.parse(jqxhr.responseText);
                if (!x || !x.Code) return;
                waittingUserResponse = true;

                var message = ""
                if (x.Code == '-1') {
                    message = languageModule.translate('COMMON.UnIntentialLogout');
                } else {
                    message = languageModule.translate('COMMON.SessionExpired');
                }                
                    
                swal({
                    title: "",
                    text: message,
                    type: 'info',
                    showCancelButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(function () {
                    clearnSessionAndForceUserOut();
                });
                setTimeout(function () {
                    clearnSessionAndForceUserOut();
                    swal.close();
                }, 10000)                
            }
        });

        var page = new PageContext();

        //slideShow1.init(page.language, page.pageName, companyInfo.Theme, 5000);
        $(document).on(consts.events.languageChange, function (e) {
            var lang = e.selectedLanguage;
            //slideShow1.init(lang, page.pageName, companyInfo.Theme, 5000);
        })

        systemTimer.init();
        //systemTimer.startTimer(timers.ping, 5000);
        //systemTimer.startTimer(timers.getBalance);
        systemTimer.startTimer(timers.checkAPIStatus, 10000);

        var ib = new InboxMessageCounter(10000);
        ib.start(2000);

        // listen logout        
        var handlerStorageChange = function (e) {
            if (e.originalEvent.key !== localStorageKey || ((e.originalEvent || {}).newValue || '') === tabkey) return;
            clearnSessionAndForceUserOut();
        }
        $(window).on('storage', handlerStorageChange);
    }
    init();
});

function InboxMessageCounter(interval) {
    var _timer = null;
    function pullData() {
        var headers = httpUtils.authHeader(true);
        var url = globalSettings.apiSettings.countInboxMessage_url;
        $.ajax({
            url: url,
            type: 'GET',
            headers: headers,
            success: function (response) {
                if (response.Success) {
                    $.event.trigger({
                        type: consts.events.inboxCountUpdate,
                        newsCount: response.Result.TotalUnread,
                        time: new Date()
                    });
                }
            },
            error: function (xhr) {
                logger.writeLog(xhr);
            }
        }).always(function () {
            if (_timer) clearTimeout(_timer);
            //_timer = setTimeout(pullData, interval); disable interval load count message
        });
    }

    this.start = function (delay) {
        if (!delay) {
            setTimeout(pullData, delay);
        } else {
            pullData();
        }
    }
}

function PageContext() {

    this.language = 'en-us';
    this.pageName = 'sport';
    var self = this;

    function init() {
        var path = window.location.pathname;
        self.pageName = mapPageName(path);
        self.language = appContext.getLanguge();
    }

    function mapPageName(path) {
        switch (path) {
            case '/sport':
                return consts.pages.sport;

            case '/live-casino':
                return consts.pages.live_casino;

            case '/e-game':
                return consts.pages.e_game;

            case '/lottery':
                return consts.pages.lottery;

            case '/cock-fight':
                return consts.pages.cock_fight;

            case '/p2p':
                return consts.pages.p2p;

            case '/hunt-fish':
                return '';

            case '/poker':
                return
                
            default:
                return '';
        }
    }

    init();
}