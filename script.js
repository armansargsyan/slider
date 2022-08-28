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
                if (this.dragStarted) {
                    handler(null)
                }
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
                if (this.dragStarted) {
                    handler(null)
                }
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
    dragSensitivity;
    paginationCount;
    showedData;
    transitionHideSensitivity;

    constructor(
        {
            dataSource,
            cardMargin,
            defClass,
            showedSlidesCount,
            paginationSize,
            dragSensitivity,
            transitionHideSensitivity
        }
    ) {
        this.dataSource = dataSource;
        this.cardMargin = cardMargin;
        this.defClass = defClass;
        this.showedSlidesCount = showedSlidesCount;
        this.paginationSize = paginationSize;
        this.dragSensitivity = dragSensitivity;
        this.transitionHideSensitivity = transitionHideSensitivity;
    }

    getTemplate() {
        let template = '';
        this.paginationCount = this.dataSource.length;
        this.showedData = this.setMinNeededItems(this.dataSource);
        this.showedData.forEach((item, index) => {
            template += `<div class="carousel-item ${this.defClass}" style="background-image: url('${item.image}')"></div>`
        });
        return template;
    }

    setMinNeededItems(data) {
        const minCount = this.showedSlidesCount + 2 * (this.showedSlidesCount - 1);
        const num = minCount / data.length;
        let sumNum = 2;
        let resultArray = [];
        if (num > 2) {
            sumNum = Math.floor(num) + 1;
        }
        for (let i = 0 ; i < sumNum; i++) {
            resultArray = [...resultArray, ...data];
        }
        return resultArray;
    }
}

class Carousel extends DraggingEvent {

    constructor(elements, settings) {
        super(elements.container);
        this.container = elements.container;
        this.settings = settings;
        this.elements = elements;
        this.init(elements);


    }

    drag = (changedPosition) => {
        if (changedPosition) {
            const deltaX = changedPosition.x / this.cardSize;
            this.render(deltaX);
            this.lastDragDirection = deltaX;
        } else {
            this.calcActiveIndex();
            this.render();
        }
    };

    init(elements = this.elements) {
        if (window.innerWidth < 500) {
            this.settings.showedSlidesCount = 1;
            this.settings.cardMargin = 50;
            this.settings.transitionHideSensitivity = 0.2;
        } else if (window.innerWidth < 900) {
            this.settings.showedSlidesCount = 2;
        }
        this.container.innerHTML = this.settings.getTemplate();
        this.calcCardsWith();
        this.getCards();
        this.setCardsDefaultSettings();
        this.setCardsClickHandler();
        this.initControls(elements);
        this.updateActive(0);

        this.firstRender();
        this.getDistance(this.drag);
        window.addEventListener("resize", this.updateCardWidth)

    }


    initControls(elements) {
        elements.leftButton.onclick = (e) => {
            e.target.disabled = true;
            setTimeout(() => {
                e.target.disabled = false;
            }, 300);
            this.slideStep(1);
        };
        elements.rightButton.onclick = (e) => {
            e.target.disabled = true;
            setTimeout(() => {
                e.target.disabled = false;
            }, 500);
            this.slideStep(-1)
        };
        elements.pagination.style.width = `${this.settings.paginationCount * this.settings.paginationSize}px`;
        elements.pagination.onclick = (e) => this.paginationClick(e);
        this.paginationIndicator = elements.pagination.querySelector('span');
        this.paginationIndicator.onclick = (e) => {
            e.stopPropagation();
        };
        this.paginationIndicator.style.width = `${this.settings.paginationSize}px`;
        this.sliderDataControls = elements.sliderDataControls;
    }

    updateCardWidth = (e) => {
        this.init()
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

        if (deltaI < (this.settings.showedSlidesCount + 1) - this.cards.length) {
            deltaI = deltaI + this.cards.length;
        } else if (deltaI > this.cards.length - this.settings.showedSlidesCount) {
            deltaI = deltaI - this.cards.length;
        }
            const newScale = this.calcScale(deltaI),
                newPosition = this.calcPosition(deltaI);
        if (Math.abs(card.dataset.position - newPosition) * this.settings.transitionHideSensitivity > +this.container.offsetWidth) {
            card.style.transition = '0s';
        }
        card.style.left = `${newPosition}px`;
            card.style.transform = `scale(${newScale})`;
            card.setAttribute('data-position', newPosition);
            setTimeout(() => {
                card.style.transition = 'inherit';
            });
    }

    calcPosition(i) {
        return (2 ** i - 1) / (2 ** (i - 1)) * this.cardSize + i * this.settings.cardMargin;
    }

