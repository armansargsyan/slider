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
