
var data = {
        startObj: {},
        finishObj: {},
        startCoords: [],
        finishCoords: [],
        startAddress: '',
        finishAddress: '',
        distance: '',
        tarif: 50,
        minimumCost: 500,
        cost: ''
    },
    myMap,
    myStartPos,
    myFinishPos;

var app = new Vue({
    el: '#app',
    data: data,
    methods: {
        mapInit: function(){
            var geolocation = ymaps.geolocation;

            geolocation.get({ 
                provider: 'yandex',
                mapStateAutoApply: true
            }).then(function (result) {
                data.startCoords = result.geoObjects.position || [59.935241,30.322039];


            // Карта
                myMap = new ymaps.Map('map', { //рисуем карту с центром который определился
                    center: data.startCoords,
                    zoom: 14,
                    controls: []
                });


            // Старт
                myStartPos = new ymaps.GeoObject({ 
                    geometry: {
                       type: "Point",
                        coordinates: data.startCoords
                    },
                    properties: {
                        iconContent: 'Вы здесь'
                    }
                }, {
                    preset: 'islands#blackStretchyIcon',
                    draggable: true
                });
                myMap.geoObjects.add(myStartPos);
                app.getStart();

                //  Драг
                myStartPos.events.add('dragend', function (e) { // вешаем обработчик перемещения
                    data.startCoords = e.get('target').geometry.getCoordinates();
                    app.getStart();
                });


            // Финиш
                myFinishPos = new ymaps.GeoObject({ 
                    geometry: {
                       type: "Point",
                       coordinates: [0,0]
                    },
                    properties: {
                        iconContent: 'Едем сюда'
                    }
                }, {
                    preset: 'islands#blackStretchyIcon',
                    draggable: true
                });

                //  Драг
                myFinishPos.events.add('dragend', function (e) { 
                    var coords = e.get('target').geometry.getCoordinates();

                    data.finishCoords = coords;

                    app.getFinish();
                    //app.getScale(myMap); не скалим карту после драга - неудобно

                    app.route(myMap);
                });

                // Клик - Добавляем, меняем финищ
                myMap.events.add('click', function (e) {
                    var coords = e.get('coords');

                    data.finishCoords = coords;

                    myFinishPos.geometry.setCoordinates(coords);
                    myMap.geoObjects.add(myFinishPos);

                    app.getFinish();
                    app.getScale(myMap);

                    app.route(myMap);
                });
            });
        },
        getStartGeo: function(){
            var geolocation = ymaps.geolocation;

            geolocation.get({ 
                provider: 'browser',
                mapStateAutoApply: true
            }).then(function (result) {
                data.startCoords = result.geoObjects.position;

                myStartPos.geometry.setCoordinates(data.startCoords);
                myMap.geoObjects.add(myStartPos);

                app.getStart();
                app.setCenter();
            })
        },
        setCenter: function(finish){
            if (finish) {
                myMap.setCenter(data.finishCoords, 14);
            } else {
                myMap.setCenter(data.startCoords, 14);
            }
        
        },
        getStart: function() {
            ymaps.geocode(data.startCoords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                data.startAddress = firstGeoObject.properties.get('name');
            });
        },
        getFinish: function() {
            ymaps.geocode(data.finishCoords, {
                kind: 'house'
            }).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);
                data.finishAddress = firstGeoObject.properties.get('name');
            });
        },
        getScale: function(myMap){
            var bounds = myMap.geoObjects.getBounds();

            myMap.setBounds(bounds);
        },
        search: function(myMap) {

        },
        route: function(myMap){
            ymaps.route([data.startCoords, data.finishCoords]).then(function (router) {
                data.distance = Math.round(router.getLength() / 1000);

                app.calculate(data.distance)
            })
        },
        calculate: function (routeLength) {
            var DELIVERY_TARIF = data.tarif, // Стоимость за километр.
                MINIMUM_COST = data.minimumCost; // Минимальная стоимость.
            
            data.cost = Math.max(routeLength * DELIVERY_TARIF, MINIMUM_COST);
            
        }
    }
});

ymaps.ready(app.mapInit);