    calcScale(i) {
        if (i <= 0 || this.settings.showedSlidesCount === 1) return 1;
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
        let minDeltaPosition = Infinity;
        let minIndex = null;
        this.cards.forEach((card, index) => {
            const deltaPosition = Math.abs(+card.dataset.position);
            if (deltaPosition < minDeltaPosition) {
                minDeltaPosition = deltaPosition;
                minIndex = index;
            }
        });
        if (minIndex !== null) {
            if (this.lastDragDirection > 0) {
                minIndex--;
                if (minIndex < 0) {
                    minIndex = this.cards.length + minIndex;
                }
            } else if (minDeltaPosition / this.cardSize > this.settings.dragSensitivity) {
                minIndex++;
                const count = Math.floor(minIndex / this.cards.length);
                if (Math.abs(count) >= 1) {
                    minIndex = minIndex - count * this.cards.length;
                }

            }
            this.updateActive(minIndex);
        }

        }
    paginationClick(e) {
        let index = Math.floor(e.offsetX / this.settings.paginationSize);
        index = this.calcNearIndex(index);
        if (index === this.cards.length) {
            index--;
        }
        if (index !== this.activeIndex) {
            this.setToActive(index);
        }
    }

    calcNearIndex(index) {
        const firstIndex = this.calcRealIndex(index),
            secondIndex = firstIndex + this.settings.paginationCount, thirdIndex = firstIndex - this.settings.paginationCount;
        let firstDist = Math.abs(this.activeIndex - firstIndex);
        let secondDist = Math.abs(secondIndex - this.activeIndex);
        let thirdDist = Math.abs(this.activeIndex - thirdIndex);
        let result = secondDist <= firstDist ?
            (secondDist <= thirdDist ? secondIndex : thirdIndex)
            : (firstDist <= thirdDist ? firstIndex : thirdIndex);
        if (result >= this.cards.length) {
            result = result - Math.floor(result / this.cards.length) * this.cards.length;
        } else if (result < 0) {
            result = this.cards.length + result;
        }
        return result;

    }

    calcRealIndex(index) {
        const count = Math.floor(this.activeIndex / this.settings.paginationCount);
        return index + count * this.settings.paginationCount;
    }

    updateActive(index) {
        this.activeIndex = index;
        this.updateSlideData(this.settings.showedData[this.activeIndex]);
    }

    renderPagination(step = this.activeIndex) {
        if (step > (this.settings.paginationCount - 1)) {
            step = step - Math.floor((step / this.settings.paginationCount)) * this.settings.paginationCount;
        }
        let position = step * this.settings.paginationSize;
        this.paginationIndicator.style.left = `${position}px`
    }

    updateSlideData(card) {
        this.sliderDataControls.name.innerHTML = card.name;
        this.sliderDataControls.type.innerHTML = card.type;
        this.sliderDataControls.desc.innerHTML = card.description;
    }
}
const carouselSetting = new CarouselSetting({
    dataSource: [
        {
            name: 'Name 1',
            type: 'Type 1',
            description: 'description 1',
            image: './assets/hit_apelsin.png'
        },
        {
            name: 'Name 2',
            type: 'Type 2',
            description: 'description 2',
            image: './assets/hit_blackberry.png'
        },
        {
            name: 'Name 3',
            type: 'Type 3',
            description: 'description 3',
            image: './assets/hit_bluberry.png'
        },
        {
            name: 'LEMONGRASS',
            type: 'ALL WHITE PORTION',
            description: 'White Fox Peppered Mint is a white, tobacco-free product with a very fresh peppermint flavoring, topped of by a hint of black pepper oil – spicy! topped of by a hint of black pepper oil – spicy! topped of by a hint of black pepper oil – spicy! topped of by a hint of',
            image: './assets/hit_lemongrass.png'
        },
    ],
    cardMargin: 40,
    defClass: 'carousel-item',
    showedSlidesCount: 3,
    paginationSize: 50,
    dragSensitivity: 0.3,
    transitionHideSensitivity: 0.5
});
const carouselElements = {
    container: document.querySelector('.container'),
    pagination: document.querySelector('.pagination'),
    leftButton: document.querySelector('.leftButton'),
    rightButton: document.querySelector('.rightButton'),
    sliderDataControls: {
        parent: document.querySelector('.slider-data'),
        name: document.querySelector('.slider-name'),
        type: document.querySelector('.slider-type'),
        desc: document.querySelector('.slider-desc'),

    }
};
const carouselInstance = new Carousel(carouselElements, carouselSetting);
