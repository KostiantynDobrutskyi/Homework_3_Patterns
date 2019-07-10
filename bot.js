class BotRace {
    create(type, object, time) {
        let racers;
        if (type === 'getriders') {
            racers = new Riders(object)
        } else if (type === 'getwinners') {
            racers = new Winners(object)
        } else if (type === 'process') {
            racers = new Process(object, time)
        } else if (type === 'salute') {
            racers = new Salute()
        }

        racers.say = function () {
            return this.info
        };

        return racers;
    }
}


class Salute {
    constructor() {
        this.info = 'Доброго Вам дня панове! Я, Ескейп Ентерович Вам буду коментувати це все дійстово'
    }
}


class Riders {
    constructor(clients) {
        this.info = `А тим часом список гонщиків <br> ${this.showRiders(clients)}`;
    }

    showRiders(clients) {
        let riders = [];
        for (let key in clients) {
            riders.push(clients[key].name)
        }
        return riders.join("<br>");
    }
}

class Winners {
    constructor(clients) {
        this.info = `Список переможців <br> ${this.getWinners(clients)}`
    }

    getWinners(clients) {
        let keysSorted = Object.keys(clients).sort((a, b) => {
            return clients[b].progress - clients[a].progress
        });

        let mas = [];

        for (let i = 0; i < keysSorted.length; i++) {
            mas.push(`${i + 1}. ${clients[keysSorted[i]].name}`);
        }

        return mas.join('<br>');
    }
}

class Process extends Winners {
    constructor(clients, time) {
        super(clients);
        this.info = `Список лідерів на ${this.getTime(time)} хвилині гонки: <br> ${super.getWinners(clients)}`

    }

    getTime(time) {
        let minute = Math.floor(time / 60);
        let second = time - minute * 60;

        return minute + ":" + second;
    }
}


module.exports = BotRace;
