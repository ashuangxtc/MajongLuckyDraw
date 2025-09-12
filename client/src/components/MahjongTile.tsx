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
  
  // 关键修复：完全防止结果泄露 - 只有在revealed阶段才显示真实结果
  const shouldShowActualResult = currentPhase === "revealed" || 
    (currentPhase === "showing-front");
    
  // 彻底修复：在revealing阶段绝对不显示真实结果，确保无任何泄露
  const actualFrontImage = frontImage || 
    (shouldShowActualResult && isWinner ? defaultWinnerImage : 
     shouldShowActualResult ? defaultLoserImage : defaultLoserImage);  // revealing期间始终显示白板
  
  
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
  
  // 获取卡片变换样式（确保正确的背面/正面显示）
  const getCardTransform = () => {
    // 在显示正面的阶段，翻转到正面
    if (currentPhase === "showing-front") {
      return "rotateY(180deg)";  // 显示正面（正面图片在180deg侧）
    }
    // 在以下阶段显示背面
    else if (currentPhase === "flipping-back" || currentPhase === "shuffling" || currentPhase === "ready") {
      return "rotateY(0deg)";    // 显示背面（背面图片在0deg侧）
    }
    // 揭示和揭示后阶段，根据翻牌状态决定
    else if (currentPhase === "revealing" || currentPhase === "revealed") {
      return isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
    }
    // 初始状态显示背面
    else if (currentPhase === "initial" || currentPhase === "flying-in") {
      return "rotateY(0deg)";
    }
    
    return "rotateY(0deg)";  // 默认显示背面
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
          transform: getCardTransform(),
          zIndex: currentPhase === "shuffling" ? `var(--fan-z, 1)` : 'auto'
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
            onError={(e) => {
              console.error(`Failed to load back image: ${actualBackImage}`, e);
            }}
            onLoad={() => {
              console.log(`Successfully loaded back image: ${actualBackImage}`);
            }}
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
            alt={shouldShowActualResult && isWinner ? "红中" : "白板"}
            className="w-full h-full object-cover rounded-lg"
            data-testid={`tile-${id}-front`}
            onError={(e) => {
              console.error(`Failed to load image: ${actualFrontImage}`, e);
            }}
            onLoad={() => {
              console.log(`Successfully loaded image: ${actualFrontImage}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MahjongTile;