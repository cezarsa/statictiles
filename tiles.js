var files = [
    "img/amor1-4.png",
    "img/banana-3.png",
    "img/brilho-8.png",
    "img/buen-1.png",
    "img/cafe1-10.png",
    "img/cafe2-9.png",
    "img/cafe3-6.png",
    "img/cafe4-11.png",
    "img/cereja-5.png",
    "img/coqueiro-2.png",
    "img/create-9.png",
    "img/daluz-2.png",
    "img/disco1-8.png",
    "img/disco2-7.png",
    "img/disco3-7.png",
    "img/disco4-11.png",
    "img/enjoy-12.png",
    "img/fita1-2.png",
    "img/fita2-6.png",
    "img/fita3-5.png",
    "img/fita4-3.png",
    "img/foto-12.png",
    "img/gato1-9.png",
    "img/gato2-12.png",
    "img/gato3-13.png",
    "img/gato4-21.png",
    "img/grlpwr-5.png",
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
    "img/vitr1-6.png",
    "img/vitr2-6.png",
    "img/vitr3-5.png",
    "img/vitr4-9.png"
]

var scale = 3.35,
    width = 7.5,
    height = 15,
    margin = 0.3,

    scaledWidth = width * scale,
    scaledHeight = height * scale,
    scaledMargin = margin * scale,

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

function doTileImage(file, tileName, i) {
    var query = `.palette-tile[data-tile-name='${tileName}'][data-tile-count-idx='${i}']`
    var el = document.querySelector(query);
    if (el) {
        return el
    }
    var imgDiv = document.createElement("div");
    imgDiv.className = "tile palette-tile";
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
    div.className = "tile tile-area tile-" + i + "-" + j;
    if (i < cutHeight && j < cutWidth) {
        div.className += " tile-ignored";
    }
    if (i < cutRightHeight && (nWidth - j) <= cutRightWidth) {
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

function repositionTiles(tiles, save) {
    for (var tileName in tiles) {
        var t = tiles[tileName];
        for (var idx = 0; idx < t.count; idx++) {
            if (t.used[idx]) {
                var i = t.used[idx].i,
                    j = t.used[idx].j;
                var tileArea = doTileAreaMain(i, j);
                if (tileArea) {
                    tileArea.appendChild(doTileImage(t.filename, tileName, idx));
                }
            } else {
                var tileArea = doTileAreaPalette(tileName, idx);
                tileArea.appendChild(doTileImage(t.filename, tileName, idx));
            }
        }
    }
}

var gTiles;

function startDragdrop(tiles) {
    gTiles = tiles;
    new dragdrop.start({
        element: '.palette-tile',
        targets: '.tile-area'
    }, (dom, api) => {
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
                tiles[tileName].used[tileCountIdx] = { i: i, j: j };
            }
            repositionTiles(tiles);
            saveTilesStorage(tiles);
        })
    });
}

function saveTilesStorage(tiles) {
    var tilesStr = JSON.stringify(tiles);
    localStorage.setItem("tiles", tilesStr);
    history.pushState({}, null, "?tiles=" + btoa(tilesStr));
}

function loadTilesStorage(tilesToMerge) {
    var storageTiles = tilesFromURL();
    if (!storageTiles) {
        storageTiles = JSON.parse(localStorage.getItem("tiles"));
    }
    if (storageTiles) {
        for (var k in storageTiles) {
            tilesToMerge[k] = storageTiles[k];
        }
    }
    return tilesToMerge;
}

function tilesFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    var tilesStr = urlParams.get('tiles');
    if (tilesStr) {
        return JSON.parse(atob(tilesStr));
    }
    return null;
}

window.onpopstate = () => {
    loadTilesStorage(gTiles);
    repositionTiles(gTiles);
}

window.addEventListener('load', function () {
    setStyle();
    var tiles = loadTiles();
    tiles = loadTilesStorage(tiles);
    drawTilesPalette(tiles);
    drawPattern();
    repositionTiles(tiles);
    startDragdrop(tiles);
});

