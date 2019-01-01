jQuery(document).ready(function ($) {

    //设定轮播图动画参数
    let duration = 400,
        epsilon = (1000 / 60 / duration) / 3,
        customMinaAnimation = bezier(.42, .03, .77, .63, epsilon)

    //获得DOM中轮播图中的元素并封装成类
    let radialSlider = function (domElement) {
        this.element = domElement
        this.slider = this.element.find('.rb-radial-slider')
        this.slides = this.slider.children('li')
        this.slidesNumber = this.slides.length
        this.visibleIndex = 0
        this.nextVisible = 1
        this.prevVisible = this.slidesNumber - 1
        this.navigation = this.element.find('.rb-radial-slider-navigation')
        this.animating = false
        this.mask = this.element.find('.rb-round-mask')
        this.leftMask = this.element.find('mask').eq(0)
        this.rightMask = this.element.find('mask').eq(1)
        this.bindEvents()
    }

    radialSlider.prototype.bindEvents = function () {
        let self = this
        //点击导航元素时更新图片
        this.navigation.on('click', function (event) {
            if (!self.animating) {
                self.animating = true
                event.preventDefault()
                let direction = ($(event.target).hasClass('next')) ? 'next' : 'prev'
                //update radialSlider index properties
                self.updateIndexes(direction)
                console.log([self.prevVisible, self.visibleIndex, self.nextVisible])
                //show new sldie 
                self.updateSlides(direction)
            }
        })
    }

    radialSlider.prototype.updateIndexes = function (direction) {
        if (direction == 'next') {
            this.prevVisible = this.visibleIndex
            this.visibleIndex = this.nextVisible
            this.nextVisible = (this.nextVisible + 1 < this.slidesNumber) ? this.nextVisible + 1 : 0
        } else {
            this.nextVisible = this.visibleIndex
            this.visibleIndex = this.prevVisible
            this.prevVisible = (this.prevVisible <= 0) ? this.slidesNumber - 1 : this.prevVisible - 1;
        }
    }

    radialSlider.prototype.updateSlides = function (direction) {
        var self = this;

        //获取圆形元素
        var clipPathVisible = Snap('#' + this.slides.eq(this.visibleIndex).find('circle').attr('id')),
            clipPathPrev = Snap('#' + this.slides.eq(this.prevVisible).find('circle').attr('id')),
            clipPathNext = Snap('#' + this.slides.eq(this.nextVisible).find('circle').attr('id'))

        var radius1 = this.slider.data('radius1'),  //圆形元素的半径
            radius2 = this.slider.data('radius2'),  //圆形元素扩大后的半径，最小是要覆盖图片
            centerx = (direction == 'next') ? this.slider.data('centerx2') : this.slider.data('centerx1')

        //给显示的图片模块添加样式
        this.slides.eq(this.visibleIndex).addClass('is-animating').removeClass('next-slide prev-slide')


        // 按钮和介绍内容动画
        if (direction == 'next') {
            //实现内容动画
            //this.slides.eq(this.visibleIndex).addClass('content-reveal-left')
            //this.slides.eq(this.prevVisible).addClass('content-hide-left')

            //mask slide image to reveal navigation round element
            // this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask:url(#' + this.leftMask.attr('id') + ')')

            //animate slider navigation round element
            clipPathNext.attr({
                'r': radius1,
                'cx': self.slider.data('centerx2')
            })

            this.slides.eq(this.nextVisible).addClass('next-slide move-up')
            this.slides.filter('.prev-slide').addClass('scale-down')
        } else {
            //实现内容动画
            // this.slides.eq(this.visibleIndex).addClass('content-reveal-right')
            // this.slides.eq(this.nextVisible).addClass('content-hide-right')

            // this.slides.eq(this.visibleIndex).find('image').attr('style', 'mask:url(#' + this.rightMask.attr('id') + ')')

            clipPathPrev.attr({
                'r': radius1,
                'cx': self.slider.data('centerx1')
            })
            this.slides.eq(this.prevVisible).addClass('prev-slide move-up')
            this.slides.filter('.next-slide').addClass('scale-down')

        }
       

        clipPathVisible.attr({
            'r': radius1,
            'cx': centerx
        }).animate({ 'r': radius2 }, duration, customMinaAnimation, function () {
            if (direction == 'next') {
                self.slides.filter('.prev-slide').removeClass('prev-slide scale-down');
                clipPathPrev.attr({
                    'r': radius1,
                    'cx': self.slider.data('centerx1')
                })
                self.slides.eq(self.prevVisible).removeClass('visible').addClass('prev-slide')
            } else {
                self.slides.filter('.next-slide').removeClass('next-slide scale-down')
                clipPathNext.attr({
                    'r': radius1,
                    'cx': self.slider.data('centerx2')
                })
                self.slides.eq(self.nextVisible).removeClass('visible').addClass('next-slide');
            }
            self.slides.eq(self.visibleIndex).removeClass('is-animating').addClass('visible').find('image').removeAttr('style')
            self.slides.filter('.move-up').removeClass('move-up')

            setTimeout(function() {
                // self.slides.eq(self.visibleIndex).removeClass('content-reveal-left content-reveal-right')
                // self.slides.eq(self.prevVisible).removeClass('content-hide-left content-hide-right')
                // self.slides.eq(self.nextVisible).removeClass('content-hide-left content-hide-right')
                self.animating = false;
            }, 100)

        })
    }

//初始化
$('.rb-radial-slider-wrapper').each(function () {
    new radialSlider($(this));
});

/*
    convert a cubic bezier value to a custom mina easing
    http://stackoverflow.com/questions/25265197/how-to-convert-a-cubic-bezier-value-to-a-custom-mina-easing-snap-svg
*/
function bezier(x1, y1, x2, y2, epsilon) {
    //https://github.com/arian/cubic-bezier
    var curveX = function (t) {
        var v = 1 - t;
        return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
    };

    var curveY = function (t) {
        var v = 1 - t;
        return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
    };

    var derivativeCurveX = function (t) {
        var v = 1 - t;
        return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
    };

    return function (t) {

        var x = t, t0, t1, t2, x2, d2, i;

        // First try a few iterations of Newton's method -- normally very fast.
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = curveX(t2) - x;
            if (Math.abs(x2) < epsilon) return curveY(t2);
            d2 = derivativeCurveX(t2);
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }

        t0 = 0, t1 = 1, t2 = x;

        if (t2 < t0) return curveY(t0);
        if (t2 > t1) return curveY(t1);

        // Fallback to the bisection method for reliability.
        while (t0 < t1) {
            x2 = curveX(t2);
            if (Math.abs(x2 - x) < epsilon) return curveY(t2);
            if (x > x2) t0 = t2;
            else t1 = t2;
            t2 = (t1 - t0) * .5 + t0;
        }

        // Failure
        return curveY(t2);

    };
};
})