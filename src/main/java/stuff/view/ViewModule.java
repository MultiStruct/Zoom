package stuff.view;

import com.codingame.gameengine.core.AbstractPlayer;
import com.codingame.gameengine.core.GameManager;
import com.codingame.gameengine.core.Module;
import com.codingame.gameengine.module.entities.GraphicEntityModule;
import com.google.inject.Inject;


public class ViewModule implements Module {

    GameManager<AbstractPlayer> gameManager;
    @Inject
    GraphicEntityModule entityModule;

    @Inject
    ViewModule(GameManager<AbstractPlayer> gameManager) {
        this.gameManager = gameManager;
        gameManager.registerModule(this);
    }

    @Override
    public void onGameInit() {
        gameManager.setViewGlobalData("ViewModule", entityModule.getWorld());
        sendFrameData();
    }

    @Override
    public void onAfterGameTurn() {
        sendFrameData();
    }

    @Override
    public void onAfterOnEnd() {
    }

    public void sendFrameData() {
        gameManager.setViewData("ViewModule");
    }
}
