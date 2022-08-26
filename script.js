class DraggingEvent {
    constructor(target = undefined) {
        this.target = target;
    }

    event(callback) {
        let handler;

        this.target.addEventListener("mousedown", e => {
            this.target.classList.add('dragging');
            e.preventDefault();

            handler = callback(e);

            const clearDraggingEvent = () => {
                this.target.classList.remove('dragging');

                window.removeEventListener("mousemove", handler);
                window.removeEventListener("mouseup", clearDraggingEvent);

                document.removeEventListener("mouseleave", clearDraggingEvent);

                handler(null)
            };

            window.addEventListener("mousemove", handler);

            document.addEventListener("mouseleave", clearDraggingEvent);

            window.addEventListener("mouseup", clearDraggingEvent);


        });

        this.target.addEventListener("touchstart", e => {
            this.target.classList.add('dragging');

            handler = callback(e);

            const clearDraggingEvent = () => {
                this.target.classList.remove('dragging');

                window.removeEventListener("touchmove", handler);
                window.removeEventListener("touchend", clearDraggingEvent);

                handler(null)
            };

            window.addEventListener("touchmove", handler);

            window.addEventListener("touchend", clearDraggingEvent);

            document.body.addEventListener("mouseleave", clearDraggingEvent);


        })
    }

    // Get the distance that the user has dragged
    getDistance(callback) {
        function distanceInit(e1) {
            let startingX, startingY;

            if ("touches" in e1) {
                startingX = e1.touches[0].clientX;
                startingY = e1.touches[0].clientY
            } else {
                startingX = e1.clientX;
                startingY = e1.clientY
            }


            return function(e2) {
                if (e2 === null) {
                    return callback(null)
                } else {

                    if ("touches" in e2) {
                        return callback({
                            x: e2.touches[0].clientX - startingX,
                            y: e2.touches[0].clientY - startingY
                        })
                    } else {
                        return callback({
                            x: e2.clientX - startingX,
                            y: e2.clientY - startingY
                        })
                    }
                }
            }
        }

        this.event(distanceInit)
    }
}
/*
class Slider extends DraggingEvent{
    cardsData = [];
    options;
    nodeList = [];
    firstX;
    prevX = 0;
    container;


    constructor(options, container) {
        super(container);
        this.container = container;

        this.options = options;
        this.getDistance(this.drag);
        this.init();
    }


    init() {
        this.activeIndex = 0;
        this.setDefaultClasses();
        this.container.innerHTML = this.getTemplate();
        this.nodeList = document.querySelectorAll('.carusel-item');
        this.nodeList.forEach(item => {
            this.cardsData.push({
                element: item,
                translateX: 0,
                size: item.offsetWidth,
                scale: 1,
                deltaX: 0
            });
        });
    }

    getActiveItemIndex() {
        return this.nodeList.findIndex(item => item.classList.contains('active'));
    }


    setDefaultClasses() {
        this.options.data.forEach((item, index) => {
            const itemPosition = index - this.activeIndex;
            if (itemPosition < 0) {
                this.options.data[index].defaultClass = 'more-one';
            } else if (itemPosition > 2) {
                this.options.data[index].defaultClass = 'less-quarter';
            } else  {
                switch (itemPosition) {
                    case 0:
                        this.options.data[index].defaultClass = 'active';
                        break;
                    case 1:
                        this.options.data[index].defaultClass = 'half';
                        break;
                    case 2:
                        this.options.data[index].defaultClass = 'quarter';
                        break;
                }
            }
        });
    }


    getTemplate() {
        let resultTemplate = '';
        this.options.data.forEach((item, index) => {
            resultTemplate += `<div class="carusel-item ${item.defaultClass}" onclick="setToActive(event)">${item.text}</div>`
        });
        return resultTemplate;
    }

    drag = (data) => {
        if (data !== null) {
            // this.render(data.x / this.container.offsetWidth * 100);
            this.render(data.x);
        }
        else {
            this.saveRenderedData();
        }
    };

/!*    render(changedPercent) {
        this.cardsData.forEach((data, index) => {
            this.updatePosition(data, changedPercent);
        })
    }*!/
    render(deltaX) {
        this.cardsData.forEach((data, index) => {
            const scale = this.calcScale(deltaX + data.deltaX);

            this.updateData(data, deltaX, scale);
        });

    }
    saveRenderedData() {
        this.cardsData.forEach((data, index) => {
            this.saveUpdatedData(data);
        });
    }

    updateData(sliderItem, deltaX, scale) {
        sliderItem.deltaX = deltaX / 2;
        sliderItem.element.style.transform = `translateZ(0) translateX(${sliderItem.translateX + deltaX / 2}px) scale(${scale}%)`;
    }
    saveUpdatedData(sliderItem) {
        sliderItem.translateX = sliderItem.translateX + sliderItem.deltaX;
    }
    calcScale(deltaX) {

        return 100 - deltaX / this.container.offsetWidth * 100;

    }






}

function setToActive(event) {
    console.log(event)
}

const slider =  new Slider({
    activeItemSize: 400,
    shownItemsCount: 3,
    // minHiddenItemsCount: 6,
    data: [
        {
            text: 1
        },
        {
            text: 2
        },
        {
            text: 3
        },
        {
            text: 4
        }
    ]
}, document.querySelector('.slider-container'));*/
/*

const cardsContainer = document.querySelector(".card-carousel");
const cardsController = document.querySelector(".card-carousel + .card-controller");




class CardCarousel extends DraggingEvent {

    cardMargin = 100;
    cardOffsetWidth = 0;
    constructor(container, controller = undefined) {
        super(container);

        // DOM elements
        this.container = container;
        this.controllerElement = controller;
        this.cards = container.querySelectorAll(".carusel-item");
        // this.cards = container.querySelectorAll(".card");

        // Carousel data
        this.centerIndex = 0;
        // this.centerIndex = (this.cards.length - 1) / 2;
        this.setCardWith();
        this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100;
        this.xScale = {};

        // Resizing
        window.addEventListener("resize", this.updateCardWidth.bind(this));

        if (this.controllerElement) {
            this.controllerElement.addEventListener("keydown", this.controller.bind(this))
        }


        // Initializers
        this.build();

        // Bind dragging event
        super.getDistance(this.moveCards.bind(this))
    }

    setCardWith() {
        this.cardOffsetWidth = (this.container.offsetWidth - 2 * this.cardMargin) * 4 / 7;

        this.cards.forEach(card => {
            card.style.width = this.cardOffsetWidth + 'px';
            card.style.height = this.cardOffsetWidth + 'px';
        })
    }

    updateCardWidth() {
        this.setCardWith();
        this.cardWidth = this.cards[0].offsetWidth / this.container.offsetWidth * 100;

        this.build()
    }

    build(fix = 0) {
        for (let i = 0; i < this.cards.length; i++) {
            const x = i - this.centerIndex;
            const scale = this.calcScale(x);
            const zIndex = -(Math.abs(i - this.centerIndex));

            const leftPos = this.initPos(x, scale);


            this.xScale[x] = this.cards[i];

            this.updateCards(this.cards[i], {
                x: x,
                scale: scale,
                leftPos: leftPos,
                // zIndex: zIndex
            })
        }
    }

    initPos(x) {
        if (x < 0) return -1 * (this.cardOffsetWidth + this.cardMargin);
        if (x === 0) return 0;
        if (x === 1) return this.cardOffsetWidth + this.cardMargin;
        if (x === 2) return 3 / 2 * this.cardOffsetWidth + 2 * this.cardMargin;
        return this.container.offsetWidth + this.cardMargin;
    }

    controller(e) {
        const temp = {...this.xScale};

        if (e.keyCode === 39) {
            // Left arrow
            for (let x in this.xScale) {
                const newX = (parseInt(x) - 1 < -this.centerIndex) ? this.centerIndex : parseInt(x) - 1;

                temp[newX] = this.xScale[x]
            }
        }

        if (e.keyCode === 37) {
            // Right arrow
            for (let x in this.xScale) {
                const newX = (parseInt(x) + 1 > this.centerIndex) ? -this.centerIndex : parseInt(x) + 1;

                temp[newX] = this.xScale[x]
            }
        }

        this.xScale = temp;

        for (let x in temp) {
            const scale = this.calcScale(x),
                scale2 = this.calcScale2(x),
                leftPos = this.calcPos(x, scale2),
                zIndex = -Math.abs(x);

            this.updateCards(this.xScale[x], {
                x: x,
                scale: scale,
                leftPos: leftPos,
                zIndex: zIndex
            })
        }
    }

/!*    calcPos(x, scale) {
       if (x < 0) return -1 * (this.cardOffsetWidth + this.cardMargin);
       if (x === 0) return 0;
       if (x < 1) return ;
       if (x === 1) return this.cardOffsetWidth + this.cardMargin;
       if (x === 2) return 3 / 2 * this.cardOffsetWidth + 2 * this.cardMargin;
        return this.container.offsetWidth + this.cardMargin;
    }*!/
    calcPos(x, scale) {
        console.log(scale);
        let formula;

        if (x < 0) {
            formula = -(scale * 100 - this.cardWidth) / 2;

            return formula

        } else if (x > 0) {

            formula = 100 - (scale * 100 + this.cardWidth) / 2;

            return formula
        }
    }


    updateCards(card, data, isPercent = false) {
        if (data.x || data.x === 0) {
            card.setAttribute("data-x", data.x)
        }

        if (data.scale || data.scale === 0) {
            card.style.transform = `scale(${data.scale > 1 ? 1 : data.scale})`;

            if (data.scale === 0) {
                card.style.opacity = data.scale
            } else {
                card.style.opacity = 1;
            }
        }

        if (data.leftPos) {
            if (!isPercent) {
                card.style.left = `${data.leftPos}px`
            }
            else {
                card.style.left = `${data.leftPos}%`
            }
        }

        if (data.zIndex || data.zIndex === 0) {
            if (data.zIndex === 0) {
                card.classList.add("highlight")
            } else {
                card.classList.remove("highlight")
            }

            card.style.zIndex = data.zIndex
        }
    }

    calcScale2(x) {
        let formula;

        if (x <= 0) {
            formula = 1 - -1 / 3 * x;

            return formula
        } else if (x > 0) {
            formula = 1 - 1 / 3 * x;

            return formula
        }
    }

    calcScale(x) {
        if (x < 1) return 1 - x / 2;
        return 1 / (2 * x);
    }

    /!*calcPos(x) {
        if (x < 0) {
            return -this.calcSizePercentOfContainer(this.cardOffsetWidth + this.cardMargin);
        }
        if (x > 2) {
            return this.calcSizePercentOfContainer(this.cardOffsetWidth / 2 + this.cardMargin) + 100;
        }
        if (x === 0) return 0;

        return this.calcScale(x) / 100;
    }
*!/
    calcSizePercentOfContainer(size) {
        return size / this.container.offsetWidth * 100;
    }

/!*    calcScale(x) {
        const formula = 1 - 1 / 3 * Math.pow(x, 2);

        if (formula <= 0) {
            return 0;
        } else {
            return formula;
        }
    }*!/

    checkOrdering(card, x, xDist) {
        const original = parseInt(card.dataset.x);
        const rounded = Math.round(xDist);
        let newX = x;

        if (x !== x + rounded) {
            if (x + rounded > original) {
                if (x + rounded > this.centerIndex) {

                    newX = ((x + rounded - 1) - this.centerIndex) - rounded + -this.centerIndex
                }
            } else if (x + rounded < original) {
                if (x + rounded < -this.centerIndex) {

                    newX = ((x + rounded + 1) + this.centerIndex) - rounded + this.centerIndex
                }
            }

            this.xScale[newX + rounded] = card;
        }


        this.updateCards(card, {});

        return newX;
    }

    moveCards(data) {
        let xDist;

        if (data != null) {
            this.container.classList.remove("smooth-return");
            xDist = data.x / 250;
        } else {

            this.container.classList.add("smooth-return");
            xDist = 0;

            for (let x in this.xScale) {
                this.updateCards(this.xScale[x], {
                    x: x,
                    zIndex: Math.abs(Math.abs(+x) - this.centerIndex)
                })
            }
        }

        for (let i = 0; i < this.cards.length; i++) {
            // const x = this.checkOrdering(this.cards[i], parseInt(this.cards[i].dataset.x), xDist),
            const x = parseInt(this.cards[i].dataset.x),
                scale = this.calcScale(x + xDist);
            // this.checkOrdering(this.cards[i], x, xDist);
            const step = xDist < 0 ? -100 : 100;
            this.updateCards(this.cards[i], {
                scale: scale,
                // leftPos: this.cards[i].offsetLeft + data?.x
            })
        }
    }
}

// const carousel = new CardCarousel(cardsContainer);
const carousel = new CardCarousel(document.querySelector('.slider-container'));

function slideToLeft() {
    carousel.controller({keyCode: 37})
}

function slideToRight() {
    carousel.controller({keyCode: 39})

}
*/

