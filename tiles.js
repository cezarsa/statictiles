var files = [
    "img/amor1-4.png",
    "img/banana-3.png",
    "img/brilho-8.png",
    "img/brilho2-2.png",
    "img/brilho3-2.png",
    "img/buen-1.png",
    "img/cafe1-10.png",
    "img/cafe2-9.png",
    "img/cafe3-6.png",
    "img/cafe4-11.png",
    "img/cereja-5.png",
    "img/coqueiro-2.png",
    "img/create-10.png",
    "img/daluz-2.png",
    "img/disco1-8.png",
    "img/disco2-7.png",
    "img/disco3-7.png",
    "img/disco4-11.png",
    "img/enjoy-13.png",
    "img/fita1-2.png",
    "img/fita2-6.png",
    "img/fita3-5.png",
    "img/fita4-3.png",
    "img/foto-13.png",
    "img/gato1-9.png",
    "img/gato2-12.png",
    "img/gato3-13.png",
    "img/gato4-21.png",
    "img/grlpwr-7.png",
    "img/guter-1.png",
    "img/hello-2.png",
    "img/hipls-2.png",
    "img/homemusic-7.png",
    "img/loveyou-2.png",
    "img/melancia-3.png",
    "img/melhor-4.png",
    "img/panela1-5.png",
    "img/panela2-6.png",
    "img/panela3-8.png",
    "img/panela4-3.png",
    "img/panela5-4.png",
    "img/passaros-2.png",
    "img/prala-2.png",
    "img/rofl-2.png",
    "img/sonhe-6.png",
    "img/vitr1-7.png",
    "img/vitr2-7.png",
    "img/vitr3-6.png",
    "img/vitr4-10.png"
]

var scale = 3.5,
    width = 7.5,
    height = 15,
    margin = 0.3,

    scaledWidth = width * scale,
    scaledHeight = height * scale,
    scaledMargin = 1, //margin * scale,

    nWidth = 33,
    nHeight = 10,

    cutWidth = 8,
    cutHeight = 6,

    cutRightWidth = 2,
    cutRightHeight = 1;


function loadTiles() {
    var tiles = {};
    for (var f of files) {
        var match = f.match(/.*\/(.*)-(\d+)\.png/);
        if (match.length != 3) {
            throw ("error processing image names");
        }
        tiles[match[1]] = {
            name: match[1],
            filename: f,
            count: parseInt(match[2]),
            used: {},
        }
    }
    return tiles
}

function setStyle() {
    var style = document.createElement("style")
    style.innerText = `.tile{ 
        width: ${scaledWidth}px;
        height: ${scaledHeight}px;
        margin-right: ${scaledMargin}px;
        margin-bottom: ${scaledMargin}px;
    }`;
    document.querySelector("head").appendChild(style);
}

function doTileImage(file, tileName, i, rotated) {
    var query = `.palette-tile[data-tile-name='${tileName}'][data-tile-count-idx='${i}']`
    var el = document.querySelector(query);
    if (el) {
        if (rotated) {
            el.className = "tile palette-tile rotated";
        } else {
            el.className = "tile palette-tile";
        }
        return el
    }
    var imgDiv = document.createElement("div");
    imgDiv.className = "tile palette-tile";
    if (rotated) {
        imgDiv.className += " rotated";
    }
    imgDiv.setAttribute('data-tile-name', tileName);
    imgDiv.setAttribute('data-tile-count-idx', i);
    var img = document.createElement("img")
    img.src = file;
    img.className = "tile";
    imgDiv.appendChild(img);
    return imgDiv;
}

function doTileAreaMain(i, j) {
    var el = document.querySelector(`.tile-area[data-i='${i}'][data-j='${j}']`);
    if (el) {
        return el
    }
    var div = document.createElement("div");
    div.setAttribute('data-i', i);
    div.setAttribute('data-j', j);
    div.className = "tile tile-area tile-area-grid tile-" + i + "-" + j;
    if (!validPos(i, j)) {
        div.className += " tile-ignored";
    }
    return div
}

