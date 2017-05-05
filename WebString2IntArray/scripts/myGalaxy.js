class Galaxy {
    constructor(galaxyWrapper, count) {
        var me = this;
        var GlobalId = 0;
        var maxX = getDocumentWidth(galaxyWrapper);
        var maxY = getDocumentHeight(galaxyWrapper);
        var Elements = [];
        var isRun = false;
        var mouseIsTracked = true;
        var GalaxyWrapper = galaxyWrapper;
        var galaxyElementInfo = new GalaxyElementInfo(GalaxyWrapper);

        var readMaxXYTimer = setInterval(
            function () {
                maxX = getDocumentWidth(galaxyWrapper);
                maxY = getDocumentHeight(galaxyWrapper);
            },
            50
        );

        var galaxyElementInfoTimer = setInterval(
                function () {
                    galaxyElementInfo.Update();
                }
            );

        me.getElements = function () { return Elements };
        me.getReadMaxXYTimer = function () { return readMaxXYTimer };
        me.getMaxX = function () { return maxX };
        me.getMaxY = function () { return maxY };
        me.getIsRun = function () { return isRun; };
        me.getMouseIsTracked = function () { return mouseIsTracked };
        me.getGlobalId = function () { return GlobalId }
        me.getNextGlobalId = function () { return GlobalId++ }
        me.getGalaxyWrapper = function () { return GalaxyWrapper }

        me.setMouseIsTracked = function (isTracked) {
            mouseIsTracked = isTracked
            if (!isTracked) {
                var stars = me.getElements();
                for (var i = 0; i < stars.length; i++) {
                    if (stars[i] instanceof Star) {
                        stars[i].setTargetX(1000);
                        stars[i].setTargetY(null);
                    }
                }
            }
        }

        me.addGalaxyElement = function (galaxyElement) {
            Elements.push(galaxyElement);
        }

        me.Start = function () {
            if (!Elements.length) {
                initElements(count);                
            }
            else {
                for (var i = 0; i < Elements.length; i++) {
                    if (Elements[i] instanceof Star) {
                        Elements[i].Start();
                    }
                }
            }
            isRun = true;
        };
        me.Stop = function () {
            for (var i = 0; i < Elements.length; i++) {
                if (Elements[i] instanceof Star) {
                    Elements[i].Stop();
                }
            };
            isRun = false;
        };
        me.Clear = function () {
            if (Elements.length) {
                for (var i = 0; i < Elements.length; i++) {
                    Elements[i].Clear();
                    Elements[i] = null;
                };
                Elements = [];
                galaxyElementInfo.setInfo(null);
                isRun = false;
            }
        };

        me.unSelectAll = function () {
            if (Elements.length) {
                for (var i = 0; i < Elements.length; i++) {
                    Elements[i].unSelect();
                }
            }
        }

        //Відстеженя миші
        document.documentElement.addEventListener('mousemove', function (e) {
            if (me.getMouseIsTracked() && me.getElements()) {
                var stars = me.getElements();
                for (var i = 0; i < stars.length; i++) {
                    if (stars[i] instanceof Star) {
                        stars[i].setTargetX(e.pageX);
                        stars[i].setTargetY(e.pageY);
                    }
                }
            }
        });
        GalaxyWrapper.addEventListener('click', function (e) {
            var element = e.srcElement;
            if (element.classList.contains('galaxy-element')) {
                var galaxyElement = Elements[element.getAttribute('index')];
                if (galaxyElement.isSelected()) {
                    galaxyElement.unSelect();
                    galaxyElementInfo.setInfo(null);
                }
                else {
                    me.unSelectAll();
                    galaxyElement.Select();
                    galaxyElementInfo.setInfo(galaxyElement);
                }
            }
            else {
                me.unSelectAll();
                galaxyElementInfo.setInfo(null);
            }
            console.log(element.classList.contains('galaxy-element'));
        });

        function initElements(count) {
            Elements = [];
            for (var i = 0; i < count; i++) {
                //var size = Random(20) + 10;
                var size = 25;
                var speed = Random(20) + 10;
                var color = speed / 100; 
                var star = new Star(
                    Random(getDocumentWidth(galaxyWrapper)),
                    Random(getDocumentHeight(galaxyWrapper)),
                    speed,
                    size,
                    color,
                    i,
                    me,
                    1,
                    Planet,
                    3,
                    //pathCalc
                    function (me) {
                        var delta = new Date() - me.getLastTime();
                        me.setLastTime();
                        var dx = 0;
                        var dy = 0;
                        if (me.getTargetX() !== null) {
                            dx = me.getTargetX() - me.getX();
                        }
                        if (me.getTargetY() !== null) {
                            dy = me.getTargetY() - me.getY();
                        }
                        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                        me.setX(me.getX() + (dx * delta * me.getSpeed() / 1000) / dist);
                        me.setY(me.getY() + (dy * delta * me.getSpeed() / 1000) / dist);
                    },
                    //flyOut
                    function (me) {
                        var k = 1.05;
                        var dx = 0;
                        var dy = 0;
                        if (me.getTargetX() !== null) {
                            dx = me.getTargetX() - me.getX();
                        }
                        if (me.getTargetY() !== null) {
                            dy = me.getTargetY() - me.getY();
                        }
                        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                        if (me.getX() > me.getGalaxy().getMaxX() - me.getSize() * k ||
                            me.getY() > me.getGalaxy().getMaxY() - me.getSize() * k ||
                            dist < me.getSize() * k) {
                            //clearInterval(Timer);
                            me.setSpeed(Random(20) + 10);
                            me.setX(Random(me.getGalaxy().getMaxX()) - me.getSize() * 1);
                            //me.setX(0);
                            me.setY(Random(me.getGalaxy().getMaxY()) - me.getSize() * 1);
                        };
                    }
                );
                star.setTargetX(800);
                star.setTargetY(300);
                star.Start();
            }
        };        
    }

};
class GalaxyElement {
    constructor(speed, size, color, number, elementType, parent, orbit, alpha, galaxy, level, childClass, childCount, pathCalc, flyOut) {

        var me = this;
        var Galaxy = galaxy;

        var X = null;
        var Y = null;
        var targetX = null;
        var targetY = null;
        var maxX = Galaxy.getMaxX();
        var maxY = Galaxy.getMaxY();
        var PathCalc = pathCalc;
        var FlyOut = flyOut;
        var Size = size;
        var Color = color;
        var Speed = speed;
        var Number = number;
        var Level = level;
        var lastTime = new Date();
        var Timer = null;
        var isShown = true;
        var Model = document.createElement('div');
        var isSelected = false;
        var Selection = null;

        Model.id = elementType + '-' + number + '-' + Galaxy.getElements().length;
        Model.setAttribute('index', Galaxy.getElements().length);
        Galaxy.addGalaxyElement(me);
        Model.classList.add('galaxy-element');
        Model.classList.add(elementType);
        Galaxy.getGalaxyWrapper().appendChild(Model);

        var Parent;
        var myOrbit = orbit;
        var Alpha = alpha;
        var Orbits = [];
        var Childs = [];
        var ChildCount = childCount;

        me.getGalaxy = function () {
            return Galaxy;
        };
        me.getX = function () {
            return X;
        };
        me.getY = function () {
            return Y;
        };
        me.getTargetX = function () { return targetX };
        me.getTargetY = function () { return targetY };
        me.getSize = function () {
            return Size;
        };
        me.getColor = function () { return Color };
        me.getSpeed = function () {
            return Speed;
        };
        me.getNumber = function () {
            return Number;
        };
        me.getModel = function () {
            return Model;
        };
        me.getTimer = function () {
            return Timer;
        };
        me.getLastTime = function () { return lastTime; };
        me.getIsShown = function () { return isShown; };
        me.getOrbits = function () { return Orbits; };
        me.getChilds = function () { return Childs; };
        me.getOrbit = function () { return myOrbit; };
        me.getOrbitHeight = function () { return me.getParent().getOrbits()[myOrbit].getHeight(); };
        me.getAlpha = function () { return Alpha; };
        me.getParent = function () { return Parent; };
        me.getLevel = function() { return Level }

        for (var i = 0; i < 10; i++) {
            Orbits[i] = new Orbit(me.getSize() + i * me.getSize()/2);
        };

        me.setX = function (x) {
            X = x;
            //if (X > maxX - Size * 2) {
            //    X = X - Size * 2;
            //};
            Model.style.left = X + 'px';
            if (isSelected) {
                Selection.setPosition();
            }
        };
        me.setY = function (y) {
            Y = y;
            //if (Y > maxY - Size * 2) {
            //    Y = Y - Size * 2;
            //};
            Model.style.top = Y + 'px';
            if (isSelected) {
                Selection.setPosition();
            }
        };
        me.setTargetX = function (x) { targetX = x };
        me.setTargetY = function (y) { targetY = y };
        me.setSize = function (size) {
            Size = size;
            /*
            Model.innerHTML = '.';
            Model.style.fontSize = size + 'px';
            Model.style.color = 'rgba(0,0,0,'+size/100+')';
            */
            Model.style.backgroundColor = 'rgba(0,0,0,' + Color + ')';
            Model.style.width = Size + 'px';
            Model.style.height = Size + 'px';
            Model.style.borderRadius = Size + 'px';
            if (isSelected) {
                Selection.setPosition();
            }
        };
        me.setColor = function (color) { Color = color; };
        me.setSpeed = function (speed) {
            Speed = speed;
            //me.setSize(Math.floor(1 / speed * 600) + 10);
        };
        me.setLastTime = function () { lastTime = new Date(); };
        me.setChilds = function (childs) { Childs = childs; };
        //me.setOrbit = function (orbit) { Orbit = orbit; };
        me.setAlpha = function (alpha) { Alpha = alpha };
        me.setParent = function (parent, orbit) {
            try {
                Parent = parent;
                if (Parent) {
                    Parent.addChild(me, orbit);
                }
            }
            catch (e) { console.log(e) };
        }

        me.setSize(size);
        me.setSpeed(speed);
        me.setParent(parent, orbit);

        //me.bring2Begin = bring2begin;

        me.Start = function () {
            for (var i = 0; i < Childs.length; i++) {
                Childs[i].Start();
            }
            if (!Timer) {
                lastTime = new Date();
                Timer = setInterval(
                    function () {
                        PathCalc(me);
                        maxX = Galaxy.getMaxX();
                        maxY = Galaxy.getMaxY();
                        FlyOut(me);
                    },
                    50
                );
            };
        };
        me.Stop = function () {
            for (var i = 0; i < Childs.length; i++) {
                Childs[i].Stop();
            }
            clearInterval(Timer);
            Timer = null;
        };
        me.Clear = function () {
            for (var i = 0; i < Childs.length; i++) {
                Childs[i].Clear();
            }
            if (isSelected) {
                Selection.clear();
            }
            Model.remove();
        };

        me.Toggle = function () {
            Model.classList.toggle('hidden');
            isShown = !isShown;
        };
        me.Hide = function () {
            Model.classList.add('hidden');
            isShown = false;
        };
        me.Show = function () {
            Model.classList.remove('hidden');
            isShown = true;
        };

        me.Select = function () {
            if (!isSelected) {
                Selection = new GalaxyElementSelection(me, Galaxy);
                isSelected = true;
            }
        };
        me.unSelect = function () {
            if (isSelected) {
                Selection.clear();
                isSelected = false;
            }
        };
        me.isSelected = function () { return isSelected }

        me.addChild = function (child, orbit) {
            Childs[Childs.length] = child;
            Orbits[orbit].setGalaxyElement(child);
        };
        me.removeChild = function (child) {
            if (Planets) {
                for (var i = 0; i < Planets.length; i++) {
                    if (Planets[i] === planet) {
                        Planets[i] = Planets[Planets.length - 2];
                        Planets.length--;
                    }
                }
            };
        };

        for (var index = 0; index < ChildCount; index++) {
            var childOrbit = Random(Orbits.length - 1);
            var io = 0;
            try {
                //console.log(Orbits[childOrbit].getIsEmpty());
                while ((!Orbits[childOrbit].getIsEmpty()) && io < Orbits.length * 2) {
                    childOrbit = Random(8);
                    io++;
                }
            } catch (e) { console.log(e) }
            
            var childAlpha = Random(Math.PI * 2 * 1000) / 1000;
            var childSpeed = (Random(1) < 1 ? -1 : 1) * 
                (me.getLevel() === 1 ? me.getSpeed() / 40 : me.getSpeed() * 5);
            var childSize = me.getSize() / 4 - Random(me.getSize() / 4) + 1;
            var childColor = Color * 2;
            Childs[index] = new childClass(
                childOrbit,
                childAlpha,
                childSpeed,
                childSize,
                childColor,
                index,
                me.getGalaxy(),
                me,
                Level + 1,
                childClass,
                0,
                //pathCalc
                function (me) {
                    var delta = new Date() - me.getLastTime();
                    me.setLastTime();
                    me.setAlpha(me.getAlpha() + delta * me.getSpeed() / 1000);
                    me.setX(me.getParent().getX() + me.getParent().getSize() / 2 + me.getOrbitHeight() * Math.cos(me.getAlpha()) - me.getSize() / 2);
                    me.setY(me.getParent().getY() + me.getParent().getSize() / 2 + me.getOrbitHeight() * Math.sin(me.getAlpha()) - me.getSize() / 2);
                },
                //flyOut
                function (me) {
                    var k = 1.05;
                    if (me.getX() > me.getGalaxy().getMaxX() - me.getSize() * k ||
                        me.getY() > me.getGalaxy().getMaxY() - me.getSize() * k ||
                        (me.getTargetX() && me.getX() > targetX - me.getSize() * k) ||
                        (me.getTargetY() && me.getY() > targetY - me.getSize() * k)) {
                        //clearInterval(Timer);
                        me.Hide();
                        //me.setSpeed(((Random(2) < 1 ? -1 : 1) * (Random(3) + 5)) / 4);
                        me.setSpeed(me.getSpeed() * (-1));
                    }
                    else {
                        me.Show();
                    }
                }
            );
            Childs[index].Start();
        }//endFor Childs

    };
};
class Star extends GalaxyElement {
    constructor(x, y, speed, size, color, number, galaxy, level, childClass, childCount, pathCalc, flyOut) {
        super(speed, size, color, number, 'star', null, 0, 0, galaxy, level, childClass, childCount, pathCalc, flyOut);
        var me = this;
        me.setX(x);
        me.setY(y);
    }
}
class Planet extends GalaxyElement {
    constructor(orbit, alpha, speed, size, color, number, galaxy, parent, level, childClass, childCount, pathCalc, flyOut) {
        var myChildCount = 0;
        if (parent instanceof Star) {
            myChildCount = Random(1);
        }
        super(speed, size, color, number, 'planet', parent, orbit, alpha, galaxy, level, childClass, myChildCount, pathCalc, flyOut);
    }
}
class Orbit {
    constructor(height) {
        var me = this;
        var Height = height;
        var galaxyElement = null;
        var isEmpty = true;

        me.getHeight = function () { return Height; }
        me.getGalaxyElement = function () { return galaxyElement; }
        me.getIsEmpty = function () { return isEmpty }

        me.setHeight = function (height) { Height = height; }
        me.setGalaxyElement = function (galaxyElement) {
            GalaxyElement = galaxyElement;
            isEmpty = false;
        }

        me.removeGalaxyElement = function () {
            galaxyElement = null;
            isEmpty = true;
        }
    }
}
class GalaxyElementInfo {
    constructor(galaxyWrapper, myGalaxyElement) {
        var me = this;
        var Wrapper = document.createElement('div');
        var Title = document.createElement('div');
        var Info = document.createElement('ul');
        var Parent = document.createElement('li');
        var Size = document.createElement('li');
        var Speed = document.createElement('li');
        var X = document.createElement('li');
        var Y = document.createElement('li');
        var galaxyElement = myGalaxyElement;

        Wrapper.className = 'galaxy-element-info';
        Title.className = 'galaxy-element-info-title';
        Info.className = 'galaxy-element-info-info';
        Parent.className = 'galaxy-element-info-info';
        Size.className = 'galaxy-element-info-info';
        Speed.className = 'galaxy-element-info-info';
        X.className = 'galaxy-element-info-info';
        Y.className = 'galaxy-element-info-info';

        Wrapper.appendChild(Title);
        Wrapper.appendChild(Info);
        Info.appendChild(Parent);
        Info.appendChild(Size);
        Info.appendChild(Speed);
        Info.appendChild(X);
        Info.appendChild(Y);
        galaxyWrapper.appendChild(Wrapper);
        
        me.setInfo = function (myGalaxyElement) {
            galaxyElement = myGalaxyElement;
            infoUpdate();
        }

        me.hide = function () { Wrapper.style.display = 'none' }
        me.show = function () { Wrapper.style.display = 'block' }
        
        me.Update = infoUpdate;
        
        function setInnerHTML(element, str) { element.innerHTML = str }
        function infoUpdate() {
            if (galaxyElement) {
                setInnerHTML(Title, 'Id = ' + galaxyElement.getModel().id);
                setInnerHTML(Parent, 'Parent = ' + (galaxyElement.getParent() ? galaxyElement.getParent().getModel().id : 'null'));
                setInnerHTML(Size, 'Size = ' + galaxyElement.getSize());
                setInnerHTML(Speed, 'Speed = ' + galaxyElement.getSpeed());
                setInnerHTML(X, 'X = ' + Math.round(galaxyElement.getX()));
                setInnerHTML(Y, 'Y = ' + Math.round(galaxyElement.getY()));
                me.show();
            }
            else {
                setInnerHTML(Title, '')
                setInnerHTML(Parent, '');
                setInnerHTML(Size, '');
                setInnerHTML(Speed, '');
                setInnerHTML(X, '');
                setInnerHTML(Y, '');
                me.hide();
            }
        }

    }
}
class GalaxyElementSelectionModel {
    constructor(galaxyElement, galaxy) {
        var me = this;

        var myGalaxyElement = galaxyElement;
        var X = null;
        var Y = null;
        var Size = null;
        var Padding = 3;

        var LeftTop = document.createElement('div');
        LeftTop.className = 'galaxy-element-selected';
        galaxy.getGalaxyWrapper().appendChild(LeftTop);
        var RightTop = document.createElement('div');
        RightTop.className = 'galaxy-element-selected';
        galaxy.getGalaxyWrapper().appendChild(RightTop);
        var LeftBottom = document.createElement('div');
        LeftBottom.className = 'galaxy-element-selected';
        galaxy.getGalaxyWrapper().appendChild(LeftBottom);
        var RightBottom = document.createElement('div');
        RightBottom.className = 'galaxy-element-selected';
        galaxy.getGalaxyWrapper().appendChild(RightBottom);

        me.getX = function () { return X }
        me.getY = function () { return Y }
        me.getSize = function () { return Size }
        me.getPadding = function () { return Padding }
        me.getGalaxyElement = function () { return myGalaxyElement }

        me.setPosition = setPosition;
        me.setPadding = function (padding) {
            Padding = padding;
            setPosition();
        }
        me.setGalaxyElement = function (galaxyElement) {
            myGalaxyElement = galaxyElement;
            setPosition();
        }

        me.clear = function () {
            LeftTop.remove();
            RightTop.remove();
            LeftBottom.remove();
            RightBottom.remove();
            me = null;
        }

        function setPosition() {
            X = myGalaxyElement.getX() - Padding - 1;
            Y = myGalaxyElement.getY() - Padding - 1;
            Size = myGalaxyElement.getSize() + 1;

            LeftTop.style.left = X + 'px';
            LeftTop.style.top = Y + 'px';
            LeftTop.style.width = Padding + 'px';
            LeftTop.style.height = Padding + 'px';
            //LeftTop.style.height = (Size + 2 * Padding) + 'px';
            LeftTop.style.borderLeft = LeftTop.style.borderTop = '1px solid #000';

            RightTop.style.left = X + Size + Padding + 'px';
            RightTop.style.top = Y + 'px';
            RightTop.style.width = Padding + 'px';
            RightTop.style.height = Padding + 'px';
            RightTop.style.borderRight = RightTop.style.borderTop = '1px solid #000';

            RightBottom.style.left = X + Size + Padding + 'px';
            RightBottom.style.top = Y + Size + Padding + 'px';
            RightBottom.style.width = Padding + 'px';
            RightBottom.style.height = Padding + 'px';
            RightBottom.style.borderRight = RightBottom.style.borderBottom = '1px solid #000';

            LeftBottom.style.left = X + 'px';
            LeftBottom.style.top = Y + Size + Padding + 'px';
            LeftBottom.style.width = Padding + 'px';
            LeftBottom.style.height = Padding + 'px';
            LeftBottom.style.borderLeft = LeftBottom.style.borderBottom = '1px solid #000';
        }
    }
}
class GalaxyElementSelection {
    constructor(galaxyElement, galaxy) {
        var me = this;
        var Model = new GalaxyElementSelectionModel(galaxyElement, galaxy);
        
        me.getModel = function () { return Model }
        me.getGalaxyElement = function () { return Model.constructor() }

        me.setPosition = function () {
            Model.setPosition();
        }
        me.setPadding = function (padding) {
            Model.setPadding(padding);
        }
        me.setGalaxyElement = function (galaxyElement) {
            Model.setGalaxyElement(galaxyElement);
        }

        me.clear = function () {
            if (Model) {
                Model.clear();
            }
            me = null;
        }

        me.setPosition();
    }
}

