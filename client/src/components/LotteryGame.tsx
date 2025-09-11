import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MahjongTile from "./MahjongTile";
import DrawResult from "./DrawResult";

interface GameState {
  phase: "waiting" | "shuffling" | "selecting" | "revealing" | "finished";
  selectedTile: number | null;
  gameResult: {
    isWinner: boolean;
    prizeCode?: string;
    prize: string;
  } | null;
  hasPlayed: boolean;
}

const LotteryGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: "waiting",
    selectedTile: null,
    gameResult: null,
    hasPlayed: localStorage.getItem("mahjong_lottery_played") === "true", //todo: remove mock functionality
  });

  const [tilesState, setTilesState] = useState([
    { id: 0, isFlipped: false, isWinner: false },
    { id: 1, isFlipped: false, isWinner: false },
    { id: 2, isFlipped: false, isWinner: false },
  ]);

  const startGame = () => {
    if (gameState.hasPlayed) return;
    
    setGameState(prev => ({ ...prev, phase: "shuffling" }));
    
    // 洗牌动画
    setTimeout(() => {
      setGameState(prev => ({ ...prev, phase: "selecting" }));
    }, 1500);
  };

  const selectTile = async (tileId: number) => {
    if (gameState.phase !== "selecting") return;

    setGameState(prev => ({ 
      ...prev, 
      phase: "revealing",
      selectedTile: tileId 
    }));

    // 模拟API调用 //todo: remove mock functionality
    const mockResult = {
      win: Math.random() < 0.1, // 10%概率中奖
      prize: Math.random() < 0.1 ? "红中" : "白板",
      code: Math.random() < 0.1 ? `DM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 4).toUpperCase()}` : undefined
    };

    // 设置获奖牌的状态
    const newTilesState = tilesState.map((tile, index) => ({
      ...tile,
      isFlipped: index === tileId,
      isWinner: index === tileId && mockResult.win
    }));

    setTilesState(newTilesState);

    // 翻牌动画完成后显示结果
    setTimeout(() => {
      setGameState(prev => ({ 
        ...prev, 
        phase: "finished",
        gameResult: {
          isWinner: mockResult.win,
          prizeCode: mockResult.code,
          prize: mockResult.prize
        }
      }));

      // 标记已玩过
      localStorage.setItem("mahjong_lottery_played", "true"); //todo: remove mock functionality
    }, 600);
  };

  const closeResult = () => {
    setGameState(prev => ({ 
      ...prev, 
      gameResult: null,
      hasPlayed: true
    }));
  };

  const resetGame = () => { //todo: remove mock functionality
    localStorage.removeItem("mahjong_lottery_played");
    setGameState({
      phase: "waiting",
      selectedTile: null,
      gameResult: null,
      hasPlayed: false,
    });
    setTilesState([
      { id: 0, isFlipped: false, isWinner: false },
      { id: 1, isFlipped: false, isWinner: false },
      { id: 2, isFlipped: false, isWinner: false },
    ]);
  };

  if (gameState.hasPlayed && gameState.phase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">感谢参与</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              每人仅可参与一次抽奖活动
            </p>
            <p className="text-sm text-muted-foreground">
              如需再次体验，请联系管理员
            </p>
            {/* 开发模式重置按钮 */}
            <Button 
              onClick={resetGame} 
              variant="outline" 
              size="sm"
              className="mt-4"
              data-testid="button-reset-game"
            >
              重置游戏 (开发模式)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl text-primary mb-2">
              麻将抽奖
            </CardTitle>
            <p className="text-muted-foreground">
              点击开始，然后选择一张牌翻开
            </p>
            <p className="text-sm text-muted-foreground">
              抽到红中即可获得精美托特包一个
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* 麻将牌区域 */}
            <div className="flex justify-center gap-4">
              {tilesState.map((tile) => (
                <MahjongTile
                  key={tile.id}
                  id={tile.id}
                  isFlipped={tile.isFlipped}
                  isWinner={tile.isWinner}
                  onClick={() => selectTile(tile.id)}
                  disabled={gameState.phase !== "selecting"}
                  isShuffling={gameState.phase === "shuffling"}
                />
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="space-y-4">
              {gameState.phase === "waiting" && (
                <Button 
                  onClick={startGame}
                  size="lg"
                  className="w-full h-12 text-lg"
                  data-testid="button-start-game"
                >
                  开始抽奖
                </Button>
              )}

              {gameState.phase === "shuffling" && (
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">洗牌中...</p>
                </div>
              )}

              {gameState.phase === "selecting" && (
                <div className="text-center">
                  <p className="text-lg text-primary font-medium">
                    请选择一张牌
                  </p>
                </div>
              )}

              {gameState.phase === "revealing" && (
                <div className="text-center">
                  <p className="text-lg text-muted-foreground">翻牌中...</p>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <p>每人仅可参与一次</p>
            </div>
          </CardContent>
        </Card>

        {/* 结果弹窗 */}
        {gameState.gameResult && (
          <DrawResult
            isWinner={gameState.gameResult.isWinner}
            prizeCode={gameState.gameResult.prizeCode}
            onClose={closeResult}
          />
        )}
      </div>
    </div>
  );
};

export default LotteryGame;