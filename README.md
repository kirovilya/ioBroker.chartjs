![Logo](admin/chartjs.png)
# ioBroker.chartjs

[![NPM version](http://img.shields.io/npm/v/iobroker.chartjs.svg)](https://www.npmjs.com/package/iobroker.chartjs)
[![Downloads](https://img.shields.io/npm/dm/iobroker.chartjs.svg)](https://www.npmjs.com/package/iobroker.chartjs)
![Number of Installations (latest)](http://iobroker.live/badges/chartjs-installed.svg)
![Number of Installations (stable)](http://iobroker.live/badges/chartjs-stable.svg)
[![Dependency Status](https://img.shields.io/david/kirovilya/iobroker.chartjs.svg)](https://david-dm.org/kirovilya/iobroker.chartjs)
[![Known Vulnerabilities](https://snyk.io/test/github/kirovilya/ioBroker.chartjs/badge.svg)](https://snyk.io/test/github/kirovilya/ioBroker.chartjs)

[![NPM](https://nodei.co/npm/iobroker.chartjs.png?downloads=true)](https://nodei.co/npm/iobroker.chartjs/)

## Chart.JS adapter for ioBroker

Based on https://github.com/SeanSobey/ChartjsNodeCanvas - a Node JS renderer for [Chart.js](http://www.chartjs.org) using [canvas](https://github.com/Automattic/node-canvas).

### Getting started

Example script:
```
const chartColors = {
    black: 'rgb(0, 0, 0)',
    white: 'rgb(255, 255, 255)', 
    red: 'rgb(255, 0, 0)',
    pink: 'rgb(255, 220, 220)',
    pink2: 'rgb(255, 150, 150)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 255, 0)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)',
    violet: 'rgb(238,130,238)',
};


function prepareDraw(){
    // переменная, куда сохраним данные
    var пример;
    // создадим Promise сборки данных и конфигурации
    return new Promise((resolve, reject)=>{resolve()})
        // здесь могут быть много шагов сбора данных, прежде чем перейти к графику
        .then(()=>{
            // произвольные данные, похожие на те, что хранятся в истории
            пример = [
                {"val":3,"ack":1,"ts":1539063874301},
                {"val":5,"ack":1,"ts":1539063884299},
                {"val":5.3,"ack":1,"ts":1539063894299},
                {"val":3.39,"ack":1,"ts":1539063904301},
                {"val":5.6,"ack":1,"ts":1539063914300},
                {"val":-1.3,"ack":1,"ts":1539063924300},
                {"val":-6.3,"ack":1,"ts":1539063934302},
                {"val":1.23,"ack":1,"ts":1539063944301},
            ];
        })
        // финальный шаг - создаем конфигурацию графиков
        .then(()=>{
            const chartJsOptions = {
                // тип графика - линейный
                type: 'line',
                data: {
                    // список наборов данных
                    datasets: [
                    {
                        // заголовок ряда 
                        label: 'тест',
                        // цвет
                        //backgroundColor: chartColors.white,
                        backgroundColor: 'transparent',
                        borderColor: chartColors.red,
                        // размер точек
                        pointRadius: 3,
                        // ширина линии графика
                        borderWidth: 3,
                        // достанем данные из переменной 'пример' и оставим только значение и время изменения
                        data: пример.map((item) => {
                            return {y: item.val, t: new Date(item.ts)}
                        }),
                        // заливка графика - нет
                        fill: false,
                        cubicInterpolationMode: 'monotone',
                        borderCapStyle: 'round'
                    }
                    ]
                },
                options: {
                    // настройка легенды
                    legend: {
                        labels: {
                            // размер шрифта
                            fontSize: 20,
                        },
                    },
                    layout: {
                        padding: 10,
                        lineHeight: 1
                    },
                    linearGradientLine: true,
                    // оси координат
                    scales: {
                        // оси X
                        xAxes: [{
                            // тип - временная ось
                            type: 'time',  
                            display: true,
                            // метка оси
                            scaleLabel: {
                                display: true,
                                labelString: 'Время'
                            },
                        }],
                        // оси Y
                        yAxes: [{
                            // тип - линейная
                            type: 'linear',
                            display: true,
                            // метка оси
                            scaleLabel: {
                                display: true,
                                labelString: 'Температура'
                            },
                            position: 'left',
                        }]
                    }
                }
            };
            return chartJsOptions;
        });
}

// подготовим конфиг
prepareDraw().then((config) => {
    // вызовем функцию построения графика
    // для этого отправим сообщение в инстанс адаптера
    sendTo('chartjs.0', 'gen2file', {
        width: 800,               // ширина картинки
        height: 400,              // высота картинки
        config: config,           // конфигурация графика
        filename: "d:\\test.png"  // файл, куда сохранить результат
    }, () => {
        console.log('ok');
    });
});
```

## Changelog

### 0.0.1
* (kirovilya) initial release

## License
MIT License

Copyright (c) 2020 Kirov Ilya <kirovilya@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.