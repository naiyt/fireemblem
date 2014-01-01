var Q = window.Q = Quintus({ development: true })
    .include('Sprites, Scenes, Input, 2D, Anim')
    .setup({maximize: true})
    .controls(true);

Q.input.keyboardControls();
Q.input.joypadControls();
Q.tileSize = 25;
Q.SPRITE_TILES = 2;
Q.PLAYER_UNIT = 3;


Q.load('Village1.png, cursor.png, level.json, sprites.png, sprites.json, cursor.json', function(stage) {
    Q.sheet('tiles', 'Village1.png', {tileW: Q.tileSize, tileH: Q.tileSize });
    Q.sheet('cursor', 'cursor.png', {tileW: Q.tileSize , tileH: Q.tileSize});

    Q.sheet('units', 'sprites.png', {tileW: 20 , tileH: 20});

    Q.compileSheets('cursor.png', 'cursor.json');
    Q.compileSheets('sprites.png', 'sprites.json');
    Q.stageScene('level1');
});

Q.scene('level1', function(stage) {
    var map = stage.collisionLayer(new Q.femap());
    map.setup();

    cursor = new Q.cursor(Q.tilePos(4,4));
    stage.insert(cursor);
    unit = new Q.unit(Q.tilePos(4,4));
    stage.insert(unit);

    Q.mapInfo = new Array(Q.mapWidth);
    for(var i = 0; i < Q.mapInfo.length; i++) {
        Q.mapInfo[i] = new Array(Q.mapHeight);
    }

    Q.mapInfo[unit.p.tileX][unit.p.tileY] = unit;
    console.log(Q.mapInfo);

});

Q.TileLayer.extend('femap', {
    init: function() {
        this._super( {
            type: Q.SPRITE_TILES,
            dataAsset: 'level.json',
            sheet: 'tiles',
            tileW: Q.tileSize,
            tileH: Q.tileSize
        });
    },
    setup: function() {
        Q.mapWidth = this.p.cols;
        Q.mapHeight = this.p.rows;
    }
});

Q.Sprite.extend('cursor', {
    init: function(p) {
        var tileLoc = Q.rowAndCol(p.x, p.y);
        this._super(p, {
            sprite: 'cursor',
            sheet: 'cursor',
            tileX: tileLoc.x,
            tileY: tileLoc.y,
            betweenMoves: 0.08,
            time: 0,
            movingUnit: false
        });
    },

    step: function(dt) {
        this.moveCursor(dt);
    },

    moveCursor: function(dt) {
        this.p.time += dt;
        if(this.p.time > this.p.betweenMoves) {
            if(Q.inputs['left'] && this.p.tileX > 0) {
                this.p.tileX--;
            }
            if(Q.inputs['right'] && this.p.tileX < Q.mapWidth-1) {
                this.p.tileX++;
            }
            if(Q.inputs['up'] && this.p.tileY > 0) {
                this.p.tileY--;
            }
            if(Q.inputs['down'] && this.p.tileY < Q.mapHeight-1) {
                this.p.tileY++;
            }

            if(Q.inputs['fire']) {
                var curr_tile = Q.mapInfo[this.p.tileX][this.p.tileY];
                if(this.p.highlighted) {
                    this.p.highlighted.move(this.p.tileX, this.p.tileY);
                    this.p.highlighted = undefined;
                }
                if(curr_tile) {
                    if(curr_tile.p.unit == Q.PLAYER_UNIT) {
                        if(!this.p.highlighted) this.p.highlighted = unit;
                    }
                }
            }

            var new_loc = Q.tilePos(this.p.tileX, this.p.tileY);
            this.p.x = new_loc.x;
            this.p.y = new_loc.y;
            this.p.time = 0;
        }

    }
});

Q.Sprite.extend('unit', {
    init: function(p) {
        var tileLoc = Q.rowAndCol(p.x, p.y);
        this._super(p, {
            sprite: 'unit',
            sheet: 'units',
            tileX: tileLoc.x,
            tileY: tileLoc.y,
            unit: Q.PLAYER_UNIT
        });
    },

    step: function(dt) {

    },

    move: function(x, y) {
        Q.mapInfo[this.p.tileX][this.p.tileY] = undefined;
        var newLoc = Q.tilePos(x, y);
        this.p.tileX = x;
        this.p.tileY = y;
        this.p.x = newLoc.x;
        this.p.y = newLoc.y;
        Q.mapInfo[this.p.tileX][this.p.tileY] = this;
    }
});

Q.tilePos = function(row, col) {
    return {
        x: row*Q.tileSize + Q.tileSize/2,
        y: col*Q.tileSize + Q.tileSize/2
    };
};

Q.rowAndCol = function(x, y) {
    return {
        x: Math.round((x - Q.tileSize/2)/Q.tileSize),
        y: Math.round((y - Q.tileSize/2)/Q.tileSize)
    };
};
