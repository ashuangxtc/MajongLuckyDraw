import { useState, useEffect, useRef } from "react";

interface MahjongTileProps {
  id: number;
  isFlipped: boolean;
  isWinner?: boolean;
  onClick: () => void;
  disabled: boolean;
  phase?: "initial" | "flying-in" | "showing-front" | "flipping-back" | "shuffling" | "ready" | "revealing" | "revealed";
  frontImage?: string;
  backImage?: string;
  animationDelay?: number;
}

const MahjongTile = ({
  id,
  isFlipped,
  isWinner,
  onClick,
  disabled,
  phase = "ready",
  frontImage,
  backImage,
  animationDelay = 0,
}: MahjongTileProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState(phase);
  
  // 默认图片
  const defaultBackImage = "/attached_assets/generated_images/麻将牌背面图案_324a01cc.png";
  const defaultWinnerImage = "/attached_assets/generated_images/红中麻将牌正面_8a7f2e08.png";
  const defaultLoserImage = "/attached_assets/generated_images/白板麻将牌正面_0905cb27.png";
  
  const actualBackImage = backImage || defaultBackImage;
  const actualFrontImage = frontImage || (isWinner ? defaultWinnerImage : defaultLoserImage);
  
  useEffect(() => {
    setCurrentPhase(phase);
  }, [phase, id]);
  // 获取动画类名
  const getAnimationClasses = () => {
    const baseClasses = "relative w-24 h-36 cursor-pointer transform-gpu perspective-1000";
    const positionClass = `tile-position-${id}`;
    
    switch (currentPhase) {
      case "initial":
        return `${baseClasses} tile-initial`;
      case "flying-in":
        return `${baseClasses} tile-flying-in`;
      case "showing-front":
        return `${baseClasses} transition-all duration-500`;
      case "flipping-back":
        return `${baseClasses} transition-all duration-700`;
      case "shuffling":
        return `${baseClasses} tile-shuffling ${positionClass}`;
      case "ready":
        return `${baseClasses} tile-ready ${!disabled ? "" : "pointer-events-none"}`;
      case "revealing":
        return `${baseClasses} tile-revealing`;
      case "revealed":
        return `${baseClasses} tile-revealed`;
      default:
        return baseClasses;
    }
  };
  
  // 获取卡片变换样式（简化以避免重复变换）
  const getCardTransform = () => {
    // 翻转效果（修复方向语义，确保显示正面时真正显示正面）
    if (currentPhase === "showing-front") {
      return "rotateY(180deg)";  // 显示正面（前图在180deg侧）
    } else if (currentPhase === "flipping-back" || currentPhase === "shuffling" || currentPhase === "ready") {
      return "rotateY(0deg)";    // 显示背面（背图在0deg侧）
    } else if (isFlipped) {
      return "rotateY(180deg)";
    }
    
    return "";
  };
  
  return (
    <div
      ref={cardRef}
      className={getAnimationClasses()}
      onClick={onClick}
      data-testid={`tile-${id}`}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 preserve-3d"
        style={{ 
          transformStyle: "preserve-3d",
          transform: getCardTransform()
        }}
      >
        {/* 背面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg shadow-lg backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
        >
          <img
            src={actualBackImage}
            alt="麻将牌背面"
            className="w-full h-full object-cover rounded-lg"
            data-testid={`tile-${id}-back`}
          />
        </div>

        {/* 正面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-lg shadow-lg backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <img
            src={actualFrontImage}
            alt={isWinner ? "红中" : "白板"}
            className="w-full h-full object-cover rounded-lg"
            data-testid={`tile-${id}-front`}
          />
        </div>
      </div>
    </div>
  );
};

export default MahjongTile;