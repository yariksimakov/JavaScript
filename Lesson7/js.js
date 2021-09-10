"use strict";
const settings = {
    rowsCount: 21,
    colsCount: 21,
    speed: 2,
    winFoodCount: 50,
};

const config = {
    settings,

    init(userSettings) {
        Object.assign(this.settings, userSettings);
    },

    getRowsCount() {
        return this.settings.rowsCount;
    },

    getColsCount() {
        return this.settings.colsCount;
    },

    getSpeed() {
        return this.settings.speed;
    },

    getWinFoodCount() {
        return this.settings.winFoodCount;
    },

    validate() {
        const result = {
            isValid: true,
            errors: [],
        };

        if (this.getRowsCount() < 10 || this.getRowsCount() > 30) {
            result.isValid = false;
            result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
        }

        if (this.getColsCount() < 10 || this.getColsCount() > 30) {
            result.isValid = false;
            result.errors.push('Неверные настройки, значение colsCount должно быть в диапазоне [10, 30].');
        }

        if (this.getSpeed() < 1 || this.getSpeed() > 10) {
            result.isValid = false;
            result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
        }

        if (this.getWinFoodCount() < 5 || this.getWinFoodCount() > 50) {
            result.isValid = false;
            result.errors.push('Неверные настройки, значение winFoodCount должно быть в диапазоне [5, 50].');
        }

        return result;
    },
};

const map = {
    cells: {},
    usedCells: [],

    init(rowsCount, colsCount) {
        const table = document.getElementById('game');
        table.innerHTML = '';
        this.cells = {};
        this.usedCells = [];

        for (let row = 0; row < rowsCount; row++) {
            const tr = document.createElement('tr');
            tr.classList.add('row');
            table.appendChild(tr);

            for (let col = 0; col < colsCount; col++) {
                const td = document.createElement('td');
                td.classList.add('cell');

                const cellKey = `x${col}_y${row}`;
                this.cells[cellKey] = td;

                tr.appendChild(td);
            }
        }
    },

    render(snakePointsArray, foodPoint, obstaclesPoint) {
        for (const cell of this.usedCells) {
            cell.className = 'cell';
        }

        this.usedCells = [];

        snakePointsArray.forEach((point, index) => {
            const cellKey = `x${point.x}_y${point.y}`;
            const snakeCell = this.cells[cellKey];
            console.log(this.cells);
            snakeCell.classList.add(index === 0 ? 'snakeHead' : 'snakeBody');
            this.usedCells.push(snakeCell);
        });

        // create food
        const foodCellKey = `x${foodPoint.x}_y${foodPoint.y}`;
        const foodCell = this.cells[foodCellKey];
        foodCell.classList.add('food');
        this.usedCells.push(foodCell);

        // create obstacles
        const obstaclasCellKey = `x${obstaclesPoint.x}_y${obstaclesPoint.y}`;
        const obstaclesCell = this.cells[obstaclasCellKey];
        obstaclesCell.classList.add('obstacles');
        this.usedCells.push(obstaclesCell);

    },
};

const food = {
    x: null,
    y: null,

    getCoordinates() {
        return {
            x: this.x,
            y: this.y,
        };
    },

    setCoordinates(point) {
        this.x = point.x;
        this.y = point.y;
    },

    isOnPoint(point) {
        return this.x === point.x && this.y === point.y;
    },
};

const obstacles = {
    x: null,
    y: null,


    // отдать координаты припятствия
    getCoordinates(){
        return {
            x: this.x,
            y: this.y
        }
    },

    // Установить координаты для еды
    setCoordinates(point){
        this.x = point.x;
        this.y = point.y;
    },

    // проверка на соответствие 
    isOnPoint(point){
        return this.x === point.x && this.y === point.y;
    }
    
};

const snake = {
    body: [],
    direction: null,
    lastStepDirection: null,
    boardX: null,
    boardY: null,

    init(startBody, direction, boardX, boardY) {
        this.body = startBody;
        this.direction = direction;
        this.lastStepDirection = direction;
        this.boardX = boardX,
        this.boardY = boardY
    },

    getBody() {
        return this.body;
    },

    getLastStepDirection() {
        return this.lastStepDirection;
    },

    setDirection(direction) {
        this.direction = direction;
    },

    isOnPoint(point) {
        return this.getBody().some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y );
    },

    makeStep() {
        this.lastStepDirection = this.direction;
        this.getBody().unshift(this.getNextHeadPoint());
        this.getBody().pop();
    },

    growUp() {
        const lastBodyIndex = this.getBody().length - 1;
        const lastBodyPoint = this.getBody()[lastBodyIndex];
        const lastBodyPointClone = Object.assign({}, lastBodyPoint);

        this.getBody().push(lastBodyPointClone);
    },

    getNextHeadPoint() {
        const firstPoint = this.getBody()[0];

        switch (this.direction) {
            case 'up':
                return {x: firstPoint.x, y: firstPoint.y !== 0 ? firstPoint.y - 1 : this.boardY};
            case 'right':
                return {x: firstPoint.x !== this.boardX ? firstPoint + 1 : 0, y: firstPoint.y};
            case 'down':
                return {x: firstPoint.x, y: firstPoint.y !== this.boardY ? firstPoint + 1 : 0};
            case 'left':
                return {x: firstPoint.x !== 0 ? firstPoint - 1 : this.boardY, y: firstPoint.y};
        }
    },
};

const status = {
    condition: null,

    setPlaying() {
        this.condition = 'playing';
    },

    setStopped() {
        this.condition = 'stopped';
    },

    setFinished() {
        this.condition = 'finished';
    },

    isPlaying() {
        return this.condition === 'playing';
    },

    isStopped() {
        return this.condition === 'stopped';
    },
};