function doTileAreaPalette(tileName, i) {
    var el = document.querySelector(`.tile-area[data-tile-name='${tileName}'][data-tile-count-idx='${i}']`);
    if (el) {
        return el
    }
    var div = document.createElement("div");
    div.setAttribute('data-tile-name', tileName);
    div.setAttribute('data-tile-count-idx', i);
    div.className = "tile tile-area";
    return div
}

function drawTilesPalette(tiles) {
    var origPalette = document.querySelector("#palette");
    var palette = origPalette.cloneNode(false);
    for (var tileName in tiles) {
        var t = tiles[tileName];
        var div = document.createElement("div");
        div.className = "tile-row";
        for (var i = 0; i < t.count; i++) {
            var outerDiv = doTileAreaPalette(tileName, i);
            div.appendChild(outerDiv);
        }
        palette.appendChild(div, div);
    }
    origPalette.parentNode.replaceChild(palette, origPalette);
}

function drawPattern() {
    var origArea = document.querySelector("#main");
    var area = origArea.cloneNode(false);
    for (var i = 0; i < nHeight; i++) {
        var row = document.createElement("div");
        row.className = "tile-row";
        for (var j = 0; j < nWidth; j++) {
            var div = doTileAreaMain(i, j);
            row.appendChild(div);
        }
        area.appendChild(row);
    }
    origArea.parentNode.replaceChild(area, origArea);
}

function repositionTiles(tiles) {
    for (var tileName in tiles) {
        var t = tiles[tileName];
        for (var idx = 0; idx < t.count; idx++) {
            if (t.used[idx]) {
                var i = t.used[idx].i,
                    j = t.used[idx].j;
                var tileArea = doTileAreaMain(i, j);
                if (tileArea) {
                    tileArea.appendChild(doTileImage(t.filename, tileName, idx, t.used[idx].rotated));
                }
            } else {
                var tileArea = doTileAreaPalette(tileName, idx);
                tileArea.appendChild(doTileImage(t.filename, tileName, idx));
            }
        }
    }
}

function validPos(i, j) {
    if ((i < cutHeight && j < cutWidth) || (i < cutRightHeight && (nWidth - j) <= cutRightWidth)) {
        return false;
    }
    return true
}

function clearTiles() {
    for (var tileName in gTiles) {
        var t = gTiles[tileName];
        for (var idx = 0; idx < t.count; idx++) {
            delete gTiles[tileName].used[idx];
        }
    }
    repositionTiles(gTiles);
}


function randomTiles() {
    clearTiles();
    for (var i = 0; i < nHeight; i++) {
        for (var j = 0; j < nWidth; j++) {
            if (!validPos(i, j)) {
                continue;
            }
            while (true) {
                var tileNames = Object.keys(gTiles);
                var name = tileNames[parseInt(Math.random() * tileNames.length)];
                var tile = gTiles[name];
                if (Object.keys(tile.used).length == tile.count) {
                    continue
                }
                for (var idx = 0; idx < tile.count; idx++) {
                    if (tile.used[idx]) {
                        continue
                    }
                    gTiles[name].used[idx] = { i: i, j: j };
                    break
                }
                break
            }
        }
    }
    repositionTiles(gTiles);
}

var gTiles;

