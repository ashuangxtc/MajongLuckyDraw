import { useState } from "react";

interface MahjongTileProps {
  id: number;
  isFlipped: boolean;
  isWinner?: boolean;
  onClick: () => void;
  disabled: boolean;
  isShuffling?: boolean;
}

const MahjongTile = ({
  id,
  isFlipped,
  isWinner,
  onClick,
  disabled,
  isShuffling = false,
}: MahjongTileProps) => {
  return (
    <div
      className={`relative w-20 h-28 cursor-pointer transform-gpu transition-transform duration-300 hover:scale-105 ${
        isShuffling ? "animate-shuffle" : ""
      } ${disabled ? "pointer-events-none" : ""}`}
      onClick={onClick}
      data-testid={`tile-${id}`}
    >
      <div
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-600 ${
          isFlipped ? "animate-flip" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 背面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-md shadow-lg backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <img
            src="/attached_assets/generated_images/麻将牌背面图案_324a01cc.png"
            alt="麻将牌背面"
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* 正面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-md shadow-lg backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
          }}
        >
          {isWinner ? (
            <img
              src="/attached_assets/generated_images/红中麻将牌正面_8a7f2e08.png"
              alt="红中"
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <img
              src="/attached_assets/generated_images/白板麻将牌正面_0905cb27.png"
              alt="白板"
              className="w-full h-full object-cover rounded-md"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MahjongTile;