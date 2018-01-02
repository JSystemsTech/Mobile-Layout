"use strict";
var ACTIVE_CLASS = 'active';
var APP_OPEN_CLASS = 'app-open';

$( document ).ready(function() {
var closeAllApps = function(tray, cb) {
    tray.removeClass(APP_OPEN_CLASS);
    tray.find('> .app').removeClass(ACTIVE_CLASS).attr('aria-expanded', 'false');
    if (typeof cb === 'function') {
        cb();
    }
};
var openApp = function(app, tray, options) {
    var currentlyOpenApp = tray.find('> .app.' + ACTIVE_CLASS);
    if (currentlyOpenApp.length > 0) {
        closeApp($(currentlyOpenApp[0]), tray, function() {
            setTimeout(function(){
                openApp(app, tray, options);
            }, 400);
            
        });
    } else {
        app.addClass(ACTIVE_CLASS).attr('aria-expanded', 'true');
        tray.addClass(APP_OPEN_CLASS);
        app.trigger('app-opened', app, tray, options || {});
    }
};
var closeApp = function(app, tray, cb, options) {
    closeAllApps(tray, cb);
    app.trigger('app-closed', app, tray, options || {});
};

var bindAppEvents = function(apps, tray) {
    var appEvents = {
        'app-toggle': function(e, options) {
            e.preventDefault();
            var targetApp = $(e.target).closest('.app');
            var isOpen = targetApp.hasClass(ACTIVE_CLASS);
            if (isOpen) {
                closeApp(targetApp, tray, null, options);
            } else {
                openApp(targetApp, tray, options);
            }
        },
        'app-open': function(e, options) {
            e.preventDefault();
            var targetApp = $(e.target).closest('.app');
            openApp(targetApp, tray, options);
        },
        'app-close': function(e, options) {
            e.preventDefault();
            var targetApp = $(e.target).closest('.app');
            closeApp(targetApp, tray, null, options);
        },
        'click': function(e) {
            e.preventDefault();
            var targetApp = $(e.target).closest('.app');
            var closingApp = $(e.target).closest('.app-close').closest('.app').is(targetApp) || 
                             $(e.target).closest('[data-toggle-app]').closest('.app').is(targetApp);
            var isActive = targetApp.hasClass(ACTIVE_CLASS);
            if(!isActive && !closingApp){
                 openApp(targetApp, tray);
            }
        }
    };
    $.each(appEvents, function(eventName, cb) {
        apps.on(eventName, cb);
    });
};
var initAppTray = function() {
    var tray = $(this);
    var apps = tray.find('> .app');
    apps.attr('aria-expanded', 'false').attr('tab-index', '1');
    bindAppEvents(apps, tray);
};

var initHelpers = function() {
$('.close-all-apps').on('click', function() {
    var tray = $($(this).attr('data-target') + '.app-open');
    if (tray.length > 0) {
        var currentlyOpenApp = tray.find('> .app.' + ACTIVE_CLASS);
        if (currentlyOpenApp.length > 0) {
            closeApp(currentlyOpenApp, tray);
        }
    }
});
$('.app-close').on('click', function(e) {
    var targetApp = $(e.target).closest('.app');
    var tray = targetApp.closest('.app-tray');
    closeApp(targetApp, tray);
});
$('[data-toggle-app]').on('click', function(e){
    var targetApp = $($(this).attr('data-toggle-app'));
    var tray = targetApp.closest('.app-tray');
            var isOpen = targetApp.hasClass(ACTIVE_CLASS);
            if (isOpen) {
                closeApp(targetApp, tray);
            } else {
                openApp(targetApp, tray);
            }
 });
};


    
var destroyAppTray = function() {
    var tray = $(this);
    var apps = tray.find('> .app');
    $.each(['click','app-toggle','app-close','app-open','app-closed','app-opened'], function(index, event) {
        apps.off(event);
    });
};
var destroyHelpers = function(){
    $.each([$('[data-toggle-app]'), $('.app-close'), $('.close-all-apps')], function(index, el) {
        el.off('click');
    });
};
var onBeforeDestroy = function(){
    $('.app-tray').each(destroyAppTray);
    destroyHelpers();
}
var initialize = function(){
    $('.app-tray').each(initAppTray);
    initHelpers();
    $(window).resize(function() {
          var bodyheight = $(window).height();
          $(".tray-wrapper.auto-height").height(bodyheight);
       });
}
$( window ).unload(onBeforeDestroy);

    initialize();
});