function startDragdrop(tiles) {
    gTiles = tiles;
    new dragdrop.start({
        element: '.palette-tile',
        targets: '.tile-area'
    }, (dom, api) => {
        dom.addEventListener('click', (event) => {
            if (!event.shiftKey) {
                return;
            }
            var target = event.target.closest('.tile-area-grid');
            if (!target) {
                return
            }
            var tile = target.querySelector('.palette-tile');
            if (!tile) {
                return
            }
            var tileName = tile.dataset.tileName;
            var tileCountIdx = parseInt(tile.dataset.tileCountIdx);
            if (!tiles[tileName].used[tileCountIdx]) {
                tiles[tileName].used[tileCountIdx] = {};
            }
            tiles[tileName].used[tileCountIdx].rotated = !tiles[tileName].used[tileCountIdx].rotated;
            repositionTiles(tiles);
            saveTilesStorage(tiles);
        })
        dom.addEventListener('drop', (event) => {
            var target = event.target.closest('.tile-area');
            if (target.closest('.tile-ignored')) {
                repositionTiles(tiles);
                return;
            }
            var id = event.dataTransfer.getData('text');
            var pTile = document.getElementById(id);
            var parentId = event.dataTransfer.getData('parent');
            var elParent = document.getElementById(parentId);
            var tileName = pTile.dataset.tileName;
            var tileCountIdx = parseInt(pTile.dataset.tileCountIdx);
            if (target == elParent) {
                // swap
                var oldTile = event.target.closest('.palette-tile');
                var oldTileName = oldTile.dataset.tileName;
                var oldTileCountIdx = parseInt(oldTile.dataset.tileCountIdx);
                var usedEntry = tiles[oldTileName].used[oldTileCountIdx];
                tiles[oldTileName].used[oldTileCountIdx] = tiles[tileName].used[tileCountIdx]
                tiles[tileName].used[tileCountIdx] = usedEntry;
            } else if (target.closest('#palette')) {
                delete tiles[tileName].used[tileCountIdx];
            } else {
                var i = parseInt(target.dataset.i),
                    j = parseInt(target.dataset.j);
                if (!tiles[tileName].used[tileCountIdx]) {
                    tiles[tileName].used[tileCountIdx] = {};
                }
                tiles[tileName].used[tileCountIdx].i = i
                tiles[tileName].used[tileCountIdx].j = j
            }
            repositionTiles(tiles);
            saveTilesStorage(tiles);
        })
    });
}

function saveTilesStorage(tiles) {
    var tilesStr = JSON.stringify(tiles);
    localStorage.setItem("tiles", tilesStr);
    var output = encodeURIComponent(base64js.fromByteArray(pako.deflate(JSON.stringify(gTiles))));
    history.pushState({}, null, "?tiles=" + output);
}

function loadTilesStorage(tilesToMerge, cb) {
    tilesFromURL((storageTiles) => {
        if (!storageTiles) {
            storageTiles = JSON.parse(localStorage.getItem("tiles"));
        }
        if (storageTiles) {
            for (var k in storageTiles) {
                var oldTile = tilesToMerge[k];
                tilesToMerge[k] = storageTiles[k];
                if (oldTile) {
                    tilesToMerge[k].filename = oldTile.filename;
                    tilesToMerge[k].count = oldTile.count;
                }
            }
        }
        cb();
    });
}

function tilesFromURL(cb) {
    var urlParams = new URLSearchParams(window.location.search);
    var tilesStr = urlParams.get('tiles');
    if (tilesStr) {
        try {
            cb(JSON.parse(atob(tilesStr)));
        } catch (e) {
            var raw = Base64.decode(decodeURIComponent(tilesStr));
            LZWAsync.decompress({
                input: raw,
                output: function (output) {
                    try {
                        cb(JSON.parse(output));
                    } catch (e) {
                        var compressed = base64js.toByteArray(decodeURIComponent(tilesStr));
                        var result = pako.inflate(compressed);
                        var decoder = new TextDecoder('utf-8');
                        var raw = decoder.decode(result);
                        cb(JSON.parse(raw));
                    }
                }
            });
        }
        return;
    }
    cb(null);
}

window.onpopstate = () => {
    loadTilesStorage(gTiles, () => {
        repositionTiles(gTiles);
    });
}

window.addEventListener('load', function () {
    setStyle();
    var tiles = loadTiles();
    loadTilesStorage(tiles, () => {
        drawTilesPalette(tiles);
        drawPattern();
        repositionTiles(tiles);
        startDragdrop(tiles);
    });
});