class CarouselSetting {
    dataSource;
    cardMargin;
    defClass;

    constructor(
        {
            dataSource,
            cardMargin,
            defClass
        }
    ) {
        this.dataSource = dataSource;
        this.cardMargin = cardMargin;
        this.defClass = defClass;
    }

    getTemplate() {
        let template = '';
        this.dataSource.forEach((item, index) => {
            template += `<div class="carousel-item ${this.defClass}">${item.text}</div>`
        });
        return template;
    }
}

class Carousel extends DraggingEvent {

    constructor(container, settings) {
        super(container);
        this.container = container;
        this.settings = settings;

        this.init();
    }

    drag = (changedPosition) => {
        if (changedPosition) {
            const deltaX = changedPosition.x / this.cardSize;
            this.render(deltaX);
        } else {
            this.calcActiveIndex();
            this.render()
        }
    };

    init() {
        this.container.innerHTML = this.settings.getTemplate();
        this.activeIndex = 0;
        this.calcCardsWith();
        this.getCards();
        this.setCardsDefaultSettings();
        this.firstRender();
        this.getDistance(this.drag);
    }

    firstRender() {
        this.cards.forEach((card, index) => {
            this.renderItem(card, index - this.activeIndex);
        })
    }

    calcCardsWith() {
        this.cardSize = (this.container.offsetWidth - 2 * this.settings.cardMargin) * 4 / 7;
        if (this.cardSize > this.container.offsetHeight) {
            this.cardSize = this.container.offsetHeight;
        }
    }