function Random(a) {
    return Math.round(Math.random() * a);
}

function getDocumentWidth(element) {
    function getViewportWidth() {
        var ua = navigator.userAgent.toLowerCase();
        var isOpera = (ua.indexOf('opera') > -1);
        var isIE = (!isOpera && ua.indexOf('msie') > -1);
        return ((document.compatMode || isIE) && !isOpera) ? (document.compatMode === 'CSS1Compat') ? document.documentElement.clientWidth : document.body.clientWidth : (document.parentWindow || document.defaultView).innerWidth;
    }
    return Math.max(document.compatMode !== 'CSS1Compat' ? document.body.scrollWidth : document.documentElement.scrollWidth, getViewportWidth());
    //return element.clientWidth;
}
function getDocumentHeight(element) {
    function getViewportHeight() {
        var ua = navigator.userAgent.toLowerCase();
        var isOpera = (ua.indexOf('opera') > -1);
        var isIE = (!isOpera && ua.indexOf('msie') > -1);
        return ((document.compatMode || isIE) && !isOpera) ? (document.compatMode === 'CSS1Compat') ? document.documentElement.clientHeight : document.body.clientHeight : (document.parentWindow || document.defaultView).innerHeight;
    }
    return Math.max(document.compatMode !== 'CSS1Compat' ? document.body.scrollHeight : document.documentElement.scrollHeight, getViewportHeight());
   // return element.clientHeight;
}