const countFood = {
    count: null,
    countByPlace: null,

    init(){
        this.countByPlace = document.getElementsByClassName('information');
        this.remove();
    },

    increment(){
        this.count++;
        this.render();
    },

    remove(){
        this.count = 0;
        this.render();
    },

    render(){
        this.countByPlace.txtContent = this.count;
    }
};





/**
 * Объект игры.
 * @property {obstacles} obstacles Преграда
 * @property {settings} settings Настройки игры.
 * @property {map} map Объект отображения.
 * @property {snake} snake Объект змейки.
 * @property {food} food Объект еды.
 * @property {status} status Статус игры.
 * @property {countFood} countFood Счетчик игры.
 * @property {int} tickInterval Номер интервала игры.
 */

const game = {
    config,
    map,
    snake,
    obstacles,
    food,
    countFood,
    status,
    tickInterval: null,

    init(userSettings = {}) {
        this.config.init(userSettings);
        const validation = this.config.validate();

        if (!validation.isValid) {
            for (const err of validation.errors) {
                console.error(err);
            }
            return;
        }

        this.map.init(this.config.getRowsCount(), this.config.getColsCount());

        this.countFood.init();
        this.setEventHandlers();
        this.reset();
    },

    setEventHandlers() {
        document.getElementById('playButton').addEventListener('click', () => {
            this.playClickHandler();
        });
        document.getElementById('newGameButton').addEventListener('click', () => {
            this.newGameClickHandler();
        });
        document.addEventListener('keydown', event => this.keyDownHandler(event))
    },

    reset() {
        this.stop();
        this.countFood.remove();
        this.snake.init(this.getStartSnakeBody(), 'up', this.config.getColsCount()-1, this.config.getRowsCount()-1);
        this.obstacles.setCoordinates(this.getRandomFreeCoordinates());
        this.food.setCoordinates(this.getRandomFreeCoordinates());
        this.render();

    },

    render() {
        this.map.render(this.snake.getBody(), this.food.getCoordinates(), this.obstacles.getCoordinates());
    },

    getStartSnakeBody() {
        return [
            {
                x: Math.floor(this.config.getColsCount() / 2),
                y: Math.floor(this.config.getRowsCount() / 2),
            },
        ];
    },

    getRandomFreeCoordinates() {
        const exclude = [this.food.getCoordinates(), this.obstacles.getCoordinates(), ...this.snake.getBody()];

        while (true) {
            const rndPoint = {
                x: Math.floor(Math.random() * this.config.getColsCount()),
                y: Math.floor(Math.random() * this.config.getRowsCount()),
            };

            if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) return rndPoint;
        }
    },

    playClickHandler() {
        if (this.status.isPlaying()) {
            this.stop();
        } else if (this.status.isStopped()) {
            this.play();
        }
    },

    newGameClickHandler() {
        this.reset();
    },

    keyDownHandler(event) {
        if (!this.status.isPlaying()) return;

        const direction = this.getDirectionByCode(event.code);
        if (this.canSetDirection(direction)) this.snake.setDirection(direction);
    },

    getDirectionByCode(code) {
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                return 'up';
            case 'KeyD':
            case 'ArrowRight':
                return 'right';
            case 'KeyS':
            case 'ArrowDown':
                return 'down';
            case 'KeyA':
            case 'ArrowLeft':
                return 'left';
        }
    },

    canSetDirection(direction) {
        const lastStepDirection = this.snake.getLastStepDirection();

        return direction === 'up' && lastStepDirection !== 'down' ||
            direction === 'right' && lastStepDirection !== 'left' ||
            direction === 'down' && lastStepDirection !== 'up' ||
            direction === 'left' && lastStepDirection !== 'right';
    },

    play() {
        this.status.setPlaying();
        this.tickInterval = setInterval(() => this.tickHandler(), 1000 / this.config.getSpeed());
        this.setPlayButton('Стоп');
    },

    stop() {
        this.status.setStopped();
        clearInterval(this.tickInterval);
        this.setPlayButton('Старт');
    },

    finish() {
        this.status.setFinished();
        clearInterval(this.tickInterval);
        this.setPlayButton('Игра завершена', true);
    },

    setPlayButton(text, isDisabled = false) {
        const playButton = document.getElementById('playButton');

        playButton.textContent = text;

        isDisabled
            ? playButton.classList.add('disabled')
            : playButton.classList.remove('disabled');
    },

    tickHandler() {
        if (!this.canMakeStep()) return this.stop();

        const nextStepsnake = this.snake.getNextHeadPoint();
        if (this.obstacles.isOnPoint(nextStepsnake)) return this.finish();

        
        if (this.food.isOnPoint(nextStepsnake)) {
            this.snake.growUp();
            this.countFood.increment();
            this.food.setCoordinates(this.getRandomFreeCoordinates());

            if (this.isGameWon()) this.finish();
        }

        this.snake.makeStep();
        this.render();
    },

    isGameWon() {
        return this.snake.getBody().length > this.config.getWinFoodCount();
    },

    canMakeStep() {
        const nextHeadPoint = this.snake.getNextHeadPoint();

        return !this.snake.isOnPoint(nextHeadPoint) 
            // &&
            // nextHeadPoint.x < this.config.getColsCount() &&
            // nextHeadPoint.y < this.config.getRowsCount() &&
            // nextHeadPoint.x >= 0 &&
            // nextHeadPoint.y >= 0;
    }
};

window.onload = game.init({speed: 7});