    getCards() {
        this.cards = document.querySelectorAll(`.${this.settings.defClass}`);
    }

    setCardsDefaultSettings() {
        this.cards.forEach((card, index) => {
            card.style.width = `${this.cardSize}px`;
            card.style.height = `${this.cardSize}px`;
            card.onclick = () => this.setToActive(index);
        })
    }

    renderItem(card, deltaI) {
        const newScale = this.calcScale(deltaI),
            newPosition = this.calcPosition(deltaI);
        card.style.left = `${newPosition}px`;
        card.style.transform = `scale(${newScale})`;
        card.setAttribute('data-scale', newScale);
    }

    calcPosition(i) {
        // if (i < -1) i = -1;
        return (2 ** i - 1) / (2 ** (i - 1)) * this.cardSize + i * this.settings.cardMargin;
    }

    calcScale(i) {
        // if (i < -1) i = -1;
        return 1 / (2 ** i);
    }

    render(deltaX = 0) {
        this.cards.forEach((card, index) => {
            this.renderItem(card, index + deltaX - this.activeIndex);
        });
    }

    setToActive(index) {
        this.updateActive(index);
        this.render();
    }

    slideStep(step) {
        this.updateActive(this.activeIndex + step);
        this.render();
    }

    calcActiveIndex() {
        let minDeltaScale = Infinity;
        let minIndex = null;
        this.cards.forEach((card, index) => {
            const deltaScale = Math.abs(1 - card.dataset.scale);
            if (deltaScale < minDeltaScale) {
                minDeltaScale = deltaScale;
                minIndex = index;
            }
        });
        if (minIndex !== null) {
            this.updateActive(minIndex);
        }
    }

    updateActive(index) {
        this.activeIndex = index;
    }

}
const carouselSetting = new CarouselSetting({
    dataSource: [
        {
            text: 1
        },
        {
            text: 2
        },
        {
            text: 3
        },
        {
            text: 4
        }
    ],
    cardMargin: 40,
    defClass: 'carousel-item'
});
const carouselContainer = document.querySelector('.container');
const carouselInstance = new Carousel(carouselContainer, carouselSetting);

function slideToLeft() {
    carouselInstance.slideStep(-1);
}

function slideToRight() {
    carouselInstance.slideStep(1);

}
