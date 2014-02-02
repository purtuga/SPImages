/**
 * main.js
 * Main module for SPImages. Parses the list of images into
 * array's and then displays them on the page. Content is
 * displayed in "pages" of x amount of images only.
 * 
 * Version: @VERSION
 * Build:   @BUILD
 * 
 * (c) @YEAR Paul Tavares | MIT License
 */
(function($){
    
    "use strict";
    
    /*jslint nomen: true, plusplus: true */ 
    /*global SP, _spBodyOnLoadFunctionNames */
    
    // Execute our code when DOM is ready.
    $(function(){
        
        var app         = {};
        
        /**
         * Returns the version of SP based on the UI.
         * Taken from SPWidgets project
         * {@see http://purtuga.github.io/SPWidgets/}
         * 
         * @param {Boolean} returnExternal
         * 
         * @return {Number|String}
         */
        app.getSPVersion = function(returnExternal) {
            
            // Some approaches below taken from:
            // http://sharepoint.stackexchange.com/questions/74978/can-i-tell-what-version-of-sharepoint-is-being-used-from-javascript
            
            var versionMap = {
                                12: '2007',
                                14: '2010',
                                15: '2013'
                        },
                version     = 12;
            
            if (typeof SP !== "undefined") {
                
                version = 14;
                
                if (SP.ClientSchemaVersions) {
                    
                    if (SP.ClientSchemaVersions.currentVersion) {
                        
                        version = parseInt(SP.ClientSchemaVersions.currentVersion);
                        
                    }
                    
                } else {
                    
                    version = parseInt(_spPageContextInfo.webUIVersion);
                    
                    if (version === 4) {
                        
                        version = 14;
                        
                    }
                    
                }
                
            }
            
            if (returnExternal) {
                
                version = versionMap[version] || version;
                
            }
            
            return version;
            
        }; //end: getSPVersion();
        
        /**
         * Given an object that represents a grouping of images, this
         * method will populate that object's 'pages' (an array) attribute
         * with the list pages. Page information is stored an object
         * containing the 'start' and 'end' position with the array of images.
         * 
         * @param {Object} imgObj
         *      See {app.getImages()} for the format of this object
         * 
         * @return {undefined}
         */
        app.calculatePages = function(imgObj){
            
            imgObj.pages.splice(0);
            
            if (!imgObj.images.length){
                
                return;
            }
            
            var count   = 0,
                total   = imgObj.images.length;
            
            if (total <= app.imagesPerPage) {
                
                imgObj.pages.push({
                    start:  0,
                    end:    ( total - 1 )
                });
                
                return;
                
            }
            
            while (count < total) {
                
                imgObj.pages.push({
                    start:  count,
                    end:    (count + app.imagesPerPage)
                });

                count += app.imagesPerPage;
                
            }
            
        }; //end: calculatePages()
            
        /**
         * Returns an object with the images based on the version of SP running.
         * Images are retrieved from a script element on the page.
         * 
         * @return {Object}
         *      Object contains the following structure:
         * 
         *      {
         *          all:    {
         *                  images: [],
         *                  pages:  [
         *                      {
         *                          start: 0,
         *                          end:   70
         *                      }
         *                  ]
         *              }
         *          large:  {
         *                  images: [],
         *                  pages:  [
         *                      {
         *                          start: 0,
         *                          end:   70
         *                      }
         *                  ]
         *              },
         *          med:    {
         *                  images: [],
         *                  pages:  [
         *                      {
         *                          start: 0,
         *                          end:   70
         *                      }
         *                  ]
         *              },
         *          small:  {
         *                  images: [],
         *                  pages:  [
         *                      {
         *                          start: 0,
         *                          end:   70
         *                      }
         *                  ]
         *              }
         *      }
         */
        app.getImages = (function(){
            
            var cache = {};
                
            // Return a function
            return function(spversion) {
                
                // If no version was specified, get SP version
                if (!spversion) {
                    
                    spversion = app.getSPVersion(true);
                    
                }
                
                // If we already have the list of images built for
                // this version, return it.
                if ( spversion && cache[ spversion ] ) {
                    
                    return cache[ spversion ];
                    
                }
                
                var $imgCntr    = $("#sp_" + spversion + "_img_src"),
                    images      = null,
                    imgInfo     = null,
                    img         = '',
                    imgObj      = {
                        all:    {
                            images: [],
                            pages:  []
                        },
                        large:  {
                            images: [],
                            pages:  []
                        },
                        medium: {
                            images: [],
                            pages:  []
                        },
                        small:  {
                            images: [],
                            pages:  []
                        }
                    },
                    i,j;
                
                if (!$imgCntr.length) {
                    
                    return imgObj;
                    
                }
                
                images = $imgCntr.html().split(/\n/);
                
                for(i=0,j=images.length; i<j; i++){
                    
                    if ($.trim(images[i])){
                        
                        img = '<a href="javascript:">' + images[i] + '</a>';
                        
                        imgObj.all.images.push( img );
                        
                        try {
                            
                            imgInfo = $.parseJSON(
                                $("<span/>").html(images[i].match(/data-metadata="?(.*?)"/)[1]).text()
                            );
                            
                        } catch(e){}
                        
                        
                        if (!$.isEmptyObject(imgInfo)) {
                            
                            if (imgInfo.isSmall) {
                                
                                imgObj.small.images.push( img );
                                
                            }
                            
                            if (imgInfo.isMedium) {
                                
                                imgObj.medium.images.push( img );
                                
                            }
                            
                            if (imgInfo.isLarge) {
                                
                                imgObj.large.images.push( img );
                                
                            }
                            
                        }
                        
                    }
                    
                }
                
                app.calculatePages(imgObj.all);
                app.calculatePages(imgObj.small);
                app.calculatePages(imgObj.medium);
                app.calculatePages(imgObj.large);
                
                return imgObj;
                
            }; //end: app.getImages
            
        })(); //end: .getImages
        
        /**
         * Shows the info page on the page.
         */
        app.showInfoPage = function() {
            
            app.$imgCntr.empty().hide();
            app.$mainCntr.empty().append(
                $('<div style="margin:4em auto auto;width: 80%;" />')
                    .append(
                        app.getSPMessageContainer(
                            app.$msgAbout.html()
                        )
                    )
            )
            .show();
            
        }; /* .showInfoPage */
        
        /**
         * Shows images on the page.
         * 
         * @param {Object} [options]
         * @param {Boolean} [options.pageFwd=false]
         * @param {Boolean} [options.pageBack=false]
         * @param {String} [options.size="all"]       small,medium,large,all
         * 
         */
        app.showImages = function(options) {
            
            var opt         = $.extend({}, {
                                    pageFwd:    false,
                                    pageBack:   false,
                                    size:       "all",
                                    spVersion:  ""
                                }, options),
                imgObj    = app.currentImgObj || null,
                imgHtml     = '';
            
            if (!opt.spVersion && !imgObj) {
                
                app.showInfoPage();
                return;
                
            }
            
            if (!imgObj) {
                
                imgObj = app.getImages( opt.spVersion )[ opt.size ];
                
            }
            
            if (!imgObj) {
                
                return;
                
            }
            
            // Show next page if 
            if (opt.pageFwd && imgObj.pages[(app.currentPage + 1)] ) {
                
                app.currentPage++;
                
            // Show Previous page
            } else if (opt.pageBack && app.currentPage > 0) {
                
                --app.currentPage;
                
            } else if (!opt.pageFwd && !opt.pageBack) {
                
                app.currentImgObj   = imgObj;
                app.currentPage     = 0;
                
                app.$imgPgTotal.html(imgObj.pages.length);
                
            }
            
            imgHtml  = ( imgObj.images.slice(
                            imgObj.pages[app.currentPage].start,
                            imgObj.pages[app.currentPage].end
                        )
                    ).join("");
            
            app.$mainCntr.hide();
            
            app.$imgCntr.html(imgHtml).show();
            
            app.$imgPgCurr.html((app.currentPage + 1));
            
            app.$imgInfo.hide();
            
        }; //end: app.showImages()
        
        /**
         * Initializes the application.
         */
        app.init = function() {
            
            app.$popup      = $("#imginfo").appendTo("body").show();
            app.$menu       = $("#sp_img_menu");
            app.$next       = $("#sp_img_page_next");
            app.$prev       = $("#sp_img_page_prev");
            app.$mainCntr   = $("#sp_main_cntr");
            app.$imgCntr    = $("#sp_img_cntr");
            app.$imgPgCurr  = $("#sp_img_this_page");
            app.$imgPgTotal = $("#sp_img_total_pages");
            app.$spVersion  = $("#sp_version");
            app.$imgTypes   = $("#img_types");
            app.$bkmrkCount = $("#sp_img_bookmark_count");
            app.$bookmarks  = app.$bkmrkCount.closest("a");
            app.$msgAbout   = $("#sp_img_msg_about");
            
            // Elements that hold image information when user clicks on it.
            app.$imgInfo    = app.$popup.find("#sp_img_info_cntr");
            app.$width      = app.$popup.find("#img_width");
            app.$height     = app.$popup.find("#img_height");
            app.$src        = app.$popup.find("input[name='imgsrc']");
            app.$imgHtml    = app.$popup.find("input[name='imghtml']");
            
            app.imagesPerPage   = 70;
            app.currentImgObj   = null;
            app.currentPage     = 0;    // zero based paging numbering
            app.$currentImg     = null;
            
            app.bookmarks   = {
                images: [],
                pages:   [
                    {
                        start:  0,
                        end:    1000
                    }
                ]
            };
            
            // If in DEV mode, then add app variable to global space (for debuging)
            // to trigger this, just add dev=1 to the url of the page
            if (document.location.href.indexOf("dev=1") > -1) {
                
                window.SPImages = app;
                
            }
            
            app.$popup.on("click", "a", function(){
                
                var $this   = $(this),
                    id      = $(this).attr("id") || "";
                
                if ($this.is(".sp-img-disabled")) {
                    
                    return this;
                    
                }
                
                switch (id.toLowerCase()) {
                    
                    case "sp_img_page_next":
                        
                        app.showImages({ pageFwd: true });
                        
                        break;
                        
                    case "sp_img_page_prev":
                        
                        app.showImages({ pageBack: true });
                        
                        break;
                    
                    case "sp_img_bookmarks":
                        
                        if (!$this.is(".sp-img-disabled")) {
                            
                            app.$imgTypes.val("");
                            
                            app.currentImgObj = app.bookmarks;
                            
                            app.showImages();
                            
                        }
                        
                        break;
                    
                    case "sp_img_remember":
                        
                        if (app.$imgHtml.val()) {
                            
                            app.bookmarks.images.push(
                                '<a href="javascript:">' + 
                                app.$currentImg.html() + '</a>'
                            );
                            app.$bkmrkCount.html( app.bookmarks.images.length );
                            app.$bookmarks.removeClass("sp-img-disabled");
                            
                        }
                        
                        break;
                    
                }
                
                return this;
                
            }); //end: popup.click()
            
            
            // Bind click event method to catch clicks on images. Shows the
            // image in the popup panel.
            $("#sp_img_cntr").on("click", "a", function(ev){
                
                var $thisLink   = $(this),
                    $thisImg    = $thisLink.find("img"),
                    position    = $thisLink.position();
                
                if (app.$currentImg) {
                    
                    app.$currentImg.removeClass("sp-img-selected");
                    
                }
                
                app.$currentImg = $thisLink.addClass('sp-img-selected');
                
                app.$width.html( $thisImg.width() );
                app.$height.html( $thisImg.height() );
                app.$src.val( $thisImg.attr("src") );
                app.$imgHtml.val( '<img src="' + $thisImg.attr("src") + '"/>' );
                
                app.$imgInfo.show();
                
            });
            
            // Bind click event on Body tag so that we hide the popup if
            // user clicks outside the popup.
            $("body").on("click", function(ev){
                
                var $target = $(ev.target);
                
                if (!$target.closest("#sp_img_info_cntr").length && !$target.closest("a").length) {
                    
                    app.$imgInfo.hide();
                    
                }
                
            });
            
            // Bind function to the image info input fields. Select all text
            // when user click on them
            app.$imgInfo.on("click", "input", function(){
                
                this.select();
                
            });
            
            // Bind Change event to the SP Version select box
            // Bind change event to the Image Types select box
            app.$imgTypes.add(app.$spVersion).on("change", function(){
                
                var $this   = $(this);
                
                app.currentImgObj   = null;
                app.currentPage     = 0;
                
                app.showImages({
                    spVersion:  app.$spVersion.val(),
                    size:       app.$imgTypes.val()
                });
                
                $this.blur();
                
            })
            .change(); 
            
        }; //end: app.init()
        
        /**
         * Returns a jQuery object that contains a Message container
         * created using the Sharepoint markup used by SP.UI.Status
         * class. NOTE that this message container is NOT yet inserted
         * in DOM; caller will need to addd it.
         * 
         * @param {Object} options
         * @param {String} options.message
         * @param {String} [options.title=""]
         * @param {String} [options.color=blue]
         *      Possible values: blue, green, yellow, red
         * 
         * @return {jQuery}
         * 
         * @example
         * 
         *  Main.getSPMessageContainer({ message: "error encoutered!", color: "red"});
         *  Main.getSPMessageContainer("Look af the this message");
         * 
         * DEPENDENCIES:
         * 
         *  .getSPVersion()
         * 
         */
        app.getSPMessageContainer = (function($){
            
            var 
                buildCntr   = null,
                
                // Reference to the scope where this utiltiy was bound.
                Me          = null,
                
                cssClass    = {
                                blue:   'ms-status-blue s4-status-s1',
                                green:  'ms-status-green s4-status-s2',
                                yellow: 'ms-status-yellow s4-status-s3',
                                red:    'ms-status-red s4-status-s4'
                            },
                
                imgSrc      = {
                                blue:   '/_layouts/15/images/spcommon.png',
                                green:  '/_layouts/15/images/spcommon.png',
                                yellow: '/_layouts/15/images/spcommon.png',
                                red:    '/_layouts/15/images/spcommon.png'
                            },
                
                spVersion   = '',
                
                isInitDone  = false,
                
                init        = function() {
                                
                                spVersion = Me.getSPVersion();
                                
                                // if not SP2013 or higher, redefine images
                                if (spVersion < 15) {
                                    
                                    
                                    imgSrc.blue     = '/_layouts/images/mewa_info.gif';
                                    imgSrc.green    = '/_layouts/images/STS_ListItem_43216.gif';
                                    imgSrc.yellow   = '/_layouts/images/mewa_notify.gif';
                                    imgSrc.red      = '/_layouts/images/cell-error.png';
                                    
                                }
                                
                            },
                            
                // Fucntion that is bound to parent object/class
                callerFn    = function(){
                                
                                if (Me === null) {
                                    
                                    Me = this;
                                    
                                }
                                
                                if (!isInitDone) {
                                    
                                    isInitDone = true;
                                    init();
                                    
                                }
                                
                                return buildCntr.apply(this, arguments);
                                    
                            };
                
            
            buildCntr = function(options) {
                
                var opt         = $.extend({}, {
                                    message: '',
                                    title: '',
                                    color: 'blue'
                                },
                                options);
                
                if (typeof options === "string") {
                    
                    opt.message = options;
                    
                }
                
                opt.color = String(opt.color).toLowerCase();
                
                return $(
                    '<div class="ms-status-msg ' + cssClass[opt.color] +'" style="background-image:none;">' +
                        '<span class="ms-status-status">' + 
                            '<span class="ms-status-iconSpan">' +
                                '<img src="' + imgSrc[opt.color] + '" class="ms-status-iconImg">' +
                            '</span>' +
                            '<span class="ms-bold ms-status-title">' + opt.title + '</span>' +
                            '<span class="ms-status-body">' +
                                '<div>' + opt.message + '</div>' +
                            '</span>' +
                        '</span>' +
                    '</div>'
                );
                
            };
            
            // Return a function
            return callerFn; 
            
        })(jQuery); /* .getSPMessageContainer */
       
        /**
         * Populates the given image tags with a data-metadata attribute
         * containing information about the image.
         * Method is meant to be called from the console when defining
         * new images into this utility source.
         * 
         * @param {jQuery} $images
         */
        app.doImgMetada = function($images) {
        
            $images.each(function(){

                    var $img = $(this),
                        json = {};

                    json.width = $img.width();
                    json.height = $img.height();
                    json.isSmall = ((json.width * json.height) < 625 ? true : false);
                    json.isMedium = (
                        ((json.width * json.height) > 625 && (json.width * json.height) < 2500)
                        ? true
                        : false
                    );
                    
                    json.isLarge = (
                        ((json.width * json.height) > 2500)
                        ? true
                        : false
                    );
                    
                    $img.attr("data-metadata", JSON.stringify(json));
                    
            });
            
        }; /* doImgMetadata() */
        
        
        // INITIALIZE APP
        if (typeof _spBodyOnLoadFunctionNames !== "undefined") {
            
            window.imgInitTempFunc = function() {
                
                app.init();
                window.imgInitTempFunc = undefined;
                
            };
            
            _spBodyOnLoadFunctionNames.push("imgInitTempFunc");
         
        // ELSE, initialize ourselves
        } else {
        
            setTimeout( app.init, 1000 );
            
        }
        
    });// end: $(function)

})(jQuery);