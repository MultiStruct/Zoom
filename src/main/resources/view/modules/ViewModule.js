import { api as entityModule } from '../entity-module/GraphicEntityModule.js'
import { WIDTH, HEIGHT } from '../core/constants.js'
import * as utils from '../core/utils.js';

let inside = false;
let SecondaryContainer;
let gameBoxInfo;

// Got zoom and drag functions from here http://embed.plnkr.co/II6lgj511fsQ7l0QCoRi/
function zoom(s,x,y){
    s = s < 0 ? 2 : 0.5;
    let worldPos = {x: ((x - SecondaryContainer.x) / SecondaryContainer.scale.x), y: ((y - SecondaryContainer.y)/SecondaryContainer.scale.y)};
    let newScale = {x: SecondaryContainer.scale.x * s, y: SecondaryContainer.scale.y * s};
    let newScreenPos = {x: ((worldPos.x) * newScale.x + SecondaryContainer.x), y: ((worldPos.y) * newScale.y + SecondaryContainer.y)};

    SecondaryContainer.x -= (newScreenPos.x-x) ;
    SecondaryContainer.y -= (newScreenPos.y-y) ;
    SecondaryContainer.scale.x = newScale.x;
    SecondaryContainer.scale.y = newScale.y;
}

document.body.addEventListener("wheel", event => {
    if(inside) {
        zoom(event.deltaY, event.offsetX * WIDTH / gameBoxInfo[0].clientWidth, event.offsetY * HEIGHT / gameBoxInfo[0].clientHeight);
    }
    event.preventDefault();
}, {passive: false});

export class ViewModule {
    constructor(assets) {
        this.globalData = {};
        this.assets = assets;
        this.lastPos = null;
        this.mainContainer = null;
        this.mouseDown = false;
    }

    static get name() {
        return 'ViewModule';
    }

    loadMouseFunctions() {
        this.mainContainer.on('mouseover', (ev) => {
            inside = true;
            this.lastPos = {x:ev.data.originalEvent.offsetX,y:ev.data.originalEvent.offsetY};
        }).on('mouseout', () => {
            inside = false;
            this.mouseDown = false;
        }).on('mousedown', (ev) => {
            this.lastPos = {x:ev.data.originalEvent.offsetX,y:ev.data.originalEvent.offsetY};
            this.mouseDown = true;
        }).on('mouseup', () => {
            this.mouseDown = false;
        }).on('mousemove', (ev) => {
            if(this.lastPos && this.mouseDown) {
            SecondaryContainer.x += (ev.data.originalEvent.offsetX-this.lastPos.x) * WIDTH / gameBoxInfo[0].clientWidth;
            SecondaryContainer.y += (ev.data.originalEvent.offsetY-this.lastPos.y) * HEIGHT / gameBoxInfo[0].clientHeight;
            this.lastPos = {x:ev.data.originalEvent.offsetX,y:ev.data.originalEvent.offsetY};
            inside = true;
        }});
    }

    reload() {
        SecondaryContainer = new PIXI.Container();
        this.mainContainer.addChild(SecondaryContainer);
        this.sprite = new PIXI.Sprite.from(this.assets.images["logo.png"]);

        SecondaryContainer.addChild(this.sprite);
    }
    /**
     * Called when global data is received. Should only be called on init.
     * @param players information about players, such as avatar, name, color..
     * @param globalData data that has been sent from the Java module.
     * */
    handleGlobalData(players, globalData) {
        this.globalData.players = players;
        const width = globalData.width;
        const height = globalData.height;
        this.globalData.coeff = utils.fitAspectRatio(width, height, WIDTH, HEIGHT);

    }

    /**
     * Called when data is received.
     * Handles data for the given frame. Returns data that will be sent as parameter to updateScene.
     * @param frameInfo information about the current frame.
     * @param frameData data that has been sent from the Java module.
     */
    handleFrameData(frameInfo, frameData) {
        return { data: frameData };
    }

    /**
     * Called when the scene needs an update.
     * @param previousData data from the previous frame.
     * @param currentData data of the current frame.
     * @param progress progress of the frame. 0 <= progress <= 1
     * @param speed the speed of the viewer, setted up by the user.
     */
    updateScene(previousData, currentData, progress, speed) {
    }

    /**
     * Called when the viewer needs to be rerendered (init phase, resized viewer).
     * @param container a PIXI Container. Add your elements to this object.
     * @param canvasData canvas data containing width and height.
     */
    reinitScene(container, canvasData) {
        this.mainContainer = container;
        this.mainContainer.interactive = true;
        gameBoxInfo = document.getElementsByClassName("gameBoxContainer");

        // So entire viewer is interactive, because I can't interact directly with the container, puts a black rectangle that wont move.
        this.mainContainer.addChild(new PIXI.Graphics().beginFill(0x000000).drawRect(0,0,1920,1080).endFill());

        this.reload();
        this.loadMouseFunctions();
    }

    /**
     * Called every delta milliseconds.
     * @param delta time between current and last call. Aproximately 16ms by default.
     */
    animateScene (delta) {}

}
