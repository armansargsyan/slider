class DraggingEvent {
    dragStarted = false;
    constructor(target = undefined) {
        this.target = target;
    }

    event(callback) {
        let handler, moveHandler;

        this.target.addEventListener("mousedown", e => {
            this.target.classList.add('dragging');
            e.preventDefault();

            handler = callback(e);
            moveHandler = (e) => {
                // need to disable click handler in drag case
                this.dragStarted = true;
                handler(e)
            };

            const clearDraggingEvent = () => {
                this.target.classList.remove('dragging');

                window.removeEventListener("mousemove", moveHandler);
                window.removeEventListener("mouseup", clearDraggingEvent);

                document.removeEventListener("mouseleave", clearDraggingEvent);

                handler(null)
            };

            window.addEventListener("mousemove", moveHandler);

            document.addEventListener("mouseleave", clearDraggingEvent);

            window.addEventListener("mouseup", clearDraggingEvent);


        });

        this.target.addEventListener("touchstart", e => {
            this.target.classList.add('dragging');

            handler = callback(e);
            moveHandler = (e) => {
                // need to disable click handler in drag case
                this.dragStarted = true;
                handler(e)
            };

            const clearDraggingEvent = () => {
                this.target.classList.remove('dragging');

                window.removeEventListener("touchmove", moveHandler);
                window.removeEventListener("touchend", clearDraggingEvent);

                handler(null)
            };

            window.addEventListener("touchmove", moveHandler);

            window.addEventListener("touchend", clearDraggingEvent);

            document.body.addEventListener("mouseleave", clearDraggingEvent);


        })
    }

    dragEnd() {
        this.dragStarted = false;
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
    showedSlidesCount;
    paginationSize;

    constructor(
        {
            dataSource,
            cardMargin,
            defClass,
            showedSlidesCount,
            paginationSize
        }
    ) {
        this.dataSource = dataSource;
        this.cardMargin = cardMargin;
        this.defClass = defClass;
        this.showedSlidesCount = showedSlidesCount;
        this.paginationSize = paginationSize;
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

    constructor(elements, settings) {
        super(elements.container);
        this.container = elements.container;
        this.settings = settings;

        this.init(elements);


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

    init(elements) {
        this.container.innerHTML = this.settings.getTemplate();
        this.activeIndex = 0;
        this.calcCardsWith();
        this.getCards();
        this.setCardsDefaultSettings();
        this.setCardsClickHandler();
        this.initControls(elements);
        this.firstRender();
        this.getDistance(this.drag);
        window.addEventListener("resize", this.updateCardWidth)

    }

    initControls(elements) {
        elements.leftButton.onclick = () => this.slideStep(-1);
        elements.rightButton.onclick = () => this.slideStep(1);
        elements.pagination.style.width = `${this.cards.length * this.settings.paginationSize}px`;
        elements.pagination.onclick = (e) => this.paginationClick(e);
        this.paginationIndicator = elements.pagination.querySelector('span');
        this.paginationIndicator.onclick = (e) => {
            e.stopPropagation();
        };
        this.paginationIndicator.style.width = `${this.settings.paginationSize}px`;
    }

    updateCardWidth = () => {
        this.calcCardsWith();
        this.setCardsDefaultSettings();
        this.firstRender();

    };

    firstRender() {
        this.cards.forEach((card, index) => {
            this.renderItem(card, index - this.activeIndex);
        });
        this.renderPagination()
    }

    calcCardsWith() {
        const slidesCount = this.settings.showedSlidesCount;
        this.cardSize = (this.container.offsetWidth - (slidesCount - 1) * this.settings.cardMargin) * 2 ** (slidesCount - 1) / (2 ** slidesCount - 1);
        if (this.cardSize > this.container.offsetHeight) {
            this.cardSize = this.container.offsetHeight;
        }
    }

    getCards() {
        this.cards = document.querySelectorAll(`.${this.settings.defClass}`);
    }

    setCardsDefaultSettings() {
        this.cards.forEach((card) => {
            card.style.width = `${this.cardSize}px`;
            card.style.height = `${this.cardSize}px`;
        });
    }

    setCardsClickHandler() {
        this.cards.forEach((card, index) => {
            card.onclick = () => this.setToActive(index);
        });
    }

    renderItem(card, deltaI) {
        let isTransitionOff = false;

        if (deltaI < this.settings.showedSlidesCount - this.cards.length) {
            deltaI = deltaI + this.cards.length;
            isTransitionOff = true;
        } else if (deltaI > this.cards.length - 1) {

            deltaI = deltaI - this.cards.length;
            isTransitionOff = true;
        }
        const newScale = this.calcScale(deltaI),
            newPosition = this.calcPosition(deltaI);
        // card.style.zIndex = `${zIndex}`;
        if (isTransitionOff) {
            // card.style.transitionDelay = '0s';
        }
        card.style.left = `${newPosition}px`;
        card.style.transform = `scale(${newScale})`;
        card.setAttribute('data-scale', newScale);
        if (isTransitionOff) {
        }
    }

    calcPosition(i) {
        return (2 ** i - 1) / (2 ** (i - 1)) * this.cardSize + i * this.settings.cardMargin;
    }

    calcScale(i) {
        if (i <= 0) return 1;
        return 1 / (2 ** i);
    }

    render(deltaX = 0) {
        this.cards.forEach((card, index) => {
            this.renderItem(card, index + deltaX - this.activeIndex);
        });
        this.renderPagination();

    }

    setToActive(index) {
        if (this.dragStarted) {
            super.dragEnd();
            return;
        }
        this.updateActive(index);
        this.render();
    }

    slideStep(step) {
        let newActiveIndex = this.activeIndex + step;
        const count = Math.floor(newActiveIndex / this.cards.length);
        if (Math.abs(count) >= 1) {
            newActiveIndex = newActiveIndex - count * this.cards.length;
        }
        if (newActiveIndex !== this.activeIndex) {
            this.updateActive(newActiveIndex);
            this.render()
        }
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
    paginationClick(e) {
        const index = Math.floor(e.offsetX / this.settings.paginationSize);
        if (index !== this.activeIndex) {
            this.setToActive(index);
        }
    }

    updateActive(index) {
        this.activeIndex = index;
    }

    renderPagination(step = this.activeIndex) {
        let position = step * this.settings.paginationSize;
        this.paginationIndicator.style.left = `${position}px`
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
        },
        // {
        //     text: 5
        // },
        // {
        //     text: 6
        // },
        // {
        //     text: 7
        // }
    ],
    cardMargin: 40,
    defClass: 'carousel-item',
    showedSlidesCount: 3,
    paginationSize: 50
});
const carouselElements = {
    container: document.querySelector('.container'),
    pagination: document.querySelector('.pagination'),
    leftButton: document.querySelector('.leftButton'),
    rightButton: document.querySelector('.rightButton'),
};
const carouselInstance = new Carousel(carouselElements, carouselSetting);
