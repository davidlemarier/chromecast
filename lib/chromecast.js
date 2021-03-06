'use strict';

/*
* We import our depedencies
*/
var App = require('pdk'),
    chromecast = require('chromecast-js');

/*
* We expose and export our new device to Popcorn Time
*/
module.exports = App.Devices.extend({

    /*
     * Default function called by package manager to activate
     */
    onActivate: function() {

        var browser = new chromecast.Browser();
        var self = this;

        // Extend from the generic exposed
        var Chromecast = this.generic.extend({
            defaults: {
                type: 'chromecast',
            },

            play: function (streamModel) {
                // "" So it behaves when spaces in path
                // TODO: Subtitles
                var url = streamModel.get('src');
                var subtitles = null;
                var name = this.get('name');
                var device = this.get('device');
                this.set('url', url);
                var self = this;
                var media;
                var subtitle = streamModel.get('subFile');

                if (subtitle) {
                    media = {
                        url: url,
                        subtitles: [{
                            url: 'http:' + url.split(':')[1] + ':9999/subtitle.vtt',
                            name: 'Subtitles',
                            language: 'en-US'
                        }],
                        cover: {
                            title: streamModel.get('title'),
                            url: streamModel.get('cover')
                        },
                        subtitles_style: {
                            backgroundColor: '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
                            foregroundColor: App.Settings.get('subtitle_color'), // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
                            edgeType: App.Settings.get('subtitle_shadow') ? 'DROP_SHADOW' : 'OUTLINE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
                            edgeColor: '#000000FF', // color of border - see http://dev.w3.org/csswg/css-color/#hex-notation
                            fontScale: 1.3, // size of the text - transforms into "font-size: " + (fontScale*100) +"%"
                            fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
                            fontFamily: 'Helvetica',
                            fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
                            windowColor: '#00000000', // see http://dev.w3.org/csswg/css-color/#hex-notation
                            windowRoundedCornerRadius: 0, // radius in px
                            windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
                        }
                    };
                } else {
                    media = {
                        url: url,
                        cover: {
                            title: streamModel.get('title'),
                            url: streamModel.get('cover')
                        }
                    };
                }

                device.connect();
                device.on('connected', function () {
                    device.play(media, 0, function (err, status) {
                        if (err) {
                            console.log(err);
                        }
                        console.log('Playing ' + url + ' on ' + name);
                    });
                });

            },

            pause: function () {
                this.get('device').pause(function () {});
            },

            stop: function () {
                this.get('device').stop(function () {});
            },

            forward: function () {
                this.get('device').seek(30, function () {});
            },

            backward: function () {
                this.get('device').seek(-30, function () {});
            },

            unpause: function () {
                this.get('device').unpause(function () {});
            }
        });

        browser.on('deviceOn', function (device) {
            self.collection.add(new Chromecast({
                id: 'chromecast-' + device.config.name.replace(' ', '-'),
                name: device.config.name,
                type: 'chromecast',
                device: device
            }));
        });

    }

});
