import { useEffect, useState } from "react";
import { LottieSvg } from "lottie-react";

let cachedAnimation;
let animationRequest;

const loadAnimation = () => {
  if (cachedAnimation) return Promise.resolve(cachedAnimation);
  if (!animationRequest) {
    animationRequest = fetch("/lottie/empty-state.json")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Lottie animation");
        return response.json();
      })
      .then((data) => {
        cachedAnimation = data;
        return data;
      });
  }
  return animationRequest;
};

const LottieStateIcon = ({
  className = "h-32 w-32",
  label = "Empty state",
}) => {
  const [animationData, setAnimationData] = useState(cachedAnimation);

  useEffect(() => {
    if (animationData) return undefined;
    let active = true;
    loadAnimation()
      .then((data) => {
        if (active) setAnimationData(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [animationData]);

  if (!animationData) {
    return (
      <span
        className={`${className} inline-block animate-pulse rounded-full bg-[#dff8ef]`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={className} role="img" aria-label={label}>
      <LottieSvg
        src={animationData}
        loop
        autoplay={
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
        className="h-full w-full"
      />
    </div>
  );
};

export default LottieStateIcon;